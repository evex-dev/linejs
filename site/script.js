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
            this.socketInfo.post = { status: "open", waitFunc: {} }
        };
        this.socket.post.onclose = (e) => {
            this.socketInfo.post.status = false
        };
        this.socket.post.onmessage = null
        this.socket.post.onclose = (e) => {
            this.socketInfo.post = { status: false }
        };
    }
    closeSocket() {
        try {
            this.socket.post.close()
        } catch (e) {
        }
    }
    post(data) {
        return new Promise((resolve, reject) => {
            data.id = Date.now()
            this.send(this.socket.post,this.socketInfo.post.waitFunc, data, resolve)
        })
    }
    postParseThrift = async (data) => {
        let reqJson, resJson;
        reqJson = data
        try {
            resJson = JSON.parse(await this.post(reqJson))
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
    send = (socket, FuncMap, data, returnFunc) => {
        if (socket.readyState === socket.OPEN) {
            socket.send(JSON.stringify(data))
            FuncMap[data.id] = (e) => {
                returnFunc(e.data)
            }
            socket.onmessage = (e) => {
                try {
                    let j = JSON.stringify(e.data)
                    FuncMap[j.id](e)
                } catch (error) {
                }
            }
        } else { return new Error("socket not open") }
    }
}

