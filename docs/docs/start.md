# Getting Started

<b>LINEJS</b> is always by your side.

<b>Thank you for choosing this library!</b>

## Installation

LINEJS is published on both npm (`@evex-dev/linejs`) and JSR (`@evex/linejs`).

```bash
npm install @evex-dev/linejs
pnpm add @evex-dev/linejs
yarn add @evex-dev/linejs
bun add @evex-dev/linejs
```

If you prefer JSR (for example on Deno), install the JSR package instead:

```bash
npx jsr add @evex/linejs
deno add jsr:@evex/linejs
```

After execution, you should have the library available.

## Usage

Next, let's create a script that just retrieves your profile!

To making client, you can use `loginWithPassword`.
```ts
import { loginWithPassword } from "@evex-dev/linejs";

const client = await loginWithPassword({
    email: 'you@example.com', // e-mail address
    password: 'password', // Password
    onPincodeRequest(pincode) {
        console.log('Enter this pincode to your LINE app:', pincode)
    }
}, { device: "IOSIPAD" })
```

Authentication is complicated process, so you should read [here](./auth.md).

After created client, you can do various things!

For instance, you can get one of chat informations you joined:
```ts
const chats = await client.fetchJoinedChats()
console.log(chats[0].name)
```

---

This library is still in its infancy!\
If you find <i>any bugs</i> or <i>missing parts</i>, please let us know on our
server! (Roles will be given to those who suggest bugs and features!)
