
import write from "./write_deno.js"
import read from "./read_deno.js"


export async function handler(request) {
  if(request.method=="POST"){
    const url=new URL(request.url)
    switch (url.pathname) {
      /*case "/parse-post-get":
        return await ppg(request,url);*/
      case "/j2t":
        return await j2t(request);
      case "/t2j":
        return await t2j(request);    
      default:
        break;
    }   
  }
return new Response(await Deno.readTextFile("./index.html"),{headers:{"content-type":"text/html"}})
}

async function ppg(request,url) {
  let json=await request.json()
  json["type"]=1
  const Trequest=write(json)
  console.log(Trequest);
  const fet = await fetch("https://gw.line.naver.jp/"+json.url,{
  method: 'POST',
  headers: {
  "Host": "gw.line.naver.jp",
  "accept": "application/x-thrift",/*
  "x-line-access": url.searchParams.get("auth"),
  "user-agent": url.searchParams.get("ua"),
  "x-line-application": url.searchParams.get("type"),*/
  "content-type": "application/x-thrift",
  "x-lal": "ja_JP",
  "x-lpv": "1",
  "accept-encoding": "gzip"
},
  body:Trequest
})
let res=await fet.arrayBuffer()
res=new Uint8Array(res)
return new Response(JSON.stringify(read(res)),{headers:{"content-type":"application/json"}})
}
async function j2t(request) {
  let json=await request.json()
  const Trequest=write(json)
  return new Response(Trequest,{headers:{"content-type":"application/x-thrift"}})
}
async function t2j(request) {
  let req=await request.arrayBuffer()
  req=new Uint8Array(req)
  const Tresponse=read(req)
  return new Response(Tresponse,{headers:{"content-type":"application/json"}})
}

Deno.serve(handler)