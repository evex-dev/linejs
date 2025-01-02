import type { MIDType } from "@evex/linejs-types";

export type MentionTarget = {
	all: true;
} | {
	all: false;
	mid: string;
};
export type DecorationsData = {
	text: string;
	emoji?: {
		productId: string;
		sticonId: string;
		version?: number;
		resourceType?: string;
		url?: string;
	};
	mention?:
		| {
			mid: string;
			all?: undefined;
		}
		| {
			mid?: undefined;
			all: boolean;
		};
};
export interface From {
	id: string
	type: MIDType
}
export interface To {
	id: string
	type: MIDType
}
