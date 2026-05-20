// LINE PLANET / Cassini call signaling, reverse-engineered from a
// real tom-call's `pln_msg_pack` + `ear_crypto_hkdf` Frida capture.
// See docs/PLANET_PROTOCOL.md for the full reverse-engineering trail.

export {
	buildFrameHeader,
	makeChunkHdr,
	makeFixedHdr,
	parseChunkHdr,
	parseFixedHdr,
	parseFrameHeader,
	type PlanetFixedHdr,
} from "./framing.ts";

export {
	aesCtrDecrypt,
	aesCtrEncrypt,
	buildCtrIv,
	buildDirectionTag,
	decodeMpKey,
	deriveCallKeys,
	ecdh,
	type EphemeralKeypair,
	generateEphemeralKeypair,
	hmacTag,
	newSessionId,
	planetHkdfStage1,
	planetHkdfStage2,
	sha256,
	tagEquals,
	type TransportKeys,
} from "./crypto.ts";

export {
	buildExchangeAppStrData,
	buildRelReq,
	buildSetupReq,
	type CassiniBody,
	type CassiniEnvelope,
	type CassiniHeader,
	decodePb,
	decodeVarint,
	encodePb,
	encodeVarint,
	packCassini,
	packCassiniBody,
	packCassiniHeader,
	type PbField,
	unpackCassini,
	unpackCassiniBody,
	WireType,
} from "./cassini.ts";

export {
	PlanetTransport,
	type PlanetTransportOpts,
} from "./transport.ts";

// Ground-truth Cassini protobuf-c schema (reverse-engineered from the
// .data.rel.ro descriptor objects in libandromeda).
export {
	CC_MSG,
	type CcSetupReq,
	type DecodedField,
	decodeFields,
	packCcSetupReq,
	packKeepaliveReq,
	packPlanetCcHdr,
	packPlanetCcMsg,
	extractRmtNonceFromReply,
	packPlanetMsg,
	packPlanetMsgHdr,
	packPlanetScMsgKaReq,
	type PlanetCcHdr,
	type PlanetMsgBody,
	type PlanetMsgHdr,
	wrapCcMsg,
} from "./schema.ts";
