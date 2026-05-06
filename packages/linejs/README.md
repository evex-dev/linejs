# LINEJS

[![JSR](https://jsr.io/badges/@evex/linejs?from=github)](https://jsr.io/@evex/linejs)
[![JSR Score](https://jsr.io/badges/@evex/linejs/score?from=github)](https://jsr.io/@evex/linejs)
[![JSR Scope](https://jsr.io/badges/@evex?from=github)](https://jsr.io/@evex)
![release workflow](https://github.com/evex-dev/linejs/actions/workflows/release.yml/badge.svg)\
[![](https://dcbadge.limes.pink/api/server/evex)](https://discord.gg/evex)
[![技術者倫理 遵守済み](https://img.shields.io/badge/%E6%8A%80%E8%A1%93%E8%80%85%E5%80%AB%E7%90%86-%E9%81%B5%E5%AE%88%E6%B8%88%E3%81%BF-0a0a0a?style=for-the-badge&labelColor=ffffff)](https://技術者倫理.com)

<center>
  <img src="https://raw.githubusercontent.com/evex-dev/linejs/main/.github/assets/icon.png" width="150" height="150" alt="LINEJS" />
</center>

<center> <b>LINEJS</b> is a JavaScript library for creating a LINE SelfBot. </center>

---

##### <center>❓ Question: Join our [Discord community](https://discord.gg/evex)</center>

##### <center>📚 Documentation: [Check out the full documentation](https://linejs.evex.land)</center>

##### <center>🤖 AI Generated Documentation: [DeepWiki - LINEJS](https://deepwiki.com/evex-dev/linejs)

---

## Installation

Supports all runtimes (Node.js, Deno, and Bun) and Typescript.

```llvm
npx jsr add @evex/linejs
bunx --bun jsr add @evex/linejs
deno add @evex/linejs
```

You can use `git clone` to download the latest development version and use it in
Deno.

```llvm
git clone https://github.com/evex-dev/linejs.git
cd linejs
touch main.js
deno run main.js
```

##### Documentation is [https://linejs.evex.land](https://linejs.evex.land/)

## Browser Support

For now, please use "https://esm.sh/jsr/@evex/linejs".

Example is [here](./example/browser).

## LINEJS Types

Please see [@evex/linejs-types](https://jsr.io/@evex/linejs-types).\
In short, TypeScript types and enums (such as ReactionType (0, 1, 2, 3),
MessageType, etc.) are provided.

## Provided Packages

- client - (@evex/linejs) or (@evex/linejs/client)
  - Client - LINE SelfBot Client
- base - (@evex/linejs/base)
  - BaseClient - LINE SelfBot API Client
- thrift - (@evex/linejs/thrift)
  - Thrift - Thrift read/write
- storage - (@evex/linejs/storage)
  - BaseStorage - LINE Client Storage Type
  - MemoryStorage - LINE Client Memory Storage
  - FileStorage - LINE Client File Storage
- types - (@evex/linejs-types)
  - All Types for LINE

## Authors

- Owner & Developer: [Piloking](https://github.com/piloking)
- Developer: [EdamAme-x](https://github.com/EdamAme-x)
- Developer: [MocA-Love](https://github.com/MocA-Love)
- Developer: [Hafusun](https://github.com/hafusun)

## References

- [DeachSword/CHRLINE](https://github.com/DeachSword/CHRLINE)

- [DeachSword/CHRLINE-Thrift](https://github.com/DeachSword/CHRLINE-Thrift/)

- [WEDeach/CHRLINE-Patch](https://github.com/WEDeach/CHRLINE-Patch)

- [discordjs/collection](https://www.npmjs.com/package/@discordjs/collection)
