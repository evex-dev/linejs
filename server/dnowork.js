
import write from "./write_deno.js"
import read from "./read_deno.js"

export default async function ws(request) {
    const url = new URL(request.url)
    var path;
    path = url.searchParams.get("path")
    const upgradeHeader = request.headers.get('Upgrade');
    if (!upgradeHeader || upgradeHeader !== 'websocket') {
        return new Response('Expected Upgrade: websocket', { status: 426 });
    }
    async function post(req,headers) {
        let json,res,id;
        try{
        json = JSON.parse(req)
        res = {}
        id = json.id
        
            const Trequest = write(json)
            //await Deno.writeFile("./tmpReq.bin",Trequest)
            const fet = await fetch("https://gw.line.naver.jp" + path, {
                method: 'POST',
                headers: headers,
                body: Trequest
            })

            res = await fet.arrayBuffer()
            res = new Uint8Array(res)
            //await Deno.writeFile("./tmpRes.bin",res)
            res = read(res)
            res.id = id
        } catch (error) {
            console.log("[err] ",error)
            res.err = error.stack
            res.id = id
        }

        return JSON.stringify(res)
    }
    const { socket, response } = Deno.upgradeWebSocket(request);
    
    var auth, ua, type, extraH;
    ua = url.searchParams.get("ua")
    type = url.searchParams.get("type")
    auth = url.searchParams.get("auth")
    extraH = url.searchParams.get("ex")
    var headers={
        "Host": "gw.line.naver.jp",
        "accept": "application/x-thrift",
        "user-agent": ua,
        "x-line-application": type,
        "x-line-access": auth,
        "content-type": "application/x-thrift",
        "x-lal": "ja_JP",
        "x-lpv": "1",
        "accept-encoding": "gzip"
    }
    if (auth==0) {
        delete headers["x-line-access"]
    }
    if (extraH) {
        extraH=JSON.parse(extraH)
        Object.keys(extraH).forEach((e)=>{
            headers[e]=extraH[e]
        })
    }
    socket.onmessage = async (event) => {
        try {
            //console.log("[msg] ",event.data)
            let resp = await post(event.data,headers);
            socket.send(resp)
        } catch (e) {
            socket.send('{"server":"error"}')
        }
    };
    return response
}

export async function interval(data){

}