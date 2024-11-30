import { Thrift } from "./thrift.ts";
function toUnion(input: Record<string, string>, name: string) {
	const unions: string[] = [];
	const enumValue: Record<string, number> = {};
	for (const key in input) {
		if (Object.prototype.hasOwnProperty.call(input, key)) {
			const value = input[key];
			unions.push(key);
			unions.push(`"${value}"\n`);
			enumValue[value] = parseInt(key);
		}
	}
	if (!unions.length) {
		return `export type ${name} = number;`;
	}
	return `export type ${name} = ${unions.join(" | ")};\nenums.${name} = ${
		JSON.stringify(enumValue)
	};`;
}
const types = [];
for (const key in Thrift) {
	if (Object.prototype.hasOwnProperty.call(Thrift, key)) {
		const element = (Thrift as any)[key];
		if (!Array.isArray(element)) {
			types.push(toUnion(element, key));
		}
	}
}
console.log("export const enums:Record<string,Record<string, number>> = {};");
console.log(types.join("\n\n"));
