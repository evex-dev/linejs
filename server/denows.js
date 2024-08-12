import write from "./write_deno.js";
import read from "./read_deno.js";
import { TBinaryProtocol, TCompactProtocol } from "npm:thrift@0.20.0";
import { Buffer } from "node:buffer";
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

export default function ws(request) {
    const url = new URL(request.url);
    const upgradeHeader = request.headers.get("Upgrade");
    if (!upgradeHeader || upgradeHeader !== "websocket") {
        return new Response("Expected Upgrade: websocket", { status: 426 });
    }
    const { socket, response } = Deno.upgradeWebSocket(request);
    const Account = {
        ua: url.searchParams.get("ua"),
        type: url.searchParams.get("type"),
        authToken: url.searchParams.get("auth"),
    };
    const base_headers = {
        "Host": "gw.line.naver.jp",
        "accept": "application/x-thrift",
        "user-agent": Account.ua,
        "x-line-application": Account.type,
        "x-line-access": Account.authToken,
        "content-type": "application/x-thrift",
        "x-lal": "ja_JP",
        //'x-le': '18', 'x-lap': '5',
        "x-lpv": "1",
        "x-lhm": "POST",
        //"x-lcs":'0005svgBAiJMiGMJdzBkKqR/78GAZEMOQ6E0p3FJkMBZA/NXe10zfYnVQDufzNaRMEW1nvYJYsLWZaWb4ww7EsebLNXGbuhmyAT2V4Fr3tA23xzvvbOaLjCahQK/4qrha2gC54XuPRbtSFNzALjs3rAyfWyczSnlenV/KFv06iqMmt1v+l3KBQdBkN9uLqGRTXzII0Y/rXtkw1wTYvMZZB7b6KunfzHf9AbFOMCqyveInGhYAetFN9Ly9x3kf2uC2czTSlynvelkYn4qn2VeGmAWOLqZrbQelyh/rRIFPttCILbOrWNEwv71Y7Pa1C0MTGFGlWWQQKlBHj0lcK+kJL13Ww==',
        "accept-encoding": "gzip",
    };
    if (Account.authToken == 0) {
        delete base_headers["x-line-access"];
    }
    let add_headers = url.searchParams.get("ex");
    if (add_headers) {
        add_headers = JSON.parse(extraH);
    } else {
        add_headers = {};
    }
    const headers = base_headers; //{ ...base_headers, ...add_headers };
    socket.onopen = () => {
        socket.send(JSON.stringify({ headers: headers }));
    };
    socket.onmessage = async (event) => {
        try {
            const parse = JSON.parse(event.data);
            const resp = await post(...parse.arg);
            resp.id = parse.id;
            socket.send(JSON.stringify(resp));
        } catch (e) {
        }
    };
    async function post(path, value, name, ptype = 4, add_headers = {}) {
        if (path === "!CONFIG") {
            switch (value) {
                case "UPDATE_TOKEN":
                    headers["x-line-access"] = name;
                    break;

                default:
                    break;
            }
            const ret = {}
            ret[value]=name
            return ret
        }
        const Protocol = Protocols[ptype];
        const send_headers = headers; //{ ...headers, ...add_headers };
        let res;
        if (Protocol !== Buffer) {
            try {
                res = {};
                const Trequest = write(value, name, Protocol);
                const x = Buffer.from(Trequest).toString("hex");
                console.log(x);
                const fet = await fetch("https://gw.line.naver.jp" + path, {
                    method: "POST",
                    headers: send_headers,
                    body: Trequest,
                });
                let bres = await fet.arrayBuffer();
                bres = new Uint8Array(bres);
                res = read(bres, Protocol);
            } catch (error) {
                res.err = error.stack;
            }
            return res;
        } else {
            try {
                res = {};
                const Trequest = new Uint8Array(
                    ...Buffer.from(value, "base64"),
                );
                //await Deno.writeFile("./tmpReq.bin", Trequest); /////////////////////////
                const fet = await fetch("https://gw.line.naver.jp" + path, {
                    method: "POST",
                    headers: headers,
                    body: Trequest,
                });
                let bres = await fet.arrayBuffer();
                bres = new Uint8Array(bres);
                res.b64 = Buffer.from(bres).toString("base64");
                //Deno.writeFile("./tmpRes.bin", res); /////////////////////////////
            } catch (error) {
                res.err = error.stack;
            }
            return res;
        }
    }
    return response;
}
