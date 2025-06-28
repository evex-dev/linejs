import type { EmojiMeta, MentionMeta } from "./internal-types.ts";
import type { DecorationsData } from "./types.ts";

/**
 * Build text decorations (emoji,mention)
 */
export const buildTextDecorations = (decorationText: DecorationsData[]): [
	string,
	{
		REPLACE?: string;
		STICON_OWNERSHIP?: string;
		MENTION?: string;
	},
] => {
	let text = "";
	let hasMention = false;
	let hasEmoji = false;
	const _contentMetadata = {
		REPLACE: `{
			sticon: {
				resources: [],
			},
		}`,
		STICON_OWNERSHIP: `[]`,
		MENTION: `{
			MENTIONEES: [],
		}`,
	};
	decorationText.forEach((e) => {
		if (e.emoji) {
			if (!e.text) {
				e.text = "(linejs)";
			}
			hasEmoji = true;
			const replace = JSON.parse(
				_contentMetadata.REPLACE!,
			) as EmojiMeta["REPLACE"];
			replace.sticon.resources.push({
				S: text.length,
				E: text.length + e.text.length,
				productId: e.emoji.productId,
				sticonId: e.emoji.sticonId,
				version: e.emoji.version || 1,
				resourceType: e.emoji.resourceType || "STATIC",
			});
			_contentMetadata.REPLACE = JSON.stringify(replace);
			const sticon = JSON.parse(
				_contentMetadata.STICON_OWNERSHIP!,
			) as EmojiMeta["STICON_OWNERSHIP"];
			if (
				!sticon.includes(
					e.emoji.productId,
				)
			) {
				sticon!.push(e.emoji.productId);
			}
			_contentMetadata.STICON_OWNERSHIP = JSON.stringify(sticon);
		} else if (e.mention) {
			if (!e.text) {
				e.text = "@unknown";
			}
			hasMention = true;
			if (e.mention.all) {
				const mention = JSON.parse(
					_contentMetadata.MENTION!,
				) as MentionMeta["MENTION"];

				mention.MENTIONEES ??= [];
				mention.MENTIONEES.push({
					S: text.length.toString(),
					E: (text.length + e.text.length).toString(),
					A: "1",
				});

				_contentMetadata.MENTION = JSON.stringify(mention);
			} else {
				const mention = JSON.parse(
					_contentMetadata.MENTION!,
				) as MentionMeta["MENTION"];

				mention.MENTIONEES ??= [];
				mention.MENTIONEES.push({
					S: text.length.toString(),
					E: (text.length + e.text.length).toString(),
					M: e.mention.mid,
				});

				_contentMetadata.MENTION = JSON.stringify(mention);
			}
		}
		text += e.text || "";
	});
	const contentMetadata: {
		REPLACE?: string;
		STICON_OWNERSHIP?: string;
		MENTION?: string;
	} = {
		REPLACE: _contentMetadata.REPLACE,
		STICON_OWNERSHIP: _contentMetadata.STICON_OWNERSHIP,
		MENTION: _contentMetadata.MENTION,
	};
	if (!hasEmoji) {
		delete contentMetadata.REPLACE;
		delete contentMetadata.STICON_OWNERSHIP;
	}
	if (!hasMention) {
		delete contentMetadata.MENTION;
	}
	return [text, contentMetadata];
};
