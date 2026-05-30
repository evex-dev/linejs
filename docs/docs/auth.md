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
