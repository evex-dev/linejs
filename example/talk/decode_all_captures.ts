/** Decode every captured msg_pack from final_capture.json to map the full
 *  Cassini protobuf schema. */
import {
	decodePb,
	WireType,
} from "../../packages/linejs/client/features/call/planet/mod.ts";

function hex2bytes(s: string): Uint8Array {
	const o = new Uint8Array(s.length / 2);
	for (let i = 0; i < o.length; i++) o[i] = parseInt(s.substr(i * 2, 2), 16);
	return o;
}

function dump(prefix: string, buf: Uint8Array, depth = 0) {
	const ind = "  ".repeat(depth);
	const fields = decodePb(buf);
	console.log(`${ind}${prefix} (${buf.length}B, ${fields.length} fields)`);
	for (const f of fields) {
		const wt = f.wireType === WireType.Varint ? "v"
			: f.wireType === WireType.LengthDelim ? "L"
			: "?";
		if (f.wireType === WireType.Varint) {
			const v = f.value as bigint;
			console.log(`${ind}  [${f.tag}/${wt}] ${v.toString()}  (0x${v.toString(16)})`);
		} else {
			const v = f.value as Uint8Array;
			const dec = new TextDecoder("iso-8859-1").decode(v);
			const printable = v.length > 0 && /^[\x09\x0a\x0d\x20-\x7e]*$/.test(dec);
			if (printable && dec.length >= 3) {
				console.log(`${ind}  [${f.tag}/${wt} ${v.length}B str] "${dec}"`);
			} else {
				const hex = [...v].slice(0, 64).map((b) => b.toString(16).padStart(2, "0")).join("");
				console.log(`${ind}  [${f.tag}/${wt} ${v.length}B] ${hex}${v.length > 64 ? "..." : ""}`);
				// try nested
				if (v.length > 1 && v[0] < 0x80 && (v[0] & 0x7) <= 5) {
					try {
						const sub = decodePb(v);
						if (sub.length >= 1) dump("nested:", v, depth + 2);
					} catch (_e) {}
				}
			}
		}
	}
}

const json = JSON.parse(await Deno.readTextFile("../scripts/_frida_work/final_capture.json"));
for (const e of json) {
	if (e.key !== "msg_pack") continue;
	const post = e.post;
	if (!post?.packed_hex) continue;
	const buf = hex2bytes(post.packed_hex);
	console.log("\n===== msg_pack #" + e.n + " =====");
	dump("root", buf);
}
