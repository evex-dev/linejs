
import write from "./write_deno.js"
import read from "./read_deno.js"
import ws from "./dnowork.js"

export async function handler(request) {
  const url = new URL(request.url)

  switch (url.pathname.split("/")[1]) {
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



Deno.serve(handler)