export default async function proxy(request) {
<<<<<<< HEAD
    const url = new URL(request.url)
    const domain = atob(url.pathname.split("/")[2])
    const path = url.pathname.substring(url.pathname.indexOf("/path")+5)
    const proxyRequest = new Request(domain+path+url.search,{
        body:request.body,
        method:request.method,
        headers:request.headers
    })
    delete proxyRequest.headers.referer
    delete proxyRequest.headers.origin
    return await fetch(proxyRequest)
}
=======
	const url = new URL(request.url);
	const domain = atob(url.pathname.split("/")[2]);
	const path = url.pathname.substring(url.pathname.indexOf("/path") + 5);
	let proxyRequest = new Request(domain + path + url.search, {
		body: request.body,
		method: request.method,
		headers: request.headers,
	});
	delete proxyRequest.headers.referer;
	delete proxyRequest.headers.origin;
	return await fetch(proxyRequest);
}
>>>>>>> Line-Deno-Client/dev
