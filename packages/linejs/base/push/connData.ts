export enum LegyH2PingFrameType {
	NONE = 0,
	ACK = 1,
	ACK_REQUIRED = 2,
}

export enum LegyH2PushFrameType {
	NONE = 0,
	ACK = 1,
	ACK_REQUIRED = 2,
}

export class LegyH2Frame {
	frameType: number;
	constructor(frameType: number) {
		this.frameType = frameType;
	}
	requestPacket(payload: Uint8Array): Uint8Array {
		const len = payload.length;
		const buf = new Uint8Array(2 + 1 + len);
		// big-endian uint16
		buf[0] = (len >> 8) & 0xff;
		buf[1] = len & 0xff;
		buf[2] = this.frameType & 0xff;
		buf.set(payload, 3);
		return buf;
	}
}

export class LegyH2PingFrame extends LegyH2Frame {
	pingType?: LegyH2PingFrameType;
	pingId?: number;
	constructor(pingType?: number, pingId?: number) {
		super(1);
		this.pingType = pingType === undefined
			? LegyH2PingFrameType.NONE
			: pingType;
		this.pingId = pingId;
	}
	ackPacket(): Uint8Array {
		const payload = new Uint8Array(1 + 2);
		payload[0] = LegyH2PingFrameType.ACK;
		payload[1] = (this.pingId! >> 8) & 0xff;
		payload[2] = this.pingId! & 0xff;
		return this.requestPacket(payload);
	}
}

export class LegyH2SignOnResponseFrame extends LegyH2Frame {
	requestId?: number;
	isFin?: boolean;
	responsePayload?: Uint8Array;
	constructor(
		requestId?: number,
		isFin?: boolean,
		responsePayload?: Uint8Array,
	) {
		super(3);
		this.requestId = requestId;
		this.isFin = isFin;
		this.responsePayload = responsePayload;
	}
}

export class LegyH2PushFrame extends LegyH2Frame {
	pushType?: LegyH2PushFrameType;
	serviceType?: number;
	pushId?: number;
	pushPayload?: Uint8Array;
	constructor(
		pushType?: number,
		serviceType?: number,
		pushId?: number,
		pushPayload?: Uint8Array,
	) {
		super(4);
		this.pushType = pushType === undefined
			? LegyH2PushFrameType.NONE
			: pushType;
		this.serviceType = serviceType;
		this.pushId = pushId;
		this.pushPayload = pushPayload;
	}
	ackPacket(): Uint8Array {
		if (this.serviceType == null || this.pushId == null) {
			throw new Error("Missing fields");
		}
		const payload = new Uint8Array(1 + 1 + 4);
		payload[0] = LegyH2PushFrameType.ACK;
		payload[1] = this.serviceType & 0xff;
		// pack signed/int32 big-endian
		payload[2] = (this.pushId >> 24) & 0xff;
		payload[3] = (this.pushId >> 16) & 0xff;
		payload[4] = (this.pushId >> 8) & 0xff;
		payload[5] = this.pushId & 0xff;
		return this.requestPacket(payload);
	}
}
