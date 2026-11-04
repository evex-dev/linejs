import { assert, test } from "vite-plus/test";
import { Client } from "./client.ts";

function buildClient(opts: {
	friendMids: string[];
	v3?: (req: { mids: string[] }) => Promise<unknown> | unknown;
	v2?: (req: { mids: string[] }) => Promise<unknown> | unknown;
}) {
	const base = {
		profile: { mid: "u-self" },
		relation: {
			getUserFriendIds: () => Promise.resolve({ userFriendMids: opts.friendMids }),
			getContactsV3:
				opts.v3 ??
				(() => {
					throw new Error("API method not capable: 'getContactsV3'");
				}),
		},
		talk: {
			getContactsV2:
				opts.v2 ??
				(() => {
					throw new Error("API method not capable: 'getContactsV2'");
				}),
		},
	};
	return new Client(base as never);
}

test("fetchUsers — empty friend list → empty result", async () => {
	const client = buildClient({ friendMids: [] });
	const users = await client.fetchUsers();
	assert.deepEqual(users.length, 0);
});

test("fetchUsers — V3 path", async () => {
	const client = buildClient({
		friendMids: ["u-a", "u-b"],
		v3: () =>
			Promise.resolve({
				responses: [
					{ targetUserMid: "u-a", displayName: "Alice" },
					{ targetUserMid: "u-b", displayName: "Bob" },
				],
			}),
	});
	const users = await client.fetchUsers();
	assert.deepEqual(users.length, 2);
	assert.deepEqual(users[0].mid, "u-a");
	assert.deepEqual(users[1].mid, "u-b");
});

test("fetchUsers — V2 fallback when V3 not capable", async () => {
	const client = buildClient({
		friendMids: ["u-x"],
		v3: () => {
			throw new Error("API method not capable: 'getContactsV3'");
		},
		v2: () =>
			Promise.resolve({
				contacts: { "u-x": { displayName: "Xeno", userStatus: 0 } },
			}),
	});
	const users = await client.fetchUsers();
	assert.deepEqual(users.length, 1);
	assert.deepEqual(users[0].mid, "u-x");
});

test("fetchUsers — non-capability errors are rethrown", async () => {
	const client = buildClient({
		friendMids: ["u-z"],
		v3: () => {
			throw new Error("AUTHENTICATION_FAILED");
		},
	});
	let err: unknown;
	try {
		await client.fetchUsers();
	} catch (e) {
		err = e;
	}
	assert.isOk(err instanceof Error);
	assert.deepEqual((err as Error).message, "AUTHENTICATION_FAILED");
});

for (const count of [100, 101, 250]) {
	for (const version of ["v3", "v2"] as const) {
		test(`fetchUsers — ${version} batches ${count} friends`, async () => {
			const friendMids = Array.from({ length: count }, (_, i) => `u-${i}`);
			const requests: string[][] = [];
			const client = buildClient({
				friendMids,
				[version]: ({ mids }: { mids: string[] }) => {
					requests.push(mids);
					assert.isAtMost(mids.length, 100);
					return version === "v3"
						? { responses: mids.map((mid) => ({ targetUserMid: mid })) }
						: { contacts: Object.fromEntries(mids.map((mid) => [mid, {}])) };
				},
			});

			const users = await client.fetchUsers();
			assert.deepEqual(
				requests.map((mids) => mids.length),
				count === 100 ? [100] : count === 101 ? [100, 1] : [100, 100, 50],
			);
			assert.deepEqual(requests.flat(), friendMids);
			assert.deepEqual(
				users.map((user) => user.mid),
				friendMids,
			);
		});
	}
}

test("fetchUsers — V2 capability failure falls back to per-user getUser", async () => {
	const friendMids = Array.from({ length: 101 }, (_, i) => `u-${i}`);
	const client = buildClient({ friendMids });
	const requests: string[] = [];
	client.getUser = async (mid) => {
		requests.push(mid);
		if (mid === "u-0") throw new Error("unreachable");
		return { mid } as Awaited<ReturnType<Client["getUser"]>>;
	};

	const users = await client.fetchUsers();
	assert.deepEqual(requests, friendMids);
	assert.deepEqual(
		users.map((user) => user.mid),
		friendMids.slice(1),
	);
});
