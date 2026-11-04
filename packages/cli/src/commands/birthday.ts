import type { CommandSpec } from "../command.ts";
import { UsageError } from "../errors.ts";
import { formatJson } from "../output.ts";
import { withClient } from "../session.ts";

const cardOptions = [
	{
		name: "celebrator",
		type: "string",
		valueName: "mid",
		description: "Celebrator MID (required when creating).",
	},
	{ name: "from", type: "string", valueName: "name", description: "From enum name." },
	{ name: "template", type: "string", valueName: "id", description: "Card template id." },
	{
		name: "card-status",
		type: "string",
		valueName: "status",
		description: "Card status (default PUBLIC).",
	},
] as const;

function cardInput(
	context: import("../context.ts").CommandContext,
	boardId: string,
	textIndex: number,
) {
	const text = context.rest(textIndex);
	return {
		boardId,
		cardStatus: context.getString("card-status") ?? "PUBLIC",
		text,
		celebratorMid: context.getString("celebrator"),
		from: context.getString("from"),
		templateId: context.getString("template"),
	};
}

function formatBirthday(value: unknown): string {
	const result = value as { code?: number; message?: string; result?: unknown };
	if (result.code !== undefined && result.code !== 0) {
		return `Birthday Board error ${result.code}: ${result.message ?? ""}`;
	}
	return result.result === undefined || result.result === null ? "OK" : formatJson(result.result);
}

const boardIdCommand: CommandSpec = {
	name: "birthday board-id",
	summary: "Get the birthday board id for a home/chat.",
	category: "Birthday Board",
	args: [{ name: "homeId", description: "Home or chat MID.", required: true }],
	examples: ["line birthday board-id cxxxxxxxx"],
	auth: true,
	async run(context) {
		const homeId = context.requireArg(0, "homeId");
		return await withClient(context, async ({ client }) => {
			return await client.birthdayBoard.getBoardId(homeId);
		});
	},
	format: formatBirthday,
};

const boardCommand: CommandSpec = {
	name: "birthday board",
	summary: "Get a birthday board.",
	category: "Birthday Board",
	args: [
		{ name: "boardId", description: "Board id.", required: true },
		{ name: "cardId", description: "Optional card id.", required: false },
	],
	examples: ["line birthday board BOARD"],
	auth: true,
	async run(context) {
		const boardId = context.requireArg(0, "boardId");
		return await withClient(context, async ({ client }) => {
			return await client.birthdayBoard.getBoard(boardId, context.arg(1));
		});
	},
	format: formatBirthday,
};

const cardsCommand: CommandSpec = {
	name: "birthday cards",
	summary: "List birthday cards.",
	category: "Birthday Board",
	args: [{ name: "boardId", description: "Board id.", required: true }],
	options: [
		{ name: "scroll", type: "string", valueName: "scrollId", description: "Pagination scroll id." },
	],
	examples: ["line birthday cards BOARD"],
	auth: true,
	async run(context) {
		const boardId = context.requireArg(0, "boardId");
		return await withClient(context, async ({ client }) => {
			return await client.birthdayBoard.listCards({
				boardId,
				scrollId: context.getString("scroll"),
			});
		});
	},
	format: formatBirthday,
};

const celebrationsCommand: CommandSpec = {
	name: "birthday celebrations",
	summary: "List birthday celebrations.",
	category: "Birthday Board",
	args: [{ name: "boardId", description: "Board id.", required: true }],
	options: [
		{ name: "scroll", type: "string", valueName: "scrollId", description: "Pagination scroll id." },
	],
	examples: ["line birthday celebrations BOARD"],
	auth: true,
	async run(context) {
		const boardId = context.requireArg(0, "boardId");
		return await withClient(context, async ({ client }) => {
			return await client.birthdayBoard.listCelebrations({
				boardId,
				scrollId: context.getString("scroll"),
			});
		});
	},
	format: formatBirthday,
};

const likesCommand: CommandSpec = {
	name: "birthday likes",
	summary: "List likes on a birthday card.",
	category: "Birthday Board",
	args: [
		{ name: "boardId", description: "Board id.", required: true },
		{ name: "cardId", description: "Card id.", required: true },
	],
	examples: ["line birthday likes BOARD CARD"],
	auth: true,
	async run(context) {
		const boardId = context.requireArg(0, "boardId");
		const cardId = context.requireArg(1, "cardId");
		return await withClient(context, async ({ client }) => {
			return await client.birthdayBoard.listCardLikes(boardId, cardId);
		});
	},
	format: formatBirthday,
};

const templatesCommand: CommandSpec = {
	name: "birthday templates",
	summary: "List birthday card templates.",
	category: "Birthday Board",
	examples: ["line birthday templates"],
	auth: true,
	async run(context) {
		return await withClient(context, async ({ client }) => {
			return await client.birthdayBoard.listCardTemplates();
		});
	},
	format: formatBirthday,
};

const createCommand: CommandSpec = {
	name: "birthday create",
	summary: "Create a birthday card.",
	category: "Birthday Board",
	args: [
		{ name: "boardId", description: "Board id.", required: true },
		{ name: "text", description: "Card text.", required: true },
	],
	options: cardOptions,
	examples: ["line birthday create BOARD 'Happy birthday!' --celebrator uxxxxxxxx"],
	auth: true,
	async run(context) {
		const boardId = context.requireArg(0, "boardId");
		return await withClient(context, async ({ client }) => {
			const input = cardInput(context, boardId, 1);
			return await client.birthdayBoard.createCard(input as never);
		});
	},
	format: formatBirthday,
};

const updateCommand: CommandSpec = {
	name: "birthday update",
	summary: "Update a birthday card.",
	category: "Birthday Board",
	args: [
		{ name: "boardId", description: "Board id.", required: true },
		{ name: "cardId", description: "Card id.", required: true },
		{ name: "text", description: "Card text.", required: true },
	],
	options: cardOptions,
	examples: ["line birthday update BOARD CARD 'Edited'"],
	auth: true,
	async run(context) {
		const boardId = context.requireArg(0, "boardId");
		const cardId = context.requireArg(1, "cardId");
		return await withClient(context, async ({ client }) => {
			const input = cardInput(context, boardId, 2);
			return await client.birthdayBoard.updateCard({ ...input, cardId } as never);
		});
	},
	format: formatBirthday,
};

function simpleCommand(options: {
	name: string;
	summary: string;
	args: CommandSpec["args"];
	action: (
		board: import("@evex-dev/linejs").Client["birthdayBoard"],
		context: import("../context.ts").CommandContext,
	) => Promise<unknown>;
	needsYes?: boolean;
}): CommandSpec {
	return {
		name: options.name,
		summary: options.summary,
		category: "Birthday Board",
		args: options.args,
		options: options.needsYes
			? [{ name: "yes", type: "boolean", description: "Confirm the destructive action." }]
			: [],
		examples: [`line ${options.name} BOARD`],
		auth: true,
		async run(context) {
			if (options.needsYes && !context.getBool("yes")) {
				throw new UsageError("Pass --yes to confirm this destructive action");
			}
			return await withClient(context, async ({ client }) => {
				return await options.action(client.birthdayBoard, context);
			});
		},
		format: formatBirthday,
	};
}

export const birthdayCommands: CommandSpec[] = [
	boardIdCommand,
	boardCommand,
	cardsCommand,
	celebrationsCommand,
	likesCommand,
	templatesCommand,
	createCommand,
	updateCommand,
	simpleCommand({
		name: "birthday delete",
		summary: "Delete a birthday card.",
		args: [
			{ name: "boardId", description: "Board id.", required: true },
			{ name: "cardId", description: "Card id.", required: true },
		],
		needsYes: true,
		action: (board, context) =>
			board.deleteCard(context.requireArg(0, "boardId"), context.requireArg(1, "cardId")),
	}),
	simpleCommand({
		name: "birthday delete-board",
		summary: "Delete a birthday board.",
		args: [{ name: "boardId", description: "Board id.", required: true }],
		needsYes: true,
		action: (board, context) => board.deleteBoard(context.requireArg(0, "boardId")),
	}),
	simpleCommand({
		name: "birthday permission",
		summary: "Update birthday board read permission.",
		args: [
			{ name: "boardId", description: "Board id.", required: true },
			{ name: "count", description: "Read permission count.", required: true },
		],
		action: (board, context) =>
			board.updateReadPermission(
				context.requireArg(0, "boardId"),
				Number(context.requireArg(1, "count")),
			),
	}),
	simpleCommand({
		name: "birthday like",
		summary: "Like a birthday card.",
		args: [
			{ name: "boardId", description: "Board id.", required: true },
			{ name: "cardId", description: "Card id.", required: true },
		],
		action: (board, context) =>
			board.createCardLike(context.requireArg(0, "boardId"), context.requireArg(1, "cardId")),
	}),
	simpleCommand({
		name: "birthday unlike",
		summary: "Remove a like from a birthday card.",
		args: [
			{ name: "boardId", description: "Board id.", required: true },
			{ name: "cardId", description: "Card id.", required: true },
		],
		action: (board, context) =>
			board.cancelCardLike(context.requireArg(0, "boardId"), context.requireArg(1, "cardId")),
	}),
	simpleCommand({
		name: "birthday celebrate",
		summary: "Celebrate a birthday board.",
		args: [{ name: "boardId", description: "Board id.", required: true }],
		action: (board, context) => board.celebrate(context.requireArg(0, "boardId")),
	}),
	simpleCommand({
		name: "birthday cancel-celebration",
		summary: "Cancel a birthday board celebration.",
		args: [{ name: "boardId", description: "Board id.", required: true }],
		action: (board, context) => board.cancelCelebration(context.requireArg(0, "boardId")),
	}),
	simpleCommand({
		name: "birthday report",
		summary: "Report a birthday card.",
		args: [
			{ name: "boardId", description: "Board id.", required: true },
			{ name: "cardId", description: "Card id.", required: true },
		],
		action: (board, context) =>
			board.reportCard(context.requireArg(0, "boardId"), context.requireArg(1, "cardId")),
	}),
];
