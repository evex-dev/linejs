import { openSync, writeSync } from "node:fs";
import { BaseClient } from "@evex-dev/linejs/base";

const logger = openSync("./debug.log", "a");

writeSync(
	logger,
	new TextEncoder().encode(
		`\n\n\n----- New Session: ${new Date().toLocaleString()} -----\n`,
	),
);

const client = new BaseClient({
	device: "DESKTOPWIN",
});

client.on("log", (data) => {
	writeSync(
		logger,
		new TextEncoder().encode(
			`[${new Date().toLocaleTimeString()}] ${data.type}: ${
				JSON.stringify(data.data, BaseClient.jsonReplacer, 2)
			}\n`,
		),
	);
});
