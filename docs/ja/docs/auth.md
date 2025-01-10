# 認証

いくつかの方法で認証を受けることができます。

## Login

LINEJSには2つのログイン方法があります。

### `loginWithPassword`

例:
```ts
import { loginWithPassword } from "@evex/linejs";

const client = loginWithPassword({
  email: 'you@example.com', // メアド
  password: 'password', // パスワード
  onPincodeRequest(pincode) {
    console.log('Enter this pincode to your LINE app:', pincode)
  }
})
```

メアドとパスワードが必要です。初回ログイン時、スマホ版のLINEでPinを入力し、e2eeを有効にする必要があります。
`onPincodeRequest`はPinを受け取ることができます。

### `loginWithQR`

この方法では、メアドとパスワードは不要です。

```ts
import { loginWithQR } from '@evex/linejs'

const client = loginWithQR({
  onReceiveQRURL(url) {
    console.log('Access to this URL:', url)
  }
})
```

この関数はスマホ版LINEで読み込む為のURLを表示します。QRコードを表示したい場合は、自分でQRコードを作成する必要があります。これはLINEJSがQRコードの作成をサポートしていないためです。

## With authToken

短時間に何度もログインを試みるとアカウントがBANされる可能性があるため、認証にはauthTokenを使用することをおすすめします。

