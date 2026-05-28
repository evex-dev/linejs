import { assertEquals } from "@std/assert";
import { getDeviceDetails } from "./devices.ts";

Deno.test("getDeviceDetails returns current default app profiles", () => {
	assertEquals(getDeviceDetails("DESKTOPWIN"), {
		device: "DESKTOPWIN",
		appVersion: "9.7.0.3556",
		systemName: "WINDOWS",
		systemVersion: "10.0.0-NT-x64",
	});
	assertEquals(getDeviceDetails("DESKTOPMAC"), {
		device: "DESKTOPMAC",
		appVersion: "26.2.0",
		systemName: "MAC",
		systemVersion: "13.0.0",
	});
	assertEquals(getDeviceDetails("ANDROID"), {
		device: "ANDROID",
		appVersion: "26.6.2",
		systemName: "Android OS",
		systemVersion: "16",
	});
	assertEquals(getDeviceDetails("ANDROIDSECONDARY"), {
		device: "ANDROIDSECONDARY",
		appVersion: "26.6.2",
		systemName: "Android OS",
		systemVersion: "16",
	});
	assertEquals(getDeviceDetails("IOS"), {
		device: "IOS",
		appVersion: "26.7.2",
		systemName: "iOS",
		systemVersion: "18.0",
	});
	assertEquals(getDeviceDetails("IOSIPAD"), {
		device: "IOSIPAD",
		appVersion: "26.7.2",
		systemName: "iOS",
		systemVersion: "18.0",
	});
	assertEquals(getDeviceDetails("WATCHOS"), {
		device: "WATCHOS",
		appVersion: "26.7.2",
		systemName: "Watch OS",
		systemVersion: "11.0",
	});
	assertEquals(getDeviceDetails("WEAROS"), {
		device: "WEAROS",
		appVersion: "13.4.1",
		systemName: "Wear OS",
		systemVersion: "3.0",
	});
});

Deno.test("getDeviceDetails keeps explicit version overrides", () => {
	assertEquals(getDeviceDetails("IOSIPAD", "15.19.0")?.appVersion, "15.19.0");
});
