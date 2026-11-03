import { Buffer } from "node:buffer";
import { assert, test } from "vite-plus/test";
import { Login } from "./mod.ts";

// Minimal stub of BaseClient.request — captures the NestedArray and
// methodName/path/protocol so the test can assert the wire shape.
function makeStubClient() {
	const captured: {
		value: unknown;
		methodName?: string;
		protocol?: number;
		path?: string;
	} = { value: undefined };
	return {
		captured,
		client: {
			request: {
				request: (
					value: unknown,
					methodName: string,
					protocol: number,
					_parse: boolean,
					path: string,
				) => {
					captured.value = value;
					captured.methodName = methodName;
					captured.protocol = protocol;
					captured.path = path;
					return Promise.resolve(null);
				},
			},
		},
	};
}

test("respondE2EELoginRequest — wire shape matches LINE Android smali fh8.c1", async () => {
	const stub = makeStubClient();
	// oxlint-disable-next-line no-explicit-any
	const login = new Login(stub.client as any);
	await login.respondE2EELoginRequest({
		verifier: "ver-x",
		publicKey: { version: 1, keyId: 2, keyData: Buffer.from([0xaa, 0xbb]) } as never,
		encryptedKeyChain: Buffer.from("enc"),
		hashKeyChain: Buffer.from("hash"),
		errorCode: 0,
	});
	assert.deepEqual(stub.captured.methodName, "respondE2EELoginRequest");
	assert.deepEqual(stub.captured.protocol, 4);
	assert.deepEqual(stub.captured.path, "/S4");
	const args = stub.captured.value as Array<[number, number, unknown]>;
	// fid:1 verifier (type 11)
	assert.deepEqual(args[0][0], 11);
	assert.deepEqual(args[0][1], 1);
	assert.deepEqual(args[0][2], "ver-x");
	// fid:2 publicKey (type 12 struct)
	assert.deepEqual(args[1][0], 12);
	assert.deepEqual(args[1][1], 2);
	const pkTuple = args[1][2] as Array<[number, number, unknown]>;
	assert.deepEqual(pkTuple[0], [8, 1, 1]);
	assert.deepEqual(pkTuple[1], [8, 2, 2]);
	assert.deepEqual((pkTuple[2][2] as Buffer)[0], 0xaa);
	// fid:3 encryptedKeyChain (11)
	assert.deepEqual(args[2][0], 11);
	assert.deepEqual(args[2][1], 3);
	// fid:4 hashKeyChain (11)
	assert.deepEqual(args[3][0], 11);
	assert.deepEqual(args[3][1], 4);
	// fid:5 errorCode (8)
	assert.deepEqual(args[4][0], 8);
	assert.deepEqual(args[4][1], 5);
	assert.deepEqual(args[4][2], 0);
});

test("respondE2EELoginRequest — errorCode defaults to 0 when omitted", async () => {
	const stub = makeStubClient();
	// oxlint-disable-next-line no-explicit-any
	const login = new Login(stub.client as any);
	await login.respondE2EELoginRequest({
		verifier: "v",
		publicKey: { version: 1, keyId: 2, keyData: Buffer.from([]) } as never,
		encryptedKeyChain: Buffer.from([]),
		hashKeyChain: Buffer.from([]),
	});
	const args = stub.captured.value as Array<[number, number, unknown]>;
	const errCode = args.find((a) => a[1] === 5)!;
	assert.deepEqual(errCode[2], 0);
});
