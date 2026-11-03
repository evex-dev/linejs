import { assert, test } from "vite-plus/test";
import { getDeviceDetails } from "./devices.ts";

test("getDeviceDetails returns current default app profiles", () => {
	assert.deepEqual(getDeviceDetails("DESKTOPWIN"), {
		device: "DESKTOPWIN",
		appVersion: "9.7.0.3556",
		systemName: "WINDOWS",
		systemVersion: "10.0.0-NT-x64",
	});
	assert.deepEqual(getDeviceDetails("DESKTOPMAC"), {
		device: "DESKTOPMAC",
		appVersion: "26.2.0",
		systemName: "MAC",
		systemVersion: "13.0.0",
	});
	assert.deepEqual(getDeviceDetails("ANDROID"), {
		device: "ANDROID",
		appVersion: "26.6.2",
		systemName: "Android OS",
		systemVersion: "16",
	});
	assert.deepEqual(getDeviceDetails("ANDROIDSECONDARY"), {
		device: "ANDROIDSECONDARY",
		appVersion: "26.6.2",
		systemName: "Android OS",
		systemVersion: "16",
	});
	assert.deepEqual(getDeviceDetails("IOS"), {
		device: "IOS",
		appVersion: "26.7.2",
		systemName: "iOS",
		systemVersion: "18.0",
	});
	assert.deepEqual(getDeviceDetails("IOSIPAD"), {
		device: "IOSIPAD",
		appVersion: "26.7.2",
		systemName: "iOS",
		systemVersion: "18.0",
	});
	assert.deepEqual(getDeviceDetails("WATCHOS"), {
		device: "WATCHOS",
		appVersion: "26.7.2",
		systemName: "Watch OS",
		systemVersion: "11.0",
	});
	assert.deepEqual(getDeviceDetails("WEAROS"), {
		device: "WEAROS",
		appVersion: "13.4.1",
		systemName: "Wear OS",
		systemVersion: "3.0",
	});
});

test("getDeviceDetails keeps explicit version overrides", () => {
	assert.deepEqual(getDeviceDetails("IOSIPAD", "15.19.0")?.appVersion, "15.19.0");
});
