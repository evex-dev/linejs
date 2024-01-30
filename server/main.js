
import write from "./write_deno.js"
import read from "./read_deno.js"
import ws from "./dnowork.js"

export async function handler(request) {
  const url = new URL(request.url)

  switch (url.pathname.split("/")[1]) {
    case "j2t":
      return await j2t(request);
    case "t2j":
      return await t2j(request);
    case "post":
      return await ws(request);
    default:
      break;
  }

  switch (url.pathname) {
    case "/api":
      return new Response(await Deno.readTextFile("./site/api.html"), { headers: { "content-type": "text/html" } });
    case "/script.js":
      return new Response(await Deno.readTextFile("./site/script.js"), { headers: { "content-type": "appliction/script" } });
    default:
      break;
  }
  return new Response(await Deno.readTextFile("./site/index.html"), { headers: { "content-type": "text/html" } })
}

async function j2t(request) {
  if (request.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(request);
    socket.onmessage = (event) => {
      try {
        const Trequest = write(JSON.parse(event.data))
        socket.send(Trequest);
      } catch (e) {
        socket.send(e)
      }
    };
    return response;
  }
  let json = await request.json()
  const Trequest = write(json)
  return new Response(Trequest, { headers: { "content-type": "application/x-thrift" } })
}
async function t2j(request) {
  if (request.headers.get("upgrade") === "websocket") {
    const { socket, response } = Deno.upgradeWebSocket(request);
    socket.onmessage = (event) => {
      try {
        let req = new Uint8Array(event.data)
        const Tresponse = read(req)
        socket.send(JSON.stringify(Tresponse));
      } catch (e) {
        socket.send(e);
      }
    };
    return response;
  }
  let req = await request.arrayBuffer()
  req = new Uint8Array(req)
  const Tresponse = read(req)
  return new Response(JSON.stringify(Tresponse), { headers: { "content-type": "application/json" } })
}

Deno.serve(handler)