
import write from "./server/write_deno.js"
import read from "./server/read_deno.js"


export async function handler(request) {
  const url = new URL(request.url)
  if (request.method == "POST") {
    switch (url.pathname) {
      case "/api":
        return await ppg(request, url);
      case "/j2t":
        return await j2t(request);
      case "/t2j":
        return await t2j(request);
      default:
        break;
    }
  }
  switch (url.pathname) {
    case "/api":
      return new Response(await Deno.readTextFile("./site/api.html"), { headers: { "content-type": "text/html" } });
    default:
      break;
  }
  return new Response(await Deno.readTextFile("./site/index.html"), { headers: { "content-type": "text/html" } })
}

async function ppg(request, url) {
  let json = await request.json()
  json["type"] = 1
  const Trequest = write(json)
  console.log(Trequest);
  let auth;
  if (url.searchParams.get("auth")) {
    auth = url.searchParams.get("auth")
  } else {
    auth = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI3YzExZGYxMS01NDA0LTQ2NWEtOTFlYS1iNTkxYTkwOWQ5YjgiLCJhdWQiOiJMSU5FIiwiaWF0IjoxNzA2MTc0OTg4LCJleHAiOjE3MDY3Nzk3ODgsInNjcCI6IkxJTkVfQ09SRSIsInJ0aWQiOiIzYTk3OWRkOS0xNjYyLTQ2ZWItOTdjMS1hZDY0YWIwNzUwNTUiLCJyZXhwIjoxNzM3NzEwOTg4LCJ2ZXIiOiIzLjAiLCJhaWQiOiJ1NGMwNDJlNzYzMTQzMGNlYjM4ODI0ZTNmNzBmYTQ5NGYiLCJsc2lkIjoiMWNjZjAwYTEtN2ZiYy00NjZkLTk1MDItYTM3OTJiMjkyYjIwIiwiZGlkIjoiTk9ORSIsImN0eXBlIjoiREVTS1RPUF9XSU4iLCJjbW9kZSI6IlNFQ09OREFSWSIsImNpZCI6IjAxMDAwMDAwMDAifQ.KJju45PTUsCg7pPiT_aeuKa3D0UFIvufc9VZ2NnGYhg"
  }
  const fet = await fetch("https://gw.line.naver.jp/" + json.url, {
    method: 'POST',
    headers: {
      "Host": "gw.line.naver.jp",
      "accept": "application/x-thrift",
      "x-line-access": auth,
      "user-agent": url.searchParams.get("ua"),
      "x-line-application": url.searchParams.get("type"),
      "content-type": "application/x-thrift",
      "x-lal": "ja_JP",
      "x-lpv": "1",
      "accept-encoding": "gzip"
    },
    body: Trequest
  })
  let res = await fet.arrayBuffer()
  res = new Uint8Array(res)
  return new Response(JSON.stringify(read(res)), { headers: { "content-type": "application/json" } })
}
async function j2t(request) {
  let json = await request.json()
  const Trequest = write(json)
  return new Response(Trequest, { headers: { "content-type": "application/x-thrift" } })
}
async function t2j(request) {
  let req = await request.arrayBuffer()
  req = new Uint8Array(req)
  const Tresponse = read(req)
  return new Response(JSON.stringify(Tresponse), { headers: { "content-type": "application/json" } })
}

Deno.serve(handler)