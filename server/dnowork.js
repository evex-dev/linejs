
export default async function ws(request) {
    const url = new URL(request.url)
    var auth, ua, type;
    ua = url.searchParams.get("ua"),
    type = url.searchParams.get("type")
    auth = url.searchParams.get("auth")
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
        return new Response('Expected Upgrade: websocket', { status: 426 });
    }
    async function post(res) {
        console.log(res,ua,type,auth)
        const fet = await fetch("https://gw.line.naver.jp/"+url.pathname.split("/")[2], {
            method: 'POST',
            headers: {
                "Host": "gw.line.naver.jp",
                "accept": "application/x-thrift",/*
        "x-line-access": url.searchParams.get("auth"),*/
                "user-agent": ua,
                "x-line-application": type,
                "x-line-access": auth,
                "content-type": "application/x-thrift",
                "x-lal": "ja_JP",
                "x-lpv": "1",
                "accept-encoding": "gzip"
            },
            body: res
        })

        res = await fet.arrayBuffer()
        return res
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