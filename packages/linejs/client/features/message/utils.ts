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
	const _contentMetadata: Partial<EmojiMeta & MentionMeta> = {
		REPLACE: {
			sticon: {
				resources: [],
			},
		},
		STICON_OWNERSHIP: [],
		MENTION: {
			MENTIONEES: [],
		},
	};
	decorationText.forEach((e) => {
		if (e.emoji) {
			if (!e.text) {
				e.text = "(linejs)";
			}
			hasEmoji = true;
			_contentMetadata.REPLACE!.sticon.resources.push({
				S: text.length,
				E: text.length + e.text.length,
				productId: e.emoji.productId,
				sticonId: e.emoji.sticonId,
				version: e.emoji.version || 1,
				resourceType: e.emoji.resourceType || "STATIC",
			});
			if (
				!_contentMetadata.STICON_OWNERSHIP?.includes(
					e.emoji.productId,
				)
			) {
				_contentMetadata.STICON_OWNERSHIP!.push(e.emoji.productId);
			}
		} else if (e.mention) {
			if (!e.text) {
				e.text = "@unknown";
			}
			hasMention = true;
			if (e.mention.all) {
				_contentMetadata.MENTION!.MENTIONEES.push({
					S: text.length.toString(),
					E: (text.length + e.text.length).toString(),
					A: "1",
				});
			} else {
				_contentMetadata.MENTION!.MENTIONEES.push({
					S: text.length.toString(),
					E: (text.length + e.text.length).toString(),
					M: e.mention.mid,
				});
			}
		}
		text += e.text || "";
	});
	const contentMetadata: {
		REPLACE?: string;
		STICON_OWNERSHIP?: string;
		MENTION?: string;
	} = {
		REPLACE: JSON.stringify(_contentMetadata.REPLACE),
		STICON_OWNERSHIP: JSON.stringify(_contentMetadata.STICON_OWNERSHIP),
		MENTION: JSON.stringify(_contentMetadata.MENTION),
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
