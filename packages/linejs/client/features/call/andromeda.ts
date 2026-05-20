// SIP-over-UDP transport for LINE call media plane.
// Uses node:dgram for UDP (works in Node and Deno without flags).

import type { Buffer } from "node:buffer";
import type * as LINETypes from "@evex/linejs-types";
import type { CallTransport } from "./session.ts";
import {
	buildSip,
	digestResponse,
	getStatusCode,
	newBranch,
	parseDigestChallenge,
	parseSip,
	randomCallId,
} from "./sip.ts";

export interface AndromedaTransportOpts {
	localMid: string;
	userAgent?: string;
	timeoutMs?: number;
}

interface UdpSocket {
	send(data: Uint8Array, port: number, host: string, cb: (e?: Error) => void): void;
	on(ev: "message", h: (msg: Buffer, rinfo: { address: string; port: number }) => void): void;
	close(cb?: () => void): void;
	bind(opts: { address?: string; port?: number }, cb?: () => void): void;
}

export class AndromedaTransport implements CallTransport {
	#opts: AndromedaTransportOpts;
	#sock?: UdpSocket;
	#route?: LINETypes.CallRoute;
	#cseq = 0;
	#pending: ((msg: Uint8Array) => void)[] = [];

	constructor(opts: AndromedaTransportOpts) {
		this.#opts = opts;
	}

	async connect(opts: { route: LINETypes.CallRoute }): Promise<void> {
		this.#route = opts.route;
		const dgram = await import("node:dgram");
		const sock = dgram.createSocket("udp4") as unknown as UdpSocket;
		this.#sock = sock;
		await new Promise<void>((res) => sock.bind({ address: "0.0.0.0", port: 0 }, () => res()));
		sock.on("message", (buf) => {
			const w = this.#pending.shift();
			if (w) w(new Uint8Array(buf));
		});
		await this.register();
	}

	async close(): Promise<void> {
		await new Promise<void>((res) => this.#sock?.close(() => res()));
	}

	send(_packet: Uint8Array): void {
		throw new Error("AndromedaTransport.send: media plane not yet wired (REGISTER only)");
	}

	async *receive(): AsyncIterable<Uint8Array> { /* TODO INVITE→RTP path */ }

	/** REGISTER against cscf. Returns final SIP status (200 = registered). */
	async register(): Promise<number> {
		const route = this.#route!;
		const cscf = (route as { cscf?: { host?: string; port?: number } }).cscf;
		const token = (route as { fromToken?: string }).fromToken ?? "";
		if (!cscf?.host || !cscf?.port) {
			throw new Error("AndromedaTransport.register: no cscf in CallRoute");
		}
		const target = `sip:${cscf.host}`;
		const callId = randomCallId(this.#opts.localMid);
		const fromTag = newBranch().slice(7, 15);
		const ua = this.#opts.userAgent ?? "Line/26.6.2";

		const baseHeaders = (cseq: number, auth?: string): Record<string, string> => ({
			"Via": `SIP/2.0/UDP ${this.#opts.localMid}.invalid;branch=${newBranch()};rport`,
			"Max-Forwards": "70",
			"From": `<sip:${this.#opts.localMid}@${cscf.host}>;tag=${fromTag}`,
			"To": `<sip:${this.#opts.localMid}@${cscf.host}>`,
			"Call-ID": callId,
			"CSeq": `${cseq} REGISTER`,
			"User-Agent": ua,
			"Contact": `<sip:${this.#opts.localMid}@invalid:0>`,
			"Expires": "300",
			"Content-Length": "0",
			...(auth ? { "Authorization": auth } : {}),
		});

		const dst = { host: cscf.host, port: cscf.port };
		this.#cseq++;
		await this.#sendTo(dst, {
			startLine: `REGISTER ${target} SIP/2.0`,
			headers: baseHeaders(this.#cseq),
			body: "",
		});
		const challenge = parseSip(await this.#receive());
		const status = getStatusCode(challenge.startLine);
		if (status === 200) return 200;
		if (status !== 401 && status !== 407) {
			throw new Error(`REGISTER unexpected status: ${challenge.startLine}`);
		}
		const wwwAuth = challenge.headers["WWW-Authenticate"] ??
			challenge.headers["Proxy-Authenticate"] ?? "";
		const d = parseDigestChallenge(wwwAuth);
		const auth = await digestResponse({
			username: this.#opts.localMid,
			password: token,
			realm: d.realm ?? cscf.host,
			nonce: d.nonce ?? "",
			uri: target,
			method: "REGISTER",
			qop: d.qop || undefined,
			opaque: d.opaque,
			algorithm: d.algorithm,
		});

		this.#cseq++;
		await this.#sendTo(dst, {
			startLine: `REGISTER ${target} SIP/2.0`,
			headers: baseHeaders(this.#cseq, auth),
			body: "",
		});
		const final = parseSip(await this.#receive());
		return getStatusCode(final.startLine) ?? 0;
	}

	#sendTo(
		dst: { host: string; port: number },
		msg: { startLine: string; headers: Record<string, string>; body: string },
	) {
		return new Promise<void>((res, rj) => {
			this.#sock!.send(buildSip(msg), dst.port, dst.host, (e) => e ? rj(e) : res());
		});
	}

	#receive(): Promise<Uint8Array> {
		const timeout = this.#opts.timeoutMs ?? 5000;
		return new Promise<Uint8Array>((res, rj) => {
			const t = setTimeout(() => rj(new Error("SIP receive timeout")), timeout);
			this.#pending.push((buf) => { clearTimeout(t); res(buf); });
		});
	}
}
