# LINEJS in Browser

In a browser, you cannot use the Fetch API to send requests to the LINE endpoint
because of CORS.

The best option is to set a proxy server to the LINE endpoint.

However, you can get around this issue by calling LINEJS from a bookmarklet on a
page such as https://legy-jp.line-apps.com/sn. (An example of this can be found
in [browser-init.js](browser-init.js))
