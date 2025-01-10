# Clientオプション

次に、クライアントについて説明します。\
クライアントにはいくつかのオプションがあります。

```ts
const client = new Client({
    device: "...",
    ...
});
```

例えば、前述のデータの**storage for the data**、**OBS Endpoint**、通信のための**Endpoint**、CORSやプロキシのための**customFetch**、レート制限のための**RateLimitter**などがあります。

これらを一つずつ説明します。

## Storage

これは復号キーやキャッシュなどの内部のニーズのためのストレージです。\
デフォルトでは`MemoryStorage`が使用され、プログラム停止時は最初からログインする必要があります。

ここで`FileStorage`を使用することができます。

```ts
import { FileStorage } from "@evex/linejs/storage";

const client = new Client({
    device: "IOSIPAD",
    storage: new FileStorage("./storage.json"), // ストレージファイルへのパス（秘密ファイル）
});
```

クラウドやデータストレージAPIを使用してストレージに保存したい場合は、`BaseStorage`を拡張して自分の好みに作成できます。\
サーバーについての詳細をお伝えしたいと思います。

## Endpoint

通信のエンドポイントです。\
このポイントを変更する必要はありません。\
プロキシサーバーを試したい場合は、使用してください。

```ts
const client = new Client({
    endpoint: "legy-jp.line-apps.com",
});
```

## Custom Fetch

これはCORS回避やプロキシのためのものです。fetchを置き換える関数を定義します。

```ts
...

const client = new Client({
    fetch: async (url, options) => {
        return await fetch(url, {
            ...options,
            ...proxyAgent
        });
    }
});
```

これでオプションの説明は終了です！\
次のセクションでは、さまざまなメソッドを紹介します。
