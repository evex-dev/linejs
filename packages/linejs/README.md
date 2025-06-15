# LINEJS

> A powerful and modular JavaScript library for creating LINE SelfBots across
> Node.js, Deno, and Bun. https://linejs.evex.land/

<table align="center">
  <tr>
    <td align="center">
      <a href="https://discord.gg/evex">
        <img src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/66e3d80db9971f10a9757c99_Symbol.svg" width="128" height="128" alt="Discord Logo" /><br />
        Discord
      </a>
    </td>
    <td align="center">
      <a href="https://linejs.evex.land">
        <img src="https://raw.githubusercontent.com/evex-dev/linejs/main/.github/assets/icon.png" width="128" height="128" alt="LINEJS Logo" />
      </a>
    </td>
    <td align="center">
      <a href="https://deepwiki.com/evex-dev/linejs">
        <img src="https://devin.ai/icon.png" width="128" height="128" alt="DeepWiki Logo" /><br />
        DeepWiki
      </a>
    </td>
  </tr>
</table>

<p align="center">
  <a href="https://jsr.io/@evex/linejs">
    <img src="https://jsr.io/badges/@evex/linejs" alt="JSR">
  </a>
  <a href="https://jsr.io/@evex/linejs/score">
    <img src="https://jsr.io/badges/@evex/linejs/score" alt="JSR Score">
  </a>
  <a href="https://jsr.io/@evex">
    <img src="https://jsr.io/badges/@evex" alt="JSR Scope">
  </a>
  <img src="https://github.com/evex-dev/linejs/actions/workflows/release.yml/badge.svg" alt="Release Status">
  <a href="https://discord.gg/evex">
    <img src="https://dcbadge.limes.pink/api/server/evex" alt="Discord">
  </a>
</p>

---

## ℹ️ Information

- ❓ Question: Join our [Discord community](https://discord.gg/evex)
- 📚 Documentation: [Check out the full documentation](https://linejs.evex.land)
- 🤖 AI Generated Documentation:
  [DeepWiki - LINEJS](https://deepwiki.com/evex-dev/linejs)

## ✨ Features

- 🔁 LINE SelfBot functionality
- 🔌 Cross-runtime support: Node.js, Deno, Bun
- 💡 TypeScript-first with official typings
- 🧩 Modular packages for full control

---

## 📦 Installation

Supports **Node.js**, **Deno**, **Bun**, and **TypeScript** out of the box.

```sh
# Node.js
npx jsr add @evex/linejs

# Bun
bunx --bun jsr add @evex/linejs

# Deno
deno add @evex/linejs
```

Want to test the development version?

```sh
git clone https://github.com/evex-dev/linejs.git
cd linejs
touch main.js
deno run main.js
```

📚 Full documentation: [https://linejs.evex.land](https://linejs.evex.land)

---

## 🌐 Browser Support

Use the following import for browser environments:

```ts
import { Client } from "https://esm.sh/jsr/@evex/linejs";
```

See the [browser example](../../example/browser/) for more details.

---

## 📘 Types

TypeScript types and enums like `ReactionType`, `MessageType`, etc., are
available in:

🔗 [`@evex/linejs-types`](https://jsr.io/@evex/linejs-types)

---

## 🧩 Provided Packages

| Package                | Description                           |
| ---------------------- | ------------------------------------- |
| `@evex/linejs`         | LINE SelfBot Client                   |
| `@evex/linejs/base`    | Base LINE API Client                  |
| `@evex/linejs/thrift`  | Thrift serializer/deserializer        |
| `@evex/linejs/storage` | Memory & File-based storage for LINE  |
| `@evex/linejs-types`   | Complete TypeScript typings and enums |

---

## 🧠 Learn More

- 🤖 AI Documentation: [DeepWiki - LINEJS](https://deepwiki.com/evex-dev/linejs)
- ❓ Questions? [Join our Discord](https://discord.gg/evex)

---

## 👨‍💻 Authors

- **Owner & Lead Dev**: [Piloking](https://github.com/piloking)
- **Core Developers**:
  - [EdamAme-x](https://github.com/EdamAme-x)
  - [MocA-Love](https://github.com/MocA-Love)
  - [Hafusun](https://github.com/hafusun)

---

## 📚 References & Inspirations

- [DeachSword/CHRLINE](https://github.com/DeachSword/CHRLINE)
- [CHRLINE-Thrift](https://github.com/DeachSword/CHRLINE-Thrift/)
- [CHRLINE-Patch](https://github.com/WEDeach/CHRLINE-Patch)
- [@discordjs/collection](https://www.npmjs.com/package/@discordjs/collection)

---

> Built with ❤️ by the Evex team
