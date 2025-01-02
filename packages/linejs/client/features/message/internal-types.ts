export interface StickerMetadata {
	STKPKGID: string;
	STKID: string;
	STKTXT: string;
	STKVER: string;
	STKOPT?: string;
}
export interface EmojiMeta {
	REPLACE: {
		sticon: {
			resources: {
				S: number;
				E: number;
				productId: string;
				sticonId: string;
				version: number;
				resourceType: string;
			}[];
		};
	};
	STICON_OWNERSHIP: string[];
}
export interface MentionMeta {
	MENTION: {
		MENTIONEES: {
			M?: string;
			S: string;
			E: string;
			A?: string;
		}[];
	};
}
export interface ContactMeta {
	mid: string;
	displayName: string;
}
export interface FlexMeta {
	FLEX_VER: string;
	FLEX_JSON: Record<string, unknown>;
	ALT_TEXT: string;
	EFFECT_TAG?: string;
}
export interface FileMeta {
	FILE_SIZE: string;
	FILE_EXPIRE_TIMESTAMP: string;
	FILE_NAME: string;
}
