class LineTCompactSocket {
    constructor(gwPath, authToken, device, resolve, extraH) {
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
        this.config = {
            ua: UA,
            appName: appName
        }
        let account = { path: gwPath, auth: authToken, ua: UA, type: appName }
        if (extraH) {
            account["ex"] = JSON.stringify(extraH)
        }
        this.wsURL = "ws" + location.protocol.replace(":", "").replace("http", "") + "://" + location.host + "/post?" + new URLSearchParams(account).toString()
        this.socket.post = new WebSocket(this.wsURL)
        this.socket.post.onopen = (e) => {
            try {
                resolve(this)
            } catch (e) {

            }
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
    reOpenSocket(resolve) {
        this.socket.post = new WebSocket(this.wsURL)
        this.socket.post.onopen = (e) => {
            try {
                resolve(this)
            } catch (e) {

            }
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
    post(data) {
        return new Promise((resolve, reject) => {
            data.id = Date.now()
            this.send(this.socket.post, this.socketInfo.post.waitFunc, data, resolve)
        })
    }
    postr(data) {
        return new Promise((resolve, reject) => {
            data.id = Date.now()
            this.sendr(this.socket.post, this.socketInfo.post.waitFunc, data, resolve)
        })
    }
    postAndCheckResponse(data) {
        return new Promise((resolve, reject) => {
            this.post(data).then((r) => {
                if (r.err) {
                    throw new Error(r.err)
                } else {
                    resolve(r)
                }
            })
        })
    }
    sendr(socket, FuncMap, data, returnFunc) {
        if (socket.readyState === socket.OPEN) {
            socket.send(JSON.stringify(data))
            FuncMap[data.id] = (e) => {
                returnFunc(e.data)
            }
            socket.onmessage = (e) => {
                try {
                    let j = new Uint8Array(e.data)
                    let id = 0
                    for (let index = 0; index < j[2]; index++) {
                        const element = j[3 + index];
                        id += element * (0xff ** index)
                    }
                    FuncMap[id](j.slice(3 + j[2]))
                    delete FuncMap[id]
                } catch (error) {
                    try {
                        let j = JSON.parse(e.data)
                        FuncMap[j.id](e)
                        delete FuncMap[j.id]
                    } catch (e) { }
                }
            }
        } else { throw new Error("socket not open") }
    }

    async postParseThrift(data) {
        let reqJson, resJson;
        reqJson = data
        resJson = JSON.parse(await this.postAndCheckResponse(reqJson))
        if (reqJson.err) {
            throw new Error("Server Error : " + reqJson.err)
        }
        return resJson
    }
    async postRRequestAndGetRResponse(data, isBuf = false) {
        let request = { value: data, type: 5 }
        if (isBuf) {
            request.name = "b64"
            request.value = btoa([...data].map(n => String.fromCharCode(n)).join(""));
        }
        let response = await this.postr(request)
        return response
    }
    async postCHRRequestAndGetResponse(data, methodName) {
        let request = { value: data, name: methodName, type: 3 }
        let response = await this.postParseThrift(request)
        return response.value
    }
    async postRequestAndGetResponse(data, methodName) {
        let request = { value: data, name: methodName, type: 1 }
        let response = await this.postParseThrift(request)
        return response.value
    }
    async postRequestAndGetContinueResponse(data, methodName) {
        let responseList = []
        let addKeys = []
        let noAddKeys = []
        let request = { value: data, name: methodName, type: 1 }
        let response = await this.postParseThrift(request)
        responseList.push(response.value)
        while (response.value.continuationToken) {
            request.value.continuationToken = response.value.continuationToken
            request.value.syncToken = response.value.syncToken
            response = await this.postParseThrift(request)
            responseList.push(response.value)
        }
        Object.keys(responseList[0]).forEach((e) => {
            if ((typeof responseList[0][e]) == "object") {
                addKeys.push(e)
            } else {
                noAddKeys.push(e)
            }
        })
        let returnjson = {}
        responseList.forEach((e) => {
            noAddKeys.forEach((f) => {
                returnjson[f] = e[f]
            })
            addKeys.forEach((g) => {
                if (e[g].forEach) {
                    if (returnjson[g]) {
                        returnjson[g] = [...returnjson[g], ...e[g]]
                    } else {
                        returnjson[g] = e[g]
                    }
                } else {
                    if (returnjson[g]) {
                        returnjson[g] = { ...returnjson[g], ...e[g] }
                    } else {
                        returnjson[g] = e[g]
                    }
                }
            })
        })
        return returnjson
    }
    send(socket, FuncMap, data, returnFunc) {
        if (socket.readyState === socket.OPEN) {
            socket.send(JSON.stringify(data))
            FuncMap[data.id] = (e) => {
                returnFunc(e.data)
            }
            socket.onmessage = (e) => {
                try {
                    let j = JSON.parse(e.data)
                    FuncMap[j.id](e)
                    delete FuncMap[j.id]
                } catch (error) {
                    try {
                        let j = new Uint8Array(e.data)
                        let id = 0
                        for (let index = 0; index < j[2]; index++) {
                            const element = j[3 + index];
                            id += element * (0xff ** index)
                        }
                        FuncMap[id](j.slice(3 + j[2]))
                        delete FuncMap[id]
                    } catch (error) {
                    }
                }
            }
        } else { throw new Error("socket not open") }
    }
}

class LineSquareClient {
    constructor(authToken, device, resolve) {
        this.S4 = new LineTCompactSocket("/S4", authToken, device, ()=>{
            setTimeout(async () => {
                let res=await this.S4.postCHRRequestAndGetResponse([],"getProfile")
                this.mid=res[1]
                this.name=res[20]
                try {
                    resolve()
                } catch (error) {
                }
            },200)
        })
        this.SQ1 = new LineTCompactSocket("/SQ1", authToken, device)
        this.authToken = authToken
        this.deviceName = device
    }
    async findSquareByInvitationTicket(ticket) {
        let v = { invitationTicket: ticket }
        let n = "findSquareByInvitationTicket"
        return await this.SQ1.postRequestAndGetResponse(v, n)
    }
    async getJoinedSquares() {
        let v = { limit: 100 }
        let n = "getJoinedSquares"
        return await this.SQ1.postRequestAndGetContinueResponse(v, n)
    }
    async searchSquareMembers(squareMid, searchOption = {}) {
        let v = {
            squareMid: squareMid,
            searchOption: searchOption,
            limit: 200
        }
        let n = "searchSquareMembers"
        return await this.SQ1.postRequestAndGetContinueResponse(v, n)
    }
    async getBannedMembers(squareMid) {
        return await this.searchSquareMembers(squareMid, { "membershipState": 6 })
    }
    async sendTxtMessage(squareChatMid, text, contentMetadata = {}, reqSeq = 1) {
        let v = {
            reqSeq: reqSeq,
            squareChatMid: squareChatMid,
            squareMessage: {
                message: {
                    to: squareChatMid,
                    contentType: 0,
                    text: text,
                    contentMetadata: contentMetadata
                }
            },
        }
        let n = "sendMessage"
        return await this.SQ1.postRequestAndGetResponse(v, n)
    }
    async fetchMyEvents(syncToken) {
        let v = {
            syncToken: syncToken,
            limit: 200
        }
        if (!v.syncToken) {
            delete v.syncToken
        }
        let n = "fetchMyEvents"
        return await this.SQ1.postRequestAndGetContinueResponse(v, n)
    }
    async fetchSquareChatEvents(squareChatMid, syncToken) {
        let v = {
            squareChatMid: squareChatMid,
            limit: 50
        }
        if (syncToken) {
            v.syncToken = syncToken
        }
        let n = "fetchSquareChatEvents"
        return await this.SQ1.postRequestAndGetResponse(v, n)
    }
    async getSquareMember(mid) {
        return await this.SQ1.postCHRRequestAndGetResponse([12, 1, [11, 2, mid]], "getSquareMember")
    }
    async getJoinedSquareChats() {
        let syncToken = (Number((await LINE.SQ1.postRequestAndGetResponse({ limit: 10 }, "fetchMyEvents")).syncToken) - 30000).toString()
        let data = await LINE.SQ1.postRequestAndGetResponse({ limit: 30000, syncToken: syncToken }, "fetchMyEvents")
        let chats = new Set()
        data.events.forEach((e) => {
            if (e.type == 29) {
                chats.add(e.payload.notificationMessage.squareChatMid)
            }
        })
        let joinedChats = []
        for (let e of chats) {
            let ch = (await LINE.SQ1.postRequestAndGetResponse({ squareChatMid: e }, "getSquareChat"))
            if (ch.squareChatMember) {
                joinedChats.push(ch)
            }
        }
        joinedChats.sort((a, b) => {
            return b.squareChatStatus.lastMessage.message.createdTime - a.squareChatStatus.lastMessage.message.createdTime;
        })
        return joinedChats
    }
    async getSquareChat(mid) {
        return await LINE.SQ1.postRequestAndGetResponse({ squareChatMid: mid }, "getSquareChat")
    }

    async proxyFetch(url, headers = {}, method = "GET", body = null) {
        let requrl = new URL(url)
        let reqhost = btoa(requrl.protocol + requrl.host).replace("=", "")
        let reqpath = requrl.pathname + requrl.search
        return await fetch(location.origin + "/proxy/" + reqhost + "/path" + reqpath, {
            headers: headers,
            method: method,
            body: body
        })
    }
    async sleep() {
        this.SQ1.closeSocket()
    }
    async wake() {
        this.SQ1.reOpenSocket()
    }

}
//export {LineSquareClient,LineTCompactSocket}