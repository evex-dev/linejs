// ICE (RFC 8445) — minimal candidate gathering and SDP serialization.
// Implements `host` candidates (local interface) and `srflx`
// candidates (via STUN). TURN/relay candidates are out of scope.

import dgram from "node:dgram";
import { Buffer } from "node:buffer";
import {
	buildBindingRequestAsync,
	parseStun,
	readMappedAddress,
} from "./stun.ts";

export type IceCandidateType = "host" | "srflx" | "prflx" | "relay";

export interface IceCandidate {
	foundation: string;
	componentId: number;
	transport: "udp";
	priority: number;
	address: string;
	port: number;
	type: IceCandidateType;
	relatedAddress?: string;
	relatedPort?: number;
}

/** Compute the standard ICE priority for a candidate. */
export function icePriority(type: IceCandidateType, componentId: number, localPref = 65535): number {
	const typePref = type === "host" ? 126 : type === "srflx" ? 100 : type === "prflx" ? 110 : 0;
	return ((typePref << 24) | (localPref << 8) | (256 - componentId)) >>> 0;
}

/** Format a candidate as the `candidate:` line value (the bit after `a=`). */
export function formatCandidate(c: IceCandidate): string {
	let s = `candidate:${c.foundation} ${c.componentId} ${c.transport} ${c.priority} ${c.address} ${c.port} typ ${c.type}`;
	if (c.relatedAddress && c.relatedPort !== undefined) {
		s += ` raddr ${c.relatedAddress} rport ${c.relatedPort}`;
	}
	return s;
}

export function parseCandidate(value: string): IceCandidate | null {
	// `candidate:1 1 udp 2113929471 192.168.1.5 50000 typ host`
	const v = value.startsWith("candidate:") ? value.slice(10) : value;
	const parts = v.split(/\s+/);
	if (parts.length < 8 || parts[6] !== "typ") return null;
	const c: IceCandidate = {
		foundation: parts[0],
		componentId: Number(parts[1]),
		transport: "udp",
		priority: Number(parts[3]),
		address: parts[4],
		port: Number(parts[5]),
		type: parts[7] as IceCandidateType,
	};
	for (let i = 8; i < parts.length - 1; i += 2) {
		if (parts[i] === "raddr") c.relatedAddress = parts[i + 1];
		else if (parts[i] === "rport") c.relatedPort = Number(parts[i + 1]);
	}
	return c;
}

/** Gather a host candidate for the local UDP socket. */
export async function gatherHost(sock: dgram.Socket): Promise<IceCandidate> {
	const addr = sock.address() as { address: string; port: number };
	// Try to pick a non-loopback interface address.
	let host = addr.address;
	if (host === "0.0.0.0" || host === "127.0.0.1") {
		const os = await import("node:os");
		const ifaces = os.networkInterfaces();
		for (const list of Object.values(ifaces)) {
			for (const i of list ?? []) {
				if (i.family === "IPv4" && !i.internal) {
					host = i.address;
					break;
				}
			}
			if (host !== "0.0.0.0" && host !== "127.0.0.1") break;
		}
	}
	return {
		foundation: "1",
		componentId: 1,
		transport: "udp",
		priority: icePriority("host", 1),
		address: host,
		port: addr.port,
		type: "host",
	};
}

/** Gather a server-reflexive candidate by Binding-Request the STUN server. */
export async function gatherSrflx(
	sock: dgram.Socket,
	stunHost: string,
	stunPort = 3478,
	timeoutMs = 5000,
): Promise<IceCandidate | null> {
	const req = await buildBindingRequestAsync({});
	const reply = new Promise<Uint8Array | null>((res) => {
		const t = setTimeout(() => res(null), timeoutMs);
		const onMsg = (buf: Buffer) => {
			clearTimeout(t);
			sock.off("message", onMsg);
			res(new Uint8Array(buf));
		};
		sock.on("message", onMsg);
	});
	await new Promise<void>((res, rj) =>
		sock.send(Buffer.from(req), stunPort, stunHost, (e) => e ? rj(e) : res())
	);
	const buf = await reply;
	if (!buf) return null;
	const msg = parseStun(buf);
	const addr = readMappedAddress(msg);
	if (!addr) return null;
	const local = sock.address() as { address: string; port: number };
	return {
		foundation: "2",
		componentId: 1,
		transport: "udp",
		priority: icePriority("srflx", 1),
		address: addr.host,
		port: addr.port,
		type: "srflx",
		relatedAddress: local.address,
		relatedPort: local.port,
	};
}

/** Gather both host + srflx candidates on a fresh UDP socket. */
export async function gatherIceCandidates(opts?: {
	stunHost?: string;
	stunPort?: number;
	localPort?: number;
}): Promise<{ socket: dgram.Socket; candidates: IceCandidate[] }> {
	const sock = dgram.createSocket("udp4");
	await new Promise<void>((r) =>
		sock.bind({ address: "0.0.0.0", port: opts?.localPort ?? 0 }, () => r())
	);
	const candidates: IceCandidate[] = [];
	candidates.push(await gatherHost(sock));
	if (opts?.stunHost) {
		const srflx = await gatherSrflx(sock, opts.stunHost, opts.stunPort);
		if (srflx) candidates.push(srflx);
	}
	return { socket: sock, candidates };
}

/** Default STUN servers (public, free). */
export const DEFAULT_STUN_HOSTS = [
	"stun.l.google.com",
	"stun1.l.google.com",
];
