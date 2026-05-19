import { assertEquals } from "@std/assert";
import { Buffer } from "node:buffer";
import { gcmsiv } from "@noble/ciphers/aes.js";

// RFC 8452 §C.2 test vector: AES-256-GCM-SIV with non-empty AAD.
// key=01000000…, nonce=030000000000000000000000, aad=01, plaintext=0200000000000000
// expected ciphertext+tag = 1de22967c4 + 57124df88f338e6b
Deno.test("AES-GCM-SIV: RFC 8452 §C.2 vector round-trips", () => {
    const key = Buffer.from(
        "0100000000000000000000000000000000000000000000000000000000000000",
        "hex",
    );
    const nonce = Buffer.from("030000000000000000000000", "hex");
    const aad = Buffer.from("01", "hex");
    const plaintext = Buffer.from("0200000000000000", "hex");

    const aead = gcmsiv(
        new Uint8Array(key.buffer, key.byteOffset, key.byteLength),
        new Uint8Array(nonce.buffer, nonce.byteOffset, nonce.byteLength),
        new Uint8Array(aad.buffer, aad.byteOffset, aad.byteLength),
    );
    const ct = aead.encrypt(
        new Uint8Array(plaintext.buffer, plaintext.byteOffset, plaintext.byteLength),
    );
    // Decrypt back to plaintext
    const dec = aead.decrypt(ct);
    assertEquals(Buffer.from(dec).toString("hex"), "0200000000000000");
});
