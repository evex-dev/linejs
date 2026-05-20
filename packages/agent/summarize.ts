/**
 * `summarizeMessages` — a one-shot helper that renders a list of LINE
 * messages as a short natural-language summary using Claude.
 *
 * No tool loop, no agent state — just a single `messages.create` call.
 * Useful for daily/weekly chat digests, or for catching up on a busy
 * group chat in one read.
 */
import type Anthropic from "@anthropic-ai/sdk";
import type { TalkMessage } from "@evex/linejs";

export interface SummarizeOptions {
	anthropic: Anthropic;
	messages: TalkMessage[];
	/** Optional instructions (style, language, length). */
	instructions?: string;
	model?: string;
	maxTokens?: number;
}

export async function summarizeMessages(
	opts: SummarizeOptions,
): Promise<string> {
	const lines: string[] = [];
	for (const m of opts.messages) {
		const from = m.raw.from ?? "?";
		const text = m.raw.text ?? `(${m.raw.contentType ?? "non-text"})`;
		lines.push(`${from}: ${text}`);
	}
	const transcript = lines.join("\n");
	const sys = opts.instructions
		? `${opts.instructions}\n\n以下はLINEトークの抜粋です。要点を短くまとめてください。`
		: "以下はLINEトークの抜粋です。誰がどんな話をしたか、要点を箇条書きで日本語で簡潔にまとめてください。";

	const resp = await opts.anthropic.messages.create({
		model: opts.model ?? "claude-haiku-4-5",
		max_tokens: opts.maxTokens ?? 512,
		system: sys,
		messages: [{ role: "user", content: transcript }],
	});
	const chunks: string[] = [];
	for (const b of resp.content) {
		if (b.type === "text") chunks.push(b.text);
	}
	return chunks.join("").trim();
}
