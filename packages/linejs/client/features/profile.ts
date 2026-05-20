import type * as line from "@evex/linejs-types";
import type { Client } from "../mod.ts";

/**
 * `ProfileAttribute` values from the Thrift schema (enum `Pb1_K6`).
 *
 * Used as the i32 key in `updateProfileAttributes` so the server knows
 * which subset of the profile is being modified.
 */
export const ProfileAttribute = {
	EMAIL: 1,
	DISPLAY_NAME: 2,
	PHONETIC_NAME: 4,
	PICTURE: 8,
	STATUS_MESSAGE: 16,
	ALLOW_SEARCH_BY_USERID: 32,
	ALLOW_SEARCH_BY_EMAIL: 64,
	BUDDY_STATUS: 128,
	MUSIC_PROFILE: 256,
	AVATAR_PROFILE: 512,
	HIDDEN_FROM_LIST: 1024,
} as const;
export type ProfileAttributeKey = keyof typeof ProfileAttribute;

/**
 * Friendly per-field update shape.  Each present key is translated into
 * a `(ProfileAttribute, ProfileContent)` map entry for the server.
 */
export interface MyProfileUpdate {
	displayName?: string;
	statusMessage?: string;
	phoneticName?: string;
	musicProfile?: string;
	allowSearchByUserid?: boolean;
	allowSearchByEmail?: boolean;
	hiddenFromList?: boolean;
}

function bool(v: boolean): string {
	return v ? "true" : "false";
}

function buildAttrMap(update: MyProfileUpdate): Record<number, line.ProfileContent> {
	const out: Record<number, line.ProfileContent> = {};
	const put = (attr: number, value: string) => {
		out[attr] = { value, meta: {} };
	};
	if (update.displayName !== undefined) {
		put(ProfileAttribute.DISPLAY_NAME, update.displayName);
	}
	if (update.statusMessage !== undefined) {
		put(ProfileAttribute.STATUS_MESSAGE, update.statusMessage);
	}
	if (update.phoneticName !== undefined) {
		put(ProfileAttribute.PHONETIC_NAME, update.phoneticName);
	}
	if (update.musicProfile !== undefined) {
		put(ProfileAttribute.MUSIC_PROFILE, update.musicProfile);
	}
	if (update.allowSearchByUserid !== undefined) {
		put(ProfileAttribute.ALLOW_SEARCH_BY_USERID, bool(update.allowSearchByUserid));
	}
	if (update.allowSearchByEmail !== undefined) {
		put(ProfileAttribute.ALLOW_SEARCH_BY_EMAIL, bool(update.allowSearchByEmail));
	}
	if (update.hiddenFromList !== undefined) {
		put(ProfileAttribute.HIDDEN_FROM_LIST, bool(update.hiddenFromList));
	}
	return out;
}

/**
 * Fetches the signed-in user's own profile (`talk.getProfile`).
 */
export async function getMyProfile(client: Client): Promise<line.Profile> {
	return await client.base.talk.getProfile({});
}

/**
 * Uploads a new profile picture for the signed-in user.
 *
 * LINE Android does this by POSTing the image bytes directly to
 * `/r/talk/p/<mid>` on OBS — the OBS edge writes the object, returns
 * its hash, and the next `getProfile` call shows the new
 * `pictureStatus` reflecting the new image.  No separate Thrift call
 * is needed.
 *
 * @param data  The image bytes (JPEG / PNG).
 * @returns OBS object id + hash. The new picture is live after this
 *          resolves; subsequent friends' `getContacts` will see it.
 */
export async function uploadMyProfileImage(
	client: Client,
	data: Blob,
): Promise<{ objId: string; objHash: string }> {
	const mid = client.base.profile?.mid;
	if (!mid) {
		throw new Error(
			"uploadMyProfileImage requires client to be logged in (no profile.mid)",
		);
	}
	const result = await client.base.obs.uploadObjectForService({
		data,
		oType: "image",
		obsPath: `talk/p/${mid}`,
	});
	return { objId: result.objId, objHash: result.objHash };
}

/**
 * Uploads a new profile-background image (the cover photo behind the
 * profile picture, visible on the user's profile page).
 *
 * Posts to OBS path `myhome/h` — same as a regular myhome photo post
 * — and the returned object id is the one to associate with the
 * profile in a follow-up call (LINE Android persists this association
 * via the myhome service; the OBS object alone is enough for the
 * image to be queryable).
 */
export async function uploadMyProfileBackground(
	client: Client,
	data: Blob,
): Promise<{ objId: string; objHash: string }> {
	const result = await client.base.obs.uploadObjectForService({
		data,
		oType: "image",
		obsPath: "myhome/h",
	});
	return { objId: result.objId, objHash: result.objHash };
}

/**
 * Updates one or more attributes on the signed-in user's profile.
 *
 * Server-side this is a single `updateProfileAttributes` RPC carrying
 * only the keys you actually changed — sparse, not a full replace.
 *
 * @example
 *   await client.updateMyProfile({ statusMessage: "離席中" });
 */
export async function updateMyProfile(
	client: Client,
	update: MyProfileUpdate,
): Promise<void> {
	const profileAttributes = buildAttrMap(update);
	if (Object.keys(profileAttributes).length === 0) return;
	await client.base.talk.updateProfileAttributes({
		reqSeq: await client.base.getReqseq(),
		request: { profileAttributes },
	});
}
