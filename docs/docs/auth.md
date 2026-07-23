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
`update:authtoken` event every time the token is issued or refreshed, so the
recommended pattern is:

```ts
import {
  loginWithAuthToken,
  loginWithPassword,
} from "@evex/linejs";
import { FileStorage } from "@evex/linejs/storage";

const storage = new FileStorage("./session.json");
const TOKEN_KEY = "userAuthToken";

const saved = await storage.get(TOKEN_KEY);

const client = typeof saved === "string" && saved
  // Prefer authToken login to reduce ban risk.
  ? await loginWithAuthToken(saved, { device: "IOSIPAD", storage })
  : await loginWithPassword({
    email: "you@example.com",
    password: "password",
    onPincodeRequest(pin) {
      console.log("Enter this pincode:", pin);
    },
  }, { device: "IOSIPAD", storage });

// Persist token whenever LINEJS issues or refreshes it.
client.base.on("update:authtoken", async (tok) => {
  await storage.set(TOKEN_KEY, tok);
});

// Save the current token immediately in case the event fires before this handler
// is attached (e.g. right after a fresh password login).
if (client.base.authToken) {
  await storage.set(TOKEN_KEY, client.base.authToken);
}
```

With this pattern, the first run uses email + password (and PIN) and every
subsequent run reuses the saved token silently.
