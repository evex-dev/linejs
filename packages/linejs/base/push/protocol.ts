export class PushProtocol {
	static genServiceBitmask(ss: number[] = [1, 3, 5, 6, 8, 9, 10]): number {
		let i = 0;
		for (const s of ss) i |= 1 << (s - 1);
		return i;
	}

	static buildRequest(service: number, data: Uint8Array): Uint8Array {
		const len = data.length;
		const out = new Uint8Array(2 + 1 + len);
		out[0] = (len >> 8) & 0xff;
		out[1] = len & 0xff;
		out[2] = service & 0xff;
		out.set(data, 3);
		return out;
	}

	static buildSignOnHeader(
		id: number,
		serviceType: number,
		payloadLength: number,
	): Uint8Array {
		const header = new Uint8Array(2 + 1 + 1 + 2);
		header[0] = (id >> 8) & 0xff;
		header[1] = id & 0xff;
		header[2] = serviceType & 0xff;
		header[3] = 0;
		header[4] = (payloadLength >> 8) & 0xff;
		header[5] = payloadLength & 0xff;
		return header;
	}
}
