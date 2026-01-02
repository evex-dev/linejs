import { BaseClient } from "@evex/linejs/base";

const logger = await Deno.open("./debug.log", {
	write: true,
	create: true,
	append: true,
});

logger.writeSync(
	new TextEncoder().encode(
		`\n\n\n----- New Session: ${new Date().toLocaleString()} -----\n`,
	),
);

const client = new BaseClient({
	device: "DESKTOPWIN",
});

client.on("log", (data) => {
	logger.writeSync(
		new TextEncoder().encode(
			`[${new Date().toLocaleTimeString()}] ${data.type}: ${
				JSON.stringify(data.data, BaseClient.jsonReplacer, 2)
			}\n`,
		),
	);
});
