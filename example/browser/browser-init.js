(function () {
	const script = document.createElement("script");
	script.innerHTML = `
   import * as LINEJS from "https://esm.sh/v135/@jsr/evex__linejs@2.0.0-rc1/es2022/evex__linejs.mjs";
   
   document.body.innerHTML = "";
   class LocalStorage {
    prefix = "linejs:";
    set(
     key,
     value,
    ) {
     localStorage.setItem(this.prefix + key, JSON.stringify(value));
    }
    get(
     key,
    ) {
     try {
      return JSON.parse(
       localStorage.getItem(this.prefix + key) || "null",
      );
     } catch (_) {
     }
    }
    delete(key) {
     localStorage.removeItem(this.prefix + key);
    }
    clear() {
     localStorage.clear();
    }
    migrate(storage) {
     for (let index = 0; index < localStorage.length; index++) {
      const k = localStorage.key(index);
      if (k) {
       storage.set(
        k.replace(this.prefix, ""),
        localStorage.getItem(k),
       );
      } else {
       continue;
      }
     }
    }
   }
   function log(message) {
    const p = document.createElement("p");
    p.innerText = message;
    document.body.appendChild(p);
   }
   globalThis.LINEJS = LINEJS;
   const client = new LINEJS.Client({ device: prompt("device?", "IOSIPAD"), storage: new LocalStorage(), endpoint: location.hostname });
   client.fetch = window.fetch.bind(window);
   client.on("log", (p) => console.log(p));
   client.on("qrcall", (q) => {
    const div = document.createElement("div");
    div.innerText = "read qrcode: ";
    const img = document.createElement("img");
    img.src = \`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=\${encodeURIComponent(q)}\`;
    div.appendChild(img);
    document.body.appendChild(div);
   });
   client.on("pincall", (pincode) => {
    log(\`enter pincode: \${pincode}\`);
   });
   client.on("update:authtoken", (authToken) => {
    localStorage.setItem("lastAuthToken", authToken);
   });
   client.on("ready", async (user) => {
    log(\`Logged is as \${user.displayName} (\${user.mid})\`);
    console.log(client);
   });
   const authToken = prompt("authToken", localStorage.getItem("lastAuthToken") || "");
   if (authToken) {
    client.login({ authToken });
   } else {
    const email = prompt("email", localStorage.getItem("lastEmail") || "");
    if (email) {
     localStorage.setItem("lastEmail", email);
     const password = prompt("password", localStorage.getItem("lastPw") || "");
     localStorage.setItem("lastPw", password);
     client.login({ password, email });
    } else {
     client.login();
    }
   }
   globalThis.client = client;
`;
	script.type = "module";
	document.body.appendChild(script);
})();
