import write from "./write_deno.js";
import read from "./read_deno.js";
import { TBinaryProtocol, TCompactProtocol } from "npm:thrift@0.20.0";
import { Buffer } from "node:buffer";
import PinVerifier from "./pinVerifier.js";
TBinaryProtocol.genHeader = (name) => {
    return Buffer.from([
        0x80,
        1,
        0,
        1,
        0,
        0,
        0,
        name.length,
        ...Buffer.from(name),
        0,
        0,
        0,
        0,
    ]);
};
TCompactProtocol.genHeader = (name) => {
    return Buffer.from([
        0x82,
        0x21,
        0,
        name.length,
        ...Buffer.from(name),
    ]);
};

const Protocols = {
    4: TCompactProtocol,
    3: TBinaryProtocol,
    0: Buffer,
};

class LoginAPI {
    certs = {};
    async requestEmailLogin(
        email,
        pw,
        cert,
        pin = (p) => console.log(`Enter Pincode:`, p),
        e2ee = false,
    ) {
        const rsaKey = await this.getRSAKeyInfo();
        const keynm = rsaKey[1];
        const nvalue = rsaKey[2];
        const evalue = rsaKey[3];
        const sessionKey = rsaKey[4];
        const message = String.fromCharCode(sessionKey.length) +
            sessionKey +
            String.fromCharCode(email.length) +
            email +
            String.fromCharCode(pw.length) +
            pw;
        const crypto =
            new PinVerifier(message).getRSACrypto(rsaKey).credentials;
        let secret;
        if (e2ee) { //ß
            secret =
                "0\x8aEH\x96\xa7\x8d#5<\xfb\x91c\x12\x15\xbd\x13H\xfa\x04d\xcf\x96\xee1e\xa0]v,\x9f\xf2";
            throw new Error("e2ee Login Beta");
        }
        const res = await this.loginV2(
            keynm,
            crypto,
            secret,
            this.device,
            cert, //this.certs[email],
            null,
            "loginZ",
        );
        if (res[1]) {
            return res;
        } else {
            pin(res[4]);
            const headers = {
                "Host": "gw.line.naver.jp",
                "accept": "application/x-thrift",
                "user-agent": this.ua,
                "x-line-application": this.type,
                "x-line-access": res[3],
                "x-lal": "ja_JP",
                //'x-le': '18', 'x-lap': '5',
                "x-lpv": "1",
                "x-lhm": "GET",
                //"x-lcs":'0005svgBAiJMiGMJdzBkKqR/78GAZEMOQ6E0p3FJkMBZA/NXe10zfYnVQDufzNaRMEW1nvYJYsLWZaWb4ww7EsebLNXGbuhmyAT2V4Fr3tA23xzvvbOaLjCahQK/4qrha2gC54XuPRbtSFNzALjs3rAyfWyczSnlenV/KFv06iqMmt1v+l3KBQdBkN9uLqGRTXzII0Y/rXtkw1wTYvMZZB7b6KunfzHf9AbFOMCqyveInGhYAetFN9Ly9x3kf2uC2czTSlynvelkYn4qn2VeGmAWOLqZrbQelyh/rRIFPttCILbOrWNEwv71Y7Pa1C0MTGFGlWWQQKlBHj0lcK+kJL13Ww==',
                "accept-encoding": "gzip",
            };
            const verifier = await fetch("https://gw.line.naver.jp/Q", {
                headers: headers,
            }).then((res) => res.json());
            const login_res = await this.loginV2(
                keynm,
                crypto,
                secret,
                this.device,
                null,
                verifier.result.verifier,
                "loginZ",
            );
            return login_res;
        }
    }
    async loginV2(
        keynm,
        encData,
        secret,
        deviceName = this.device,
        cert,
        verifier,
        calledName = "loginV2",
    ) {
        let loginType = 2;
        if (!secret) loginType = 0;
        if (verifier) {
            loginType = 1;
        }
        return await this.direct_request(
            [
                [
                    12,
                    2,
                    [
                        [8, 1, loginType],
                        [8, 2, 1],
                        [11, 3, keynm],
                        [11, 4, encData],
                        [2, 5, 0],
                        [11, 6, ""],
                        [11, 7, deviceName],
                        [11, 8, cert],
                        [11, 9, verifier],
                        [11, 10, secret],
                        [8, 11, 1],
                        [11, 12, "System Product Name"],
                    ],
                ],
            ],
            calledName,
            3,
            true,
            "/api/v3p/rs",
        );
    }
    async getRSAKeyInfo(provider = 0) {
        return await this.request(
            [
                [8, 2, provider],
            ],
            "getRSAKeyInfo",
            3,
            true,
            "/api/v3/TalkService.do",
        );
    }
}

class lineClient extends LoginAPI {
    constructor(device, authToken) {
        super();
        let appVer, sysName, sysVer;
        sysVer = "12.1.4";
        switch (device) {
            case "DESKTOPWIN":
                appVer = "7.16.1.3000";
                sysName = "WINDOWS";
                sysVer = "10.0.0-NT-x64";
                break;
            case "DESKTOPMAC":
                appVer = "7.16.1.3000";
                sysName = "MAC";
                break;
            case "CHROMEOS":
                appVer = "3.0.3";
                sysName = "Chrome_OS";
                sysVer = "1";
                break;
            case "ANDROID":
                appVer = "13.4.1";
                sysName = "Android OS";
                break;
            case "IOS":
                appVer = "13.3.0";
                sysName = "iOS";
                break;
            case "IOSIPAD":
                appVer = "13.3.0";
                sysName = "iOS";
                break;
            case "WATCHOS":
                appVer = "13.3.0";
                sysName = "Watch OS";
                break;
            case "WEAROS":
                appVer = "13.4.1";
                sysName = "Wear OS";
                break;
            default:
                throw new Error("deviceName is wrong");
                break;
        }
        this.type = device + "\t" + appVer + "\t" + sysName + "\t" + sysVer;
        this.ua = "Line/" + appVer;
        this.authToken = authToken;
        this.device = device;
    }
    async _request(path, value, name, ptype, add_headers = {}, parse = true) {
        const Protocol = Protocols[ptype];
        let headers = {
            "Host": "gw.line.naver.jp",
            "accept": "application/x-thrift",
            "user-agent": this.ua,
            "x-line-application": this.type,
            "x-line-access": this.authToken,
            "content-type": "application/x-thrift",
            "x-lal": "ja_JP",
            //'x-le': '18', 'x-lap': '5',
            "x-lpv": "1",
            "x-lhm": "POST",
            //"x-lcs":'0005svgBAiJMiGMJdzBkKqR/78GAZEMOQ6E0p3FJkMBZA/NXe10zfYnVQDufzNaRMEW1nvYJYsLWZaWb4ww7EsebLNXGbuhmyAT2V4Fr3tA23xzvvbOaLjCahQK/4qrha2gC54XuPRbtSFNzALjs3rAyfWyczSnlenV/KFv06iqMmt1v+l3KBQdBkN9uLqGRTXzII0Y/rXtkw1wTYvMZZB7b6KunfzHf9AbFOMCqyveInGhYAetFN9Ly9x3kf2uC2czTSlynvelkYn4qn2VeGmAWOLqZrbQelyh/rRIFPttCILbOrWNEwv71Y7Pa1C0MTGFGlWWQQKlBHj0lcK+kJL13Ww==',
            "accept-encoding": "gzip",
        };

        headers = { ...headers, ...add_headers };
        let res;
        if (Protocol !== Buffer) {
            try {
                res = {};
                const Trequest = write(value, name, Protocol);
                await Deno.writeFile("./tmpReq.bin", Trequest); /////////////////////////
                const fet = await fetch("https://gw.line.naver.jp" + path, {
                    method: "POST",
                    headers: headers,
                    body: Trequest,
                });
                res = await fet.arrayBuffer();
                res = new Uint8Array(res);
                Deno.writeFile("./tmpRes.bin", res); /////////////////////////////
                res = read(res, Protocol);
            } catch (error) {
                console.log(error, "/", res);
            }
            console.log("/r", res);
            return res;
        } else {
            try {
                res = {};
                const Trequest = value;
                //await Deno.writeFile("./tmpReq.bin", Trequest); /////////////////////////
                const fet = await fetch("https://gw.line.naver.jp" + path, {
                    method: "POST",
                    headers: headers,
                    body: Trequest,
                });
                res = await fet.arrayBuffer();
                res = new Uint8Array(res);
                //Deno.writeFile("./tmpRes.bin", res); /////////////////////////////
            } catch (error) {
                console.log(error, "/", res);
            }
            return res;
        }
    }
    async request(
        CHRdata,
        methodName,
        protocol_type = 3,
        parse = true,
        path = "/S3",
        headers = {},
    ) {
        const res = await this._request(
            path,
            [
                [
                    12,
                    1,
                    CHRdata,
                ],
            ],
            methodName,
            protocol_type,
            headers,
            parse,
        );
        if (res.e) {
            throw new Error(JSON.stringify(res.e), { cause: res.e });
        }
        return res.value;
    }
    async direct_request(
        CHRdata,
        methodName,
        protocol_type = 3,
        parse = true,
        path = "/S3",
        headers = {},
    ) {
        const res = await this._request(
            path,
            CHRdata,
            methodName,
            protocol_type,
            headers,
            parse,
        );
        if (res.e) {
            throw new Error(JSON.stringify(res.e), { cause: res.e });
        }
        return res.value;
    }
}

const encoder = new TextEncoder();

export default function loginMP(request) {
    const url = new URL(request.url);
    const { device, email, pw, cert } = JSON.parse(
        atob(url.searchParams.get("a")),
    );
    const LC = new lineClient(device);
    const stream = new ReadableStream({
        async start(controller) {
            try {
                const login = await LC.requestEmailLogin(
                    email,
                    pw,
                    cert,
                    (pin) => {
                        controller.enqueue(
                            encoder.encode(`event: pincode\ndata: ${pin}\n\n`),
                        );
                    },
                );
                controller.enqueue(
                    encoder.encode(
                        `event: login\ndata: ${JSON.stringify(login)}\n\n`,
                    ),
                );
            } catch (e) {
                controller.enqueue(
                    encoder.encode(
                        `event: loginErr\ndata: ${JSON.stringify(e.stack)}\n\n`,
                    ),
                );
            }
        },
        cancel() {
        },
    });
    return new Response(stream, {
        headers: { "Content-Type": "text/event-stream; charset=utf-8" },
    });
}
