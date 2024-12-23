import { Thrift } from "../../packages/types/thrift.ts";

const used: string[] = [];

function getFunctions(input: string) {
    const functions: string[] = [];
    const fReg = /"(?<name>.*?)"/g;
    const fReg2 = /'(?<name>.*?)'/g;
    const square =
        input.includes("class SquareLiveTalkService(BaseService):") ||
        input.includes("class SquareService(BaseService):");
    while (true) {
        const result = fReg.exec(input);
        if (!(result && result.groups)) {
            break;
        }
        const fn = f(result.groups.name, square);
        if (fn) {
            used.push(
                (square
                    ? "SquareService_" + result.groups.name
                    : result.groups.name) + "_args",
            );
            functions.push(fn);
        }
    }
    while (true) {
        const result = fReg2.exec(input);
        if (!(result && result.groups)) {
            break;
        }
        const fn = f(result.groups.name, square);
        if (fn) {
            used.push(
                (square
                    ? "SquareService_" + result.groups.name
                    : result.groups.name) + "_args",
            );
            functions.push(fn);
        }
    }
    return functions;
}

function f(name: string, square = false) {
    const fname = name;
    if (square) {
        name = "SquareService_" + name;
    }
    if (!Thrift[name + "_args"]) {
        return;
    }
    return `async ${fname}(
        ...param: Parameters<typeof LINEStruct.${name}_args>
    ): Promise<${
        Thrift[name + "_result"] &&
            (Thrift[name + "_result"] as any[]).find(
                (e) => e.name === "success",
            )
            ? `LINETypes.${name}_result["success"]`
            : "void"
    }> {
        return await this.client.request.request(
            LINEStruct.${name}_args(...param),
            "${fname}",
            this.protocolType,
            true,
            this.requestPath,
        );
    }`;
}
const service = [
    "AccessTokenRefreshService",
    "AccountAuthFactorEapConnectService",
    "AuthService",
    "BotExternalService",
    "BuddyService",
    "CallService",
    "ChannelService",
    "ChatAppService",
    "CoinService",
    "DeviceAttestationService",
    "E2EEKeyBackupService",
    "HomeSafetyCheckService",
    "InterlockService",
    "LiffService",
    "LoginService",
    "MultiProfileService",
    "OaChatService",
    "OaMembershipService",
    "PremiumFontService",
    "PrimaryAccountInitService",
    "PrimaryAccountSmartSwitchRestorePreparationService",
    "PrimaryQrCodeMigrationLongPollingService",
    "PrimaryQrCodeMigrationPreparationService",
    "PwlessPrimaryRegistrationService",
    "RelationService",
    "SearchService",
    "SecondaryPwlessLoginPermitNoticeService",
    "SecondaryPwlessLoginService",
    "SettingsService",
    "ShopAuthService",
    "ShopCollectionService",
    "ShopService",
    "SquareBotService",
    "SquareLiveTalkService",
    "SquareService",
    "TalkService",
];
for (const s of service) {
    const functions = getFunctions(
        await Deno.readTextFile(
            `../../../_CHRLINE/CHRLINE/services/${s}.py`,
        ),
    );
    if (functions.length) {
        await Deno.writeTextFile(`${s}.txt`, functions.join("\n\n"));
    }
}
Object.keys(Thrift).forEach((e) => {
    if (e.endsWith("_args") && (!used.includes(e))) {
        console.log("unused:", e);
    }
});
