# LINEJS

> A powerful and modular JavaScript library for creating LINE SelfBots across
> Node.js, Deno, and Bun. https://linejs.evex.land/

<style>
  .icon-links {
    display: flex;
    justify-content: space-around;
    text-align: center;
    align-items: flex-end;
    align-items: center;
    margin-bottom: 2em;
  }


  .icon-links img {
    display: block;
    margin: 0 auto 5px auto;
  }
</style>

<div class="icon-links">
  <div>
    <a href="https://discord.gg/evex">
      <img src="https://media.discordapp.net/attachments/1275045387794645067/1381957705568092281/discord-icon.png?ex=684967e8&is=68481668&hm=9093bc9c76c0e9d166bda665c6d73575a1ccd11c04c6ef3096f3b24b4deef983&=&format=webp&quality=lossless&width=930&height=930" width="70" height="70" alt="Discord Logo" />
      Discord
    </a>
  </div>
  <div>
    <a href="https://linejs.evex.land">
      <img src="https://raw.githubusercontent.com/evex-dev/linejs/main/.github/assets/icon.png" width="170" height="170" alt="LINEJS Logo" />
    </a>
  </div>
  <div>
    <a href="https://deepwiki.com/evex-dev/linejs">
      <svg class="size-4 transform transition-transform duration-700 group-hover:rotate-180 [&amp;_path]:stroke-0" xmlns="http://www.w3.org/2000/svg" viewBox="110 110 460 500"><path style="fill:#21c19a" class="" d="M418.73,332.37c9.84-5.68,22.07-5.68,31.91,0l25.49,14.71c.82.48,1.69.8,2.58,1.06.19.06.37.11.55.16.87.21,1.76.34,2.65.35.04,0,.08.02.13.02.1,0,.19-.03.29-.04.83-.02,1.64-.13,2.45-.32.14-.03.28-.05.42-.09.87-.24,1.7-.59,2.5-1.03.08-.04.17-.06.25-.1l50.97-29.43c3.65-2.11,5.9-6.01,5.9-10.22v-58.86c0-4.22-2.25-8.11-5.9-10.22l-50.97-29.43c-3.65-2.11-8.15-2.11-11.81,0l-50.97,29.43c-.08.04-.13.11-.2.16-.78.48-1.51,1.02-2.15,1.66-.1.1-.18.21-.28.31-.57.6-1.08,1.26-1.51,1.97-.07.12-.15.22-.22.34-.44.77-.77,1.6-1.03,2.47-.05.19-.1.37-.14.56-.22.89-.37,1.81-.37,2.76v29.43c0,11.36-6.11,21.95-15.95,27.63-9.84,5.68-22.06,5.68-31.91,0l-25.49-14.71c-.82-.48-1.69-.8-2.57-1.06-.19-.06-.37-.11-.56-.16-.88-.21-1.76-.34-2.65-.34-.13,0-.26.02-.4.02-.84.02-1.66.13-2.47.32-.13.03-.27.05-.4.09-.87.24-1.71.6-2.51,1.04-.08.04-.16.06-.24.1l-50.97,29.43c-3.65,2.11-5.9,6.01-5.9,10.22v58.86c0,4.22,2.25,8.11,5.9,10.22l50.97,29.43c.08.04.17.06.24.1.8.44,1.64.79,2.5,1.03.14.04.28.06.42.09.81.19,1.62.3,2.45.32.1,0,.19.04.29.04.04,0,.08-.02.13-.02.89,0,1.77-.13,2.65-.35.19-.04.37-.1.56-.16.88-.26,1.75-.59,2.58-1.06l25.49-14.71c9.84-5.68,22.06-5.68,31.91,0,9.84,5.68,15.95,16.27,15.95,27.63v29.43c0,.95.15,1.87.37,2.76.05.19.09.37.14.56.25.86.59,1.69,1.03,2.47.07.12.15.22.22.34.43.71.94,1.37,1.51,1.97.1.1.18.21.28.31.65.63,1.37,1.18,2.15,1.66.07.04.13.11.2.16l50.97,29.43c1.83,1.05,3.86,1.58,5.9,1.58s4.08-.53,5.9-1.58l50.97-29.43c3.65-2.11,5.9-6.01,5.9-10.22v-58.86c0-4.22-2.25-8.11-5.9-10.22l-50.97-29.43c-.08-.04-.16-.06-.24-.1-.8-.44-1.64-.8-2.51-1.04-.13-.04-.26-.05-.39-.09-.82-.2-1.65-.31-2.49-.33-.13,0-.25-.02-.38-.02-.89,0-1.78.13-2.66.35-.18.04-.36.1-.54.15-.88.26-1.75.59-2.58,1.07l-25.49,14.72c-9.84,5.68-22.07,5.68-31.9,0-9.84-5.68-15.95-16.27-15.95-27.63s6.11-21.95,15.95-27.63Z"></path><path style="fill:#3969ca" d="M141.09,317.65l50.97,29.43c1.83,1.05,3.86,1.58,5.9,1.58s4.08-.53,5.9-1.58l50.97-29.43c.08-.04.13-.11.2-.16.78-.48,1.51-1.02,2.15-1.66.1-.1.18-.21.28-.31.57-.6,1.08-1.26,1.51-1.97.07-.12.15-.22.22-.34.44-.77.77-1.6,1.03-2.47.05-.19.1-.37.14-.56.22-.89.37-1.81.37-2.76v-29.43c0-11.36,6.11-21.95,15.96-27.63s22.06-5.68,31.91,0l25.49,14.71c.82.48,1.69.8,2.57,1.06.19.06.37.11.56.16.87.21,1.76.34,2.64.35.04,0,.09.02.13.02.1,0,.19-.04.29-.04.83-.02,1.65-.13,2.45-.32.14-.03.28-.05.41-.09.87-.24,1.71-.6,2.51-1.04.08-.04.16-.06.24-.1l50.97-29.43c3.65-2.11,5.9-6.01,5.9-10.22v-58.86c0-4.22-2.25-8.11-5.9-10.22l-50.97-29.43c-3.65-2.11-8.15-2.11-11.81,0l-50.97,29.43c-.08.04-.13.11-.2.16-.78.48-1.51,1.02-2.15,1.66-.1.1-.18.21-.28.31-.57.6-1.08,1.26-1.51,1.97-.07.12-.15.22-.22.34-.44.77-.77,1.6-1.03,2.47-.05.19-.1.37-.14.56-.22.89-.37,1.81-.37,2.76v29.43c0,11.36-6.11,21.95-15.95,27.63-9.84,5.68-22.07,5.68-31.91,0l-25.49-14.71c-.82-.48-1.69-.8-2.58-1.06-.19-.06-.37-.11-.55-.16-.88-.21-1.76-.34-2.65-.35-.13,0-.26.02-.4.02-.83.02-1.66.13-2.47.32-.13.03-.27.05-.4.09-.87.24-1.71.6-2.51,1.04-.08.04-.16.06-.24.1l-50.97,29.43c-3.65,2.11-5.9,6.01-5.9,10.22v58.86c0,4.22,2.25,8.11,5.9,10.22Z"></path><path style="fill:#0294de" class="" d="M396.88,484.35l-50.97-29.43c-.08-.04-.17-.06-.24-.1-.8-.44-1.64-.79-2.51-1.03-.14-.04-.27-.06-.41-.09-.81-.19-1.64-.3-2.47-.32-.13,0-.26-.02-.39-.02-.89,0-1.78.13-2.66.35-.18.04-.36.1-.54.15-.88.26-1.76.59-2.58,1.07l-25.49,14.72c-9.84,5.68-22.06,5.68-31.9,0-9.84-5.68-15.96-16.27-15.96-27.63v-29.43c0-.95-.15-1.87-.37-2.76-.05-.19-.09-.37-.14-.56-.25-.86-.59-1.69-1.03-2.47-.07-.12-.15-.22-.22-.34-.43-.71-.94-1.37-1.51-1.97-.1-.1-.18-.21-.28-.31-.65-.63-1.37-1.18-2.15-1.66-.07-.04-.13-.11-.2-.16l-50.97-29.43c-3.65-2.11-8.15-2.11-11.81,0l-50.97,29.43c-3.65,2.11-5.9,6.01-5.9,10.22v58.86c0,4.22,2.25,8.11,5.9,10.22l50.97,29.43c.08.04.17.06.25.1.8.44,1.63.79,2.5,1.03.14.04.29.06.43.09.8.19,1.61.3,2.43.32.1,0,.2.04.3.04.04,0,.09-.02.13-.02.88,0,1.77-.13,2.64-.34.19-.04.37-.1.56-.16.88-.26,1.75-.59,2.57-1.06l25.49-14.71c9.84-5.68,22.06-5.68,31.91,0,9.84,5.68,15.95,16.27,15.95,27.63v29.43c0,.95.15,1.87.37,2.76.05.19.09.37.14.56.25.86.59,1.69,1.03,2.47.07.12.15.22.22.34.43.71.94,1.37,1.51,1.97.1.1.18.21.28.31.65.63,1.37,1.18,2.15,1.66.07.04.13.11.2.16l50.97,29.43c1.83,1.05,3.86,1.58,5.9,1.58s4.08-.53,5.9-1.58l50.97-29.43c3.65-2.11,5.9-6.01,5.9-10.22v-58.86c0-4.22-2.25-8.11-5.9-10.22Z"></path></svg>
      DeepWiki
    </a>
  </div>
</div>

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

See the [browser example](./example/browser) for more details.

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
