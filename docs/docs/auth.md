# Authentication

You can get authenticated with multiple ways.

## Login

Login is a simple way to get authenticated. LINEJS has 2 ways to login.

### `loginWithPassword`

Here is an example:
```ts
import { loginWithPassword } from "@evex/linejs";

const client = loginWithPassword({
  email: 'you@example.com', // e-mail address
  password: 'password', // Password
  onPincodeRequest(pincode) {
    console.log('Enter this pincode to your LINE app:', pincode)
  }
})
```

email, password is required. On first login, you have to enter pincode on mobile app for enable e2ee.
`onPincodeRequest` can receive a pincode and you can output it with that method to tell users pincode.

### `loginWithQR`

In this way, email and password is not needed.

```ts
import { loginWithQR } from '@evex/linejs'

const client = loginWithQR({
  onReceiveQRURL(url) {
    console.log('Access to this URL:', url)
  }
})
```

The function gives an url to read on mobile. You have to create QR with yourself if you want to show QR code, this is because of LINEJS doesn't support creating QR code.

