
export default async function ws(request) {
    const url = new URL(request.url)
    var auth, ua, type, path;
    ua = url.searchParams.get("ua")
    type = url.searchParams.get("type")
    auth = url.searchParams.get("auth")
    path = url.searchParams.get("path")
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
        return new Response('Expected Upgrade: websocket', { status: 426 });
    }
    async function post(req) {
        let json = JSON.parse(req)
        let res = {}
        let id = json.id
        json["type"] = 1
        try {
            const Trequest = write(json)
            const fet = await fetch("https://gw.line.naver.jp" + path, {
                method: 'POST',
                headers: {
                    "Host": "gw.line.naver.jp",
                    "accept": "application/x-thrift",
                    "user-agent": ua,
                    "x-line-application": type,
                    "x-line-access": auth,
                    "content-type": "application/x-thrift",
                    "x-lal": "ja_JP",
                    "x-lpv": "1",
                    "accept-encoding": "gzip"
                },
                body: Trequest
            })

            res = await fet.arrayBuffer()
            res = new Uint8Array(res)
            res = read(res)
            res.id = id
        } catch (error) {
            console.log(error);
            res.err = error
            res.id = id
        }

        return JSON.stringify(res)
    }
    const { socket, response } = Deno.upgradeWebSocket(request);
    socket.onmessage = async (event) => {
        try {
            let resp = await post(event.data);
            socket.send(resp)
        } catch (e) {
            socket.send(e)
        }
    };
    return response
}