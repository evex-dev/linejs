/** Test whether linejs can call acquireCallRoute against /V4
 *  using the existing tomtwo (DESKTOP_WIN/SECONDARY) session. */
import { loginWithAuthToken } from "@evex/linejs";
import { FileStorage } from "@evex/linejs/storage";

const PEER_MID = "u9dfba8dc9529aeb6063ee013a5933184"; // tom

const client = await loginWithAuthToken(
	await Deno.readTextFile("../creds/v2_7_smoke.auth"),
	{
		device: "DESKTOPWIN",
		storage: new FileStorage("../creds/v2_7_smoke_storage.json"),
	},
);

console.log("[login] mid =", client.base.user?.mid);
console.log("[try] acquireCallRoute peer =", PEER_MID);
try {
	const route = await client.call.acquireRoute({
		to: PEER_MID,
		callType: "AUDIO",
	});
	console.log("[OK] got route");
	console.log(JSON.stringify(route, null, 2));
} catch (e) {
	console.log("[FAIL]", (e as Error).message);
	const re = e as { code?: number | string; reason?: string };
	console.log("  code:", re.code, "reason:", re.reason);
}
