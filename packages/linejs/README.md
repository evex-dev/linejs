# LINEJS

> A powerful and modular JavaScript library for creating LINE SelfBots across Node.js, Deno, and Bun.

<p align="center">
  <img src="https://raw.githubusercontent.com/evex-dev/linejs/main/.github/assets/icon.png" width="150" height="150" alt="LINEJS Logo" />
</p>

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

See the [browser example](./example/browser) for more details.

---

## 📘 Types

TypeScript types and enums like `ReactionType`, `MessageType`, etc., are available in:

🔗 [`@evex/linejs-types`](https://jsr.io/@evex/linejs-types)

---

## 🧩 Provided Packages

| Package                     | Description                                |
|----------------------------|--------------------------------------------|
| `@evex/linejs`             | LINE SelfBot Client                        |
| `@evex/linejs/base`        | Base LINE API Client                       |
| `@evex/linejs/thrift`      | Thrift serializer/deserializer             |
| `@evex/linejs/storage`     | Memory & File-based storage for LINE       |
| `@evex/linejs-types`       | Complete TypeScript typings and enums      |

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
