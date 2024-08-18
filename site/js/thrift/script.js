class LineThriftSocket {
    constructor(authToken, device, resolve, ontokenUpdate,addH) {
        this.socket = {};
        this.socketInfo = {};
        let appVer, sysName, sysVer, UA, appName;
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
        appName = device + "\t" + appVer + "\t" + sysName + "\t" + sysVer;
        UA = "Line/" + appVer;
        this.config = {
            ua: UA,
            appName: appName,
        };
        let account = { auth: authToken, ua: UA, type: appName };
        if (addH) {
            account["ex"] = JSON.stringify(addH);
        }
        this.wsURL = "ws" +
            location.protocol.replace(":", "").replace("http", "") + "://" +
            location.host + "/post?" + new URLSearchParams(account).toString();
        this.socket.post = new WebSocket(this.wsURL);
        this.socket.post.onopen = (e) => {
            try {
                setTimeout(() => resolve(this), 200);
            } catch (e) {
            }
            this.socketInfo.post = { status: "open", waitFunc: {} };
        };
        this.socket.post.onclose = (e) => {
            this.socketInfo.post.status = false;
        };
        this.socket.post.onmessage = null;
        this.socket.post.onclose = (e) => {
            this.socketInfo.post = { status: false };
        };
        this.socket.post.addEventListener("message",(e)=>{
            const data = JSON.parse(e.data)
            if (data.event) {
                ontokenUpdate(data.event)
            }
        })
    }
    closeSocket() {
        try {
            this.socket.post.close();
        } catch (e) {
        }
    }
    reOpenSocket(resolve) {
        this.closeSocket();
        this.socket.post = new WebSocket(this.wsURL);
        this.socket.post.onopen = (e) => {
            try {
                setTimeout(() => resolve(this), 200);
            } catch (e) {
            }
            this.socketInfo.post = { status: "open", waitFunc: {} };
        };
        this.socket.post.onclose = (e) => {
            this.socketInfo.post.status = false;
        };
        this.socket.post.onmessage = null;
        this.socket.post.onclose = (e) => {
            this.socketInfo.post = { status: false };
        };
    }
    post(data) {
        return new Promise((resolve, reject) => {
            data = { arg: data };
            data.id = Date.now();
            this.send(
                this.socket.post,
                this.socketInfo.post.waitFunc,
                data,
                resolve,
            );
        });
    }

    async postParseThrift(data) {
        let reqJson, resJson;
        reqJson = data;
        resJson = await this.post(reqJson);
        if (resJson.err) {
            throw new Error("Server Error : " + resJson.err);
        }
        return resJson;
    }

    postRequestAndGetResponse(
        CHRdata,
        methodName,
        protocol_type = 3,
        path = "/S3",
        headers = {},
    ) {
        return new Promise((resolve, reject) => {
            const request = [path, CHRdata, methodName, protocol_type, headers];
            this.postParseThrift(request).then((r) => resolve(r)).catch((e) => {
                this.reOpenSocket(() => {
                    this.postParseThrift(request).then((r) => resolve(r));
                });
            });
        });
    }
    async serverConfig(
        type,
        value,
    ) {
        const request = ["!CONFIG", type, value];
        const response = await this.postParseThrift(request);
        return response;
    }
    send(socket, FuncMap, data, returnFunc) {
        if (socket.readyState === socket.OPEN) {
            socket.send(JSON.stringify(data));
            FuncMap[data.id] = (e) => {
                returnFunc(e);
            };
            socket.onmessage = (e) => {
                let j = JSON.parse(e.data);
                try {
                    FuncMap[j.id](j);
                    delete FuncMap[j.id];
                } catch (error) {
                }
            };
        } else throw new Error("socket not open");
    }
}
class LineClient extends Classes(
    //LoginAPI,
    LineMethod,
    ChannelService,
    SquareServise,
    LiffServise,
    LINEServise,
) {
    constructor() {
        super();
    }
    async init({
        authToken,
        device,
        email,
        pw,
        pincall,
        noLogin,
    }) {
        if (!authToken) {
            authToken = 0;
        }
        this.deviceName = device;
        await new Promise((resolve, reject) => {
            this.thrift = new LineThriftSocket(authToken, device, () => {
                setTimeout(async () => {
                    if (!authToken && !noLogin) {
                        return;
                    }
                    if (!authToken) {
                        return;
                    }
                    this.getProfile().then(() => {
                        resolve();
                    }).catch((e) => {
                        throw new Error(
                            "authTokenが間違っているか期限切れです。もう一度ログインしてください\n" +
                                e,
                        );
                    });
                }, 200);
            },(t)=>{
                this.authToken = t
            });
        });
        this.parser = new ThriftRenameParser();
        this.parser.def = await fetch("./res/thrift.json").then((r) =>
            r.json()
        );
        this.authToken = authToken;
        if ((!authToken) && (!noLogin)) {
            await this.loginMP(email, pw, pincall);
        }
    }
    async setAuthToken(authToken) {
        this.authToken = authToken;
        await this.thrift.serverConfig("UPDATE_TOKEN", authToken);
        await this.getProfile();
    }
    async request(
        CHRdata,
        methodName,
        protocol_type = 3,
        parse = true,
        path = "/S3",
        headers = {},
    ) {
        const res = await this.thrift.postRequestAndGetResponse(
            [
                [
                    12,
                    1,
                    CHRdata,
                ],
            ],
            methodName,
            protocol_type,
            path,
            headers,
        );
        if (res.e) {
            throw new Error(JSON.stringify(res.e, null, 2), { cause: res.e });
        }
        if (this.parser && (parse === true)) {
            this.parser.rename_data(res);
        } else if (this.parser && parse) {
            return this.parser.rename_thrift(parse, res.value);
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
        const res = await this.thrift.postRequestAndGetResponse(
            CHRdata,
            methodName,
            protocol_type,
            path,
            headers,
        );
        if (res.e) {
            throw new Error(JSON.stringify(res.e, null, 2), { cause: res.e });
        }
        if (this.parser && (parse === true)) {
            this.parser.rename_data(res);
        } else if (this.parser && parse) {
            return this.parser.rename_thrift(parse, res.value);
        }
        return res.value;
    }
    async parse_request(
        data,
        methodName,
        protocol_type = 3,
        parse = true,
        path = "/S3",
        headers = {},
        parseName,
    ) {
        if (!parseName) {
            parseName = methodName.substr(0, 1).toUpperCase() +
                methodName.substr(1) + "Request";
        }
        const CHRdata = this.parser.parse_data(parseName, data);
        return this.request(
            CHRdata,
            methodName,
            protocol_type,
            parse,
            path,
            headers,
        );
    }
    async proxyFetch(url, headers = {}, method = "GET", body = null) {
        const requrl = new URL(url);
        const reqhost = btoa(requrl.protocol + "//" + requrl.host).replace(
            "=",
            "",
        );
        const reqpath = requrl.pathname + requrl.search;
        return await fetch(
            location.origin + "/proxy/" + reqhost + "/path" + reqpath,
            {
                headers: headers,
                method: method,
                body: body,
            },
        );
    }
    async proxyFetchx(url, arg) {
        const requrl = new URL(url);
        const reqhost = btoa(requrl.protocol + "//" + requrl.host).replace(
            "=",
            "",
        );
        const reqpath = requrl.pathname + requrl.search;
        return await fetch(
            location.origin + "/proxy/" + reqhost + "/path" + reqpath,
            arg,
        );
    }
    sleep() {
        this.thrift.closeSocket();
    }
    wake() {
        this.thrift.reOpenSocket();
    }
    timeout(f, t, e) {
        return new Promise((resolve, reject) => {
            let time = true;
            f().then((res) => {
                resolve(res);
                time = false;
            });
            setTimeout(() => {
                if (time) {
                    reject("Time Out");
                    e();
                }
            }, t);
        });
    }
    toJSON() {
        return {
            device: this.deviceName,
            authToken: this.authToken,
            profile: this.profile,
        };
    }
    toString() {
        return "LineClient(" + (JSON.stringify({
            device: this.deviceName,
            authToken: this.authToken,
        })) + ")";
    }
}
//export {LineSquareClient,LineTCompactSocket}
function Classes(...bases) {
    class Bases {
        constructor() {
            bases.forEach((base) => Object.assign(this, new base()));
        }
    }
    bases.forEach((base) => {
        Object.getOwnPropertyNames(base.prototype)
            .filter((prop) => prop != "constructor")
            .forEach((prop) => Bases.prototype[prop] = base.prototype[prop]);
    });
    return Bases;
}
let Line = {};
