/**
 * `@evex/linejs-agent` — an LLM-backed agent surface for linejs.
 *
 * Wraps an Anthropic `messages.create` call with a default set of tools
 * that proxy through to a linejs {@link Client}: sending messages,
 * pulling recent history, looking up profile/calendar, etc.  Designed
 * to be plugged into a LINE bot loop so the bot can answer questions
 * using Claude while still having read/write access to the LINE side.
 *
 * The agent is **opt-in** about the tool surface — pass only the tools
 * you want exposed, or extend with your own implementations of
 * {@link AgentTool} (which is a Claude tool-use definition plus a
 * handler closure).  The default tool set is the conservative
 * read-and-respond profile.
 *
 * See `summarize.ts` for a one-shot summary helper that uses Claude
 * without setting up the full tool loop.
 *
 * @example
 *   import { Agent, defaultTools } from "@evex/linejs-agent";
 *   const agent = new Agent({
 *     client,
 *     anthropic: new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }),
 *     tools: defaultTools({ client, allowSend: true }),
 *     systemPrompt: "あなたはトークアシスタントです。日本語で回答してください。",
 *   });
 *   client.on("message", async (m) => {
 *     const reply = await agent.respond(m);
 *     if (reply) await m.chat.sendMessage(reply);
 *   });
 */
import type Anthropic from "@anthropic-ai/sdk";
import type { Client, TalkMessage } from "@evex/linejs";

/** A single Claude tool the agent can invoke. */
export interface AgentTool {
	/** Tool name as Claude sees it. */
	name: string;
	/** Short description shown to Claude. */
	description: string;
	/** JSON Schema for `input` (Claude tool-use shape). */
	input_schema: Record<string, unknown>;
	/** Server-side implementation invoked when Claude requests the tool. */
	run(input: Record<string, unknown>): Promise<unknown>;
}

export interface AgentOptions {
	client: Client;
	anthropic: Anthropic;
	tools: AgentTool[];
	/** Anthropic model id. Defaults to `claude-haiku-4-5`. */
	model?: string;
	/** Output token budget per turn. */
	maxTokens?: number;
	systemPrompt?: string;
	/** Cap on tool-use rounds before forcing a final answer. */
	maxToolIterations?: number;
}

export class Agent {
	#opts: Required<Omit<AgentOptions, "systemPrompt">> & {
		systemPrompt: string | undefined;
	};
	#toolsByName: Map<string, AgentTool>;

	constructor(opts: AgentOptions) {
		this.#opts = {
			client: opts.client,
			anthropic: opts.anthropic,
			tools: opts.tools,
			model: opts.model ?? "claude-haiku-4-5",
			maxTokens: opts.maxTokens ?? 1024,
			systemPrompt: opts.systemPrompt,
			maxToolIterations: opts.maxToolIterations ?? 8,
		};
		this.#toolsByName = new Map(opts.tools.map((t) => [t.name, t]));
	}

	/**
	 * Single-turn response.  Pass a `TalkMessage` (from
	 * `client.on("message", ...)`) or just a string of context.
	 * Returns the model's final text reply, or `null` if the model
	 * declined to answer.
	 */
	async respond(input: TalkMessage | string): Promise<string | null> {
		const userText = typeof input === "string"
			? input
			: (input.raw.text ?? `(${input.raw.contentType ?? "non-text"} message)`);
		const messages: Anthropic.Messages.MessageParam[] = [
			{ role: "user", content: userText },
		];
		return await this.#loop(messages);
	}

	async #loop(messages: Anthropic.Messages.MessageParam[]): Promise<string | null> {
		const toolDefs = this.#opts.tools.map((t) => ({
			name: t.name,
			description: t.description,
			input_schema: t.input_schema,
		}));
		for (let i = 0; i < this.#opts.maxToolIterations; i++) {
			const resp = await this.#opts.anthropic.messages.create({
				model: this.#opts.model,
				max_tokens: this.#opts.maxTokens,
				...(this.#opts.systemPrompt ? { system: this.#opts.systemPrompt } : {}),
				...(toolDefs.length ? { tools: toolDefs as never } : {}),
				messages,
			});
			if (resp.stop_reason !== "tool_use") {
				return collectText(resp.content);
			}
			messages.push({ role: "assistant", content: resp.content });
			const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];
			for (const block of resp.content) {
				if (block.type !== "tool_use") continue;
				const tool = this.#toolsByName.get(block.name);
				if (!tool) {
					toolResults.push({
						type: "tool_result",
						tool_use_id: block.id,
						content: `tool ${block.name} not registered`,
						is_error: true,
					});
					continue;
				}
				try {
					const result = await tool.run(block.input as Record<string, unknown>);
					toolResults.push({
						type: "tool_result",
						tool_use_id: block.id,
						content: typeof result === "string"
							? result
							: JSON.stringify(result),
					});
				} catch (e) {
					toolResults.push({
						type: "tool_result",
						tool_use_id: block.id,
						content: e instanceof Error ? e.message : String(e),
						is_error: true,
					});
				}
			}
			messages.push({ role: "user", content: toolResults });
		}
		return null;
	}
}

function collectText(content: Anthropic.Messages.ContentBlock[]): string | null {
	const chunks: string[] = [];
	for (const b of content) {
		if (b.type === "text") chunks.push(b.text);
	}
	return chunks.length ? chunks.join("") : null;
}

/**
 * Default agent tools that proxy to a linejs Client.  Pass
 * `allowSend: true` to expose the message-send tool; otherwise the
 * agent can only read.
 */
export function defaultTools(
	opts: { client: Client; allowSend?: boolean },
): AgentTool[] {
	const { client, allowSend = false } = opts;
	const tools: AgentTool[] = [
		{
			name: "get_my_profile",
			description: "Look up the signed-in user's own LINE profile (display name, status message, etc).",
			input_schema: { type: "object", properties: {}, required: [] },
			run: async () => await client.getMyProfile(),
		},
		{
			name: "get_recent_messages",
			description: "Fetch the most recent messages from a LINE chat. Pass the chat mid and a limit.",
			input_schema: {
				type: "object",
				properties: {
					chatMid: { type: "string", description: "Chat mid (chat room id)." },
					limit: { type: "integer", default: 20, minimum: 1, maximum: 200 },
				},
				required: ["chatMid"],
			},
			run: async (input) => {
				const chatMid = String(input.chatMid);
				const limit = typeof input.limit === "number" ? input.limit : 20;
				const chat = await client.getChat(chatMid);
				const msgs = await chat.fetchMessages(limit);
				return msgs.map((m) => ({
					from: m.raw.from,
					text: m.raw.text ?? null,
					createdTime: m.raw.createdTime,
					contentType: m.raw.contentType,
				}));
			},
		},
		{
			name: "get_user_profile",
			description: "Look up a friend's LINE profile by mid.",
			input_schema: {
				type: "object",
				properties: {
					mid: { type: "string", description: "User mid." },
				},
				required: ["mid"],
			},
			run: async (input) => {
				const u = await client.getUser(String(input.mid));
				return u.raw;
			},
		},
	];
	if (allowSend) {
		tools.push({
			name: "send_message",
			description: "Send a text message to a LINE chat.",
			input_schema: {
				type: "object",
				properties: {
					chatMid: { type: "string", description: "Destination chat mid." },
					text: { type: "string", description: "Message text." },
				},
				required: ["chatMid", "text"],
			},
			run: async (input) => {
				const chatMid = String(input.chatMid);
				const text = String(input.text);
				const chat = await client.getChat(chatMid);
				const sent = await chat.sendMessage(text);
				return { ok: true, messageId: sent.raw.id ?? null };
			},
		});
	}
	return tools;
}
