
import ws from "./dnowork.js"

export async function handler(request) {
  const url = new URL(request.url)

  switch (url.pathname.split("/")[1]) {
    case "post":
      return await ws(request);
    default:
      break;
  }
  try {
    return new Response(await Deno.readTextFile("./site"+url.pathname), { headers: { "content-type": "text/html" } });
  } catch (error) {
  }
    return new Response(await Deno.readTextFile("./site/index.html"), { headers: { "content-type": "text/html" ,"server":"error"} })
}



Deno.serve(handler)