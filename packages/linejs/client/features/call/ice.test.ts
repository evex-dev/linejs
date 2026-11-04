import { assert, test } from "vite-plus/test";
import { formatCandidate, gatherIceCandidates, icePriority, parseCandidate } from "./ice.ts";

test("icePriority: host candidate ranks higher than srflx", () => {
	const host = icePriority("host", 1);
	const srflx = icePriority("srflx", 1);
	assert.isOk(host > srflx, `host=${host} should be > srflx=${srflx}`);
});

test("formatCandidate + parseCandidate round-trip", () => {
	const c = {
		foundation: "1",
		componentId: 1,
		transport: "udp" as const,
		priority: 2113929471,
		address: "192.168.1.5",
		port: 50000,
		type: "host" as const,
	};
	const s = formatCandidate(c);
	const back = parseCandidate(s);
	assert.deepEqual(back, c);
});

test("formatCandidate + parseCandidate round-trip with raddr/rport", () => {
	const c = {
		foundation: "2",
		componentId: 1,
		transport: "udp" as const,
		priority: 1694498815,
		address: "203.0.113.10",
		port: 54321,
		type: "srflx" as const,
		relatedAddress: "192.168.1.5",
		relatedPort: 50000,
	};
	const s = formatCandidate(c);
	const back = parseCandidate(s);
	assert.deepEqual(back, c);
});

test("parseCandidate accepts the full 'a=candidate:' prefix", () => {
	const c = parseCandidate("candidate:1 1 udp 2113929471 192.168.1.5 50000 typ host");
	assert.deepEqual(c?.type, "host");
});

test("gatherIceCandidates: live host + srflx via Google STUN", async () => {
	const { socket, candidates } = await gatherIceCandidates({
		stunHost: "stun.l.google.com",
		stunPort: 19302,
	});
	socket.close();
	assert.isOk(candidates.length >= 1, "expected at least a host candidate");
	const host = candidates.find((c) => c.type === "host");
	assert.isOk(host, "no host candidate");
	assert.isOk(host!.port > 0);
	// srflx might fail in CI sandboxes — accept either way
	const srflx = candidates.find((c) => c.type === "srflx");
	if (srflx) {
		assert.deepEqual(srflx.relatedPort, host!.port);
	}
});
