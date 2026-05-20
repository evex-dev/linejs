// LINE PLANET / Cassini call-signaling implementation, reverse-engineered
// from libandromeda.so. See docs/PLANET_PROTOCOL.md for the full wire
// format. Replaces the standard-SIP `andromeda.ts` for LINE cscf interop;
// the SRTP/RTCP/Opus media-plane layers in linejs continue to apply.

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
	buildIv,
	decodeMpKey,
	decryptCtr,
	deriveSessionKeys,
	encryptCtr,
	hmacTag,
	type PlanetSessionKeys,
	sha256,
	tagEquals,
} from "./crypto.ts";

export {
	buildRelReq,
	buildSetupReq,
	CASSINI_MSG,
	type CassiniHeader,
	type CassiniMsgType,
	packCassini,
	SETUP_TAG,
	type TLV,
	unpackCassini,
} from "./cassini.ts";

export {
	PlanetTransport,
	type PlanetTransportOpts,
} from "./transport.ts";
