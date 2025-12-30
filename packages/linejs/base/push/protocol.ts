export class PushProtocol {
	/**
	 * Generates a service bitmask for the PUSH connection.
	 */
	static genServiceBitmask(ss: number[] = [1, 3, 5, 6, 8, 9, 10]): number {
		let i = 0;
		for (const s of ss) i |= 1 << (s - 1);
		return i;
	}

	/**
	 * Builds a standard push request frame.
	 * [2 bytes length][1 byte service type][payload]
	 */
	static buildRequest(service: number, data: Uint8Array): Uint8Array {
		const len = data.length;
		const out = new Uint8Array(3 + len);
		out[0] = (len >> 8) & 0xff;
		out[1] = len & 0xff;
		out[2] = service & 0xff;
		out.set(data, 3);
		return out;
	}

	/**
	 * Builds a SignOn request packet.
	 * [2 bytes request id][1 byte service type][1 byte unknown(0)][2 bytes payload length][payload]
	 */
	static buildSignOnRequest(
		requestId: number,
		serviceType: number,
		payload: Uint8Array,
	): Uint8Array {
		const len = payload.length;
		const out = new Uint8Array(6 + len);
		// Request ID (2 bytes)
		out[0] = (requestId >> 8) & 0xff;
		out[1] = requestId & 0xff;
		// Service Type (1 byte)
		out[2] = serviceType & 0xff;
		// Unknown (1 byte, always 0)
		out[3] = 0;
		// Payload Length (2 bytes)
		out[4] = (len >> 8) & 0xff;
		out[5] = len & 0xff;
		// Payload
		out.set(payload, 6);
		return out;
	}
}
