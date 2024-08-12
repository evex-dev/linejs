import loginMP from "./login.js";
import ws from "./denows.js"
import proxy from "./proxy.js"

export async function handler(request) {
  const url = new URL(request.url)

  switch (url.pathname.split("/")[1]) {
    case "post":
      return ws(request);
    case "proxy":
      return await proxy(request);
      case "login_mp":
        return loginMP(request);
    default:
      break;
  }
  try {
    let mimeType = "text/html"
    switch (url.pathname.split(".")[url.pathname.split(".").length - 1]) {
      case "html":
        mimeType = "text/html"
        break;
      case "js":
        mimeType = "application/javascript"
        break;
      case "svg":
        mimeType = "image/svg+xml"
        break;
      case "css":
        mimeType = "text/css"
        break;
      default:
        break;
    }
    return new Response(await Deno.readTextFile("./site" + url.pathname), { headers: { "content-type": mimeType } });
  } catch (error) {
  }
  return new Response(await Deno.readTextFile("./site/index.html"), { headers: { "content-type": "text/html", "deno-status": "error" } })
}


Deno.serve({port:7070},handler)
