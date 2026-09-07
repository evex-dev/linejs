# Authentication

You can authenticate with password login, QR login, or an existing auth token.

## Login

Login helpers return a high-level `Client`. Each helper also needs client init
options, including the device to emulate.

### `loginWithPassword`

Here is an example:
```ts
import { loginWithPassword } from "@evex/linejs";

const client = await loginWithPassword({
  email: 'you@example.com', // e-mail address
  password: 'password', // Password
  onPincodeRequest(pincode) {
    console.log('Enter this pincode to your LINE app:', pincode)
  }
}, {
  device: "IOSIPAD",
})
```

email and password are required. On first login, you have to enter pincode on mobile app for enable e2ee.
`onPincodeRequest` can receive a pincode and you can output it with that method to tell users pincode.

### `loginWithQR`

In this way, email and password is not needed.

```ts
import { loginWithQR } from "@evex/linejs";

const client = await loginWithQR({
  onReceiveQRUrl(url) {
    console.log("Access this URL:", url);
  },
  onPincodeRequest(pincode) {
    console.log("Enter this pincode to your LINE app:", pincode);
  },
}, {
  device: "ANDROIDSECONDARY",
})
```

The function gives an url to read on mobile. You have to create QR with yourself if you want to show QR code, this is because of LINEJS doesn't support creating QR code.

## With authToken

There is a possibility to banned your account if you tried login many times, so you should use authToken to get authenticated.

```ts
import { loginWithAuthToken } from "@evex/linejs";

const client = await loginWithAuthToken("YOUR_AUTH_TOKEN", {
  device: "IOSIPAD",
});
```

### Persisting authToken across sessions

`FileStorage` automatically persists things like `cert`, `refreshToken` and
`expire`, but **the `authToken` itself is not one of them** — you need to save
it yourself if you want to reuse it on the next run. LINEJS emits an
`update:authtoken` events when tokens are issued or refreshed. Attach the
listener **before login**, since login itself can rotate the token:

```ts
import { Client } from "@evex/linejs";
import { BaseClient } from "@evex/linejs/base";
import { FileStorage } from "@evex/linejs/storage";

const storage = new FileStorage("./session.json");
const TOKEN_KEY = "userAuthToken";
const base = new BaseClient({ device: "IOSIPAD", storage });

// Event listeners are not awaited by the emitter. Queue writes in order and
// handle failures without creating an unhandled rejection.
let pendingSave = Promise.resolve();
base.on("update:authtoken", (token) => {
  base.authToken = token;
  pendingSave = pendingSave.then(() => storage.set(TOKEN_KEY, token)).catch(() => {
    console.error("Could not persist the LINE session token.");
  });
});
base.on("pincall", (pin) => console.log("Enter this pincode:", pin));

const saved = await storage.get(TOKEN_KEY);

await base.loginProcess.login(typeof saved === "string" && saved
  ? { authToken: saved }
  : {
    email: "you@example.com",
    password: "password",
  });
await pendingSave;
const client = new Client(base);
// Use client here. Also await pendingSave before an explicit process exit.
```

The first run uses email + password (and PIN); later runs attempt to reuse the
saved token. Expired or revoked credentials can still require manual login.
Do not automatically loop password logins on every error.

`session.json` contains plaintext credentials and E2EE key material. Exclude it
from version control, restrict file access to your user, and do not log or share
its contents. Load your password from a private configuration or environment
variable rather than committing it. Token reuse does not guarantee account safety.
