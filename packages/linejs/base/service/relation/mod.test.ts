import { assertEquals } from "@std/assert";
import {
	type NestedArray,
	Protocols,
} from "../../thrift/readwrite/declares.ts";
import { readThrift } from "../../thrift/readwrite/read.ts";
import { writeThrift } from "../../thrift/readwrite/write.ts";
import { RelationService } from "./mod.ts";

interface RequestCall {
	value: unknown;
	methodName: string;
	protocol: number;
	parse: boolean | string;
	path: string;
}

function makeStubClient() {
	const calls: RequestCall[] = [];
	return {
		calls,
		client: {
			getReqseq: () => Promise.resolve(42),
			request: {
				request(
					value: unknown,
					methodName: string,
					protocol: number,
					parse: boolean | string,
					path: string,
				) {
					calls.push({ value, methodName, protocol, parse, path });
					if (methodName === "findContactBySearchIdOrTicketV3") {
						return Promise.resolve({ mid: "u-resolved" });
					}
					return Promise.resolve({});
				},
			},
		},
	};
}

function decodeAddFriendRequest(value: unknown) {
	return readThrift(
		writeThrift(value as NestedArray, "addFriendByMid", Protocols[4]),
		Protocols[4],
	).data;
}

Deno.test("addFriendByMid serializes the RE4 request envelope and tracking metadata", async () => {
	const stub = makeStubClient();
	const relation = new RelationService(stub.client as never);

	await relation.addFriendByMid({
		mid: "u-target",
		reference: '{"screen":"groupMemberList","spec":"native"}',
		trackingMetaType: 5,
		trackingMetaHint: "c-group",
	});

	assertEquals(
		stub.calls.map(({ methodName, protocol, parse, path }) => ({
			methodName,
			protocol,
			parse,
			path,
		})),
		[{
			methodName: "addFriendByMid",
			protocol: 4,
			parse: true,
			path: "/RE4",
		}],
	);
	assertEquals(decodeAddFriendRequest(stub.calls[0]!.value), {
		1: {
			1: 42,
			2: "u-target",
			3: {
				1: '{"screen":"groupMemberList","spec":"native"}',
				2: {
					5: { 1: "c-group" },
				},
			},
		},
	});
});

Deno.test("addFriendByUserId uses bySearchId provenance", async () => {
	const stub = makeStubClient();
	const relation = new RelationService(stub.client as never);

	await relation.addFriendByUserId({ userId: "alice" });

	assertEquals(
		stub.calls.map(({ methodName, protocol, parse, path }) => ({
			methodName,
			protocol,
			parse,
			path,
		})),
		[
			{
				methodName: "findContactBySearchIdOrTicketV3",
				protocol: 4,
				parse: "Contact",
				path: "/RE4",
			},
			{
				methodName: "addFriendByMid",
				protocol: 4,
				parse: true,
				path: "/RE4",
			},
		],
	);
	assertEquals(decodeAddFriendRequest(stub.calls[1]!.value), {
		1: {
			1: 42,
			2: "u-resolved",
			3: {
				1: '{"screen":"friendAdd:idSearch","spec":"native"}',
				2: {
					3: { 1: "alice" },
				},
			},
		},
	});
});
