
import write from "./write_deno.js"
import read from "./read_deno.js"


export async function handler(request) {
  const url = new URL(request.url)
  if (request.method == "POST") {
    switch (url.pathname) {
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