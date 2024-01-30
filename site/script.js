class LineTCompactSocket {
    constructor(gwPath, authToken, device) {
        this.socket = {}
        this.socketInfo = {}
        let appVer, sysName, sysVer, UA, appName;
        sysVer = "12.1.4"
        switch (device) {
            case "DESKTOPWIN":
                appVer = "7.16.1.3000"
                sysName = "WINDOWS"
                sysVer = "10.0.0-NT-x64"
                break;
            case "DESKTOPMAC":
                appVer = "7.16.1.3000"
                sysName = "MAC"
                break;
            case "CHROMEOS":
                appVer = "3.0.3"
                sysName = "Chrome_OS"
                sysVer = "1"
                break;
            case "ANDROID":
                appVer = "13.4.1"
                sysName = "Android OS"
                break;
            case "IOS":
                appVer = "13.3.0"
                sysName = "iOS"
                break;
            case "IOSIPAD":
                appVer = "13.3.0"
                sysName = "iOS"
                break;
            case "WATCHOS":
                appVer = "13.3.0"
                sysName = "Watch OS"
                break;
            case "WEAROS":
                appVer = "13.4.1"
                sysName = "Wear OS"
                break;
            default:
                return new Error("device name is wrong")
                break;
        }
        appName = device + "\t" + appVer + "\t" + sysName + "\t" + sysVer
        UA = "Line/" + appVer
        let account = { path: gwPath, auth: authToken, ua: UA, type: appName }
        this.socket.post = new WebSocket("wss://parse-tcompact.deno.dev/post?" + new URLSearchParams(account).toString())
        this.socket.post.onopen = (e) => {
            this.socketInfo.post = { status: "open" }
        };
        this.socket.post.onclose = (e) => {
            this.socketInfo.post.status = false
        };
        this.socket.post.onmessage = null
        this.socket.post.onclose = (e) => {
            this.socketInfo.post = { status: false }
        };


        this.socket.j2t = new WebSocket(`wss://parse-tcompact.deno.dev/j2t`)
        this.socket.j2t.onopen = (e) => {
            this.socketInfo.j2t = { status: "open" }
        };
        this.socket.j2t.onclose = (e) => {
            this.socketInfo.j2t = { status: "open" }
        };
        this.socket.j2t.onmessage = null


        this.socket.t2j = new WebSocket(`wss://parse-tcompact.deno.dev/t2j`)
        this.socket.t2j.onopen = (e) => {
            this.socketInfo.t2j = { status: "open" }
        };
        this.socket.t2j.onclose = (e) => {
            this.socketInfo.t2j = { status: false }
        };
        this.socket.t2j.onmessage = null
    }
    isOpen() {
        try {
            if ((this.socketInfo.j2t.status === "open") + (this.socketInfo.t2j.status === "open") + (this.socketInfo.post.status === "open") === 3) {
                return true
            }
        } catch (e) {
        }
        return false
    }
    closeSocket() {
        try {
            this.socket.j2t.close()
        } catch (e) {
        }
        try {
            this.socket.t2j.close()
        } catch (e) {
        }
        try {
            this.socket.post.close()
        } catch (e) {
        }
        LineTCompactSocket = null
    }
    j2t(data) {
        return new Promise((resolve, reject) => {
            send(this.socket.j2t, data, resolve)
        })
    }
    post(data) {
        return new Promise((resolve, reject) => {
            send(this.socket.post, data, resolve)
        })
    }
    t2j(data) {
        return new Promise((resolve, reject) => {
            send(this.socket.t2j, data, resolve)
        })
    }
    postParseThrift = async (data) => {
        let reqJson, reqTCompact, resTCompact, resJson;
        reqJson = JSON.stringify(data)
        try {
            reqTCompact = await this.j2t(reqJson)
            resTCompact = await this.post(reqTCompact)
            resJson = JSON.parse(await this.t2j(resTCompact))
        } catch (error) {
            return new Error("server error")
        }
        return resJson
    }
    postRequestAndGetResponse = async (data, methodName) => {
        let request = { value: data, name: methodName, type: 1 }
        let response = await this.postParseThrift(request)
        return response
    }
}

const send = (socket, data, returnFunc) => {
    if (socket.readyState === socket.OPEN) {
        if (socket.onmessage) {
            let interval = setInterval(() => {
                if (socket.onmessage) {
                } else {
                    socket.send(data)
                    socket.onmessage = (e) => {
                        socket.onmessage = null
                        returnFunc(e.data)
                    }
                    clearInterval(interval)
                }
            }, 10)
        } else {
            socket.send(data)
            socket.onmessage = (e) => {
                socket.onmessage = null
                returnFunc(e.data)
            }
        }
    } else { return new Error("socket not open") }
}