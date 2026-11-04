import { encode, renderANSI, renderUnicode, renderUnicodeCompact } from "uqr";
import type { CommandContext } from "./context.ts";

export type QrFormat = "compact" | "unicode" | "ansi" | "ascii" | "none";

export const QR_FORMATS: readonly QrFormat[] = ["compact", "unicode", "ansi", "ascii", "none"];

export function renderQr(text: string, format: QrFormat = "compact"): string {
	switch (format) {
		case "none":
			return "";
		case "ansi":
			return renderANSI(text, { ecc: "M", border: 2 });
		case "unicode":
			return renderUnicode(text, { ecc: "M", border: 2 });
		case "ascii": {
			const { data } = encode(text, { ecc: "M", border: 2 });
			return data.map((row) => row.map((filled) => (filled ? "██" : "  ")).join("")).join("\n");
		}
		case "compact":
		default:
			return renderUnicodeCompact(text, { ecc: "M", border: 2 });
	}
}

export function qrFormat(context: CommandContext): QrFormat {
	const value = (context.getString("qr-format") ?? "compact") as QrFormat;
	return QR_FORMATS.includes(value) ? value : "compact";
}

/** QR codes and PINs travel on stderr so `--json` stdout stays valid. */
export function printQr(context: CommandContext, url: string): void {
	const format = qrFormat(context);
	const qr = renderQr(url, format);
	context.output.writeErrLine("");
	if (qr) {
		context.output.writeErrLine(qr);
		context.output.writeErrLine("");
	}
	context.output.writeErrLine(context.output.style("bold", "Scan this URL with LINE:"));
	context.output.writeErrLine(url);
	context.output.writeErrLine("");
}

export function printPin(context: CommandContext, pin: string): void {
	context.output.writeErrLine("");
	context.output.writeErrLine(context.output.style("bold", "Enter this PIN in the LINE app:"));
	context.output.writeErrLine(`  ${pin}`);
	context.output.writeErrLine("");
}
