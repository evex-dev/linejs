/** Parse the captured msg_pack#1 bytes and dump the full protobuf field tree
 *  so we can correct any structural mistakes in our Cassini builder. */
import { decodePb, WireType } from "../../packages/linejs/client/features/call/planet/mod.ts";

// captured wire bytes from a real tom call (msg_pack#N):
const CAPTURES: Record<string, string> = {
	"#1 (113B, body empty)": "0a600a217563383435383634373437303361363137326539643035316561626263623632371081221a10b0c2a74ce7cd4502a0fa32586da90e542210fc4ed077d5e24175ab596eda7351cbe328b2f08cfc0230cccac78a0138939f8480e0c1fc866a120d",
	// #2 was 271B but log only shows first ~200; we got the prefix
	"#3 (269B, exchange_app_str_data)": "0a600a2175633834353836343734373033613631373265396430353165616262636236323710c7421a10b0c2a74ce7cd4502a0fa32586da90e542210dd26e6e3606f4f8d9d2852288a1b477428b3f08cfc0230cccac78a0138939f8480e0c1fc866a1aa8",
	"#5 (198B)": "0a600a2175633834353836343734373033613631373265396430353165616262636236323710c7441a10b0c2a74ce7cd4502a0fa32586da90e542210d4c7a62ccea1470abe14e10a419fdbd028b6c0dbe30530cccac78a0138939f8480e0c1fc866a1a62",
	"#6 (164B)": "0a600a2175633834353836343734373033613631373265396430353165616262636236323710c9441a10b0c2a74ce7cd4502a0fa32586da90e542210a02a92004df1440da055cc5885ae3b3a28b7c0dbe30530cccac78a0138939f8480e0c1fc866a1a40",
	"#8 (175B, initiator)": "0a600a2175633834353836343734373033613631373265396430353165616262636236323710c5421a10b0c2a74ce7cd4502a0fa32586da90e542210d8eee15721b54e9e9712810acb4b58f228b4f08cfc0230cccac78a0138939f8480e0c1fc866a1a4b",
};
const FIRST_KEY = Object.keys(CAPTURES)[0];
const CAPTURED_HEX = CAPTURES[FIRST_KEY];

function hexToBytes(s: string): Uint8Array {
	const out = new Uint8Array(s.length / 2);
	for (let i = 0; i < out.length; i++) out[i] = parseInt(s.substr(i * 2, 2), 16);
	return out;
}

function dumpProto(prefix: string, buf: Uint8Array, depth = 0) {
	const indent = "  ".repeat(depth);
	const fields = decodePb(buf);
	console.log(`${indent}${prefix} (${buf.length} bytes, ${fields.length} fields)`);
	for (const f of fields) {
		const wt = f.wireType === WireType.Varint
			? "varint"
			: f.wireType === WireType.LengthDelim
			? "len-delim"
			: f.wireType === WireType.Fixed64
			? "fixed64"
			: "?";
		if (f.wireType === WireType.Varint) {
			console.log(`${indent}  field ${f.tag} (${wt}): ${(f.value as bigint).toString()}`);
		} else if (f.wireType === WireType.LengthDelim) {
			const v = f.value as Uint8Array;
			const ascii = new TextDecoder("iso-8859-1").decode(v);
			const printable = /^[\x20-\x7e]*$/.test(ascii);
			if (printable) {
				console.log(`${indent}  field ${f.tag} (${wt}, ${v.length}B): "${ascii}"`);
			} else {
				console.log(
					`${indent}  field ${f.tag} (${wt}, ${v.length}B): ${
						[...v].slice(0, 32).map((b) => b.toString(16).padStart(2, "0")).join(" ")
					}${v.length > 32 ? "..." : ""}`,
				);
				// recurse if it looks like protobuf
				if (v.length > 0 && v[0] < 0x80 && (v[0] & 0x7) <= 5) {
					try {
						const sub = decodePb(v);
						if (sub.length > 0) {
							dumpProto(`-> nested`, v, depth + 2);
						}
					} catch (_e) { /* not protobuf */ }
				}
			}
		}
	}
}

for (const [label, hex] of Object.entries(CAPTURES)) {
	console.log("\n=== " + label + " ===");
	dumpProto("root", hexToBytes(hex));
}
