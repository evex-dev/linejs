# メッセージイベントの受信

次のステップは、ついにメッセージを受信することです。\
ますますボットらしくなってきましたね！

:::warning
ただし、グループのメッセージを受信するには、`FileStorage`などにある復号キーが必要です。
詳細は[スタート2](/docs/start-2)を参照してください。
:::

まず、「!ping」を受信して「pong!」と返すだけのボットを作成しましょう。

## Chat

メッセージを受信するには、次のようにします。

```ts
client.on("message", (message) => {
    ...
});

await client.login({...})
client.polling(["square","talk"])
```

これだけでメッセージを受信できます。簡単でしょ?

ではまず、送信されたメッセージを取得してみましょう。

```ts
client.on("message", (message) => {
    const text = message.text;

    console.log(text);
});
```

コンソールに送信されたメッセージが表示されるはずです！

```console
Hello MaguRo
I love you! :D
```

次に、メッセージが「!ping」かどうかを確認しましょう。

```ts
client.on("message", (message) => {
    const text = message.text;

    if (text === "!ping") {
        ...     
    }
});
```

完璧です。次はリプライをさせてみましょう。

リプライをするには、`messageId`と`relatedMessageId`を使用することもできますが、もっと便利な方法があります。

```ts
client.on("message", (message) => {
    const text = message.text;

    if (text === "!ping") {
        message.reply("pong!");
    }
});
```

なんて美しいコードでしょう！とても簡単です。しかし、非同期関数で囲む方がもっと美しいです。

```ts
client.on("message", async (message) => {
    const text = message.text;

    if (text === "!ping") {
        await message.reply("pong!");
    }
});
```

これで完了です！\
他にも`send`や`reaction`などのメソッドがあります。\
他の章でこれらのメソッドについて説明します。

## Square

では、Square（オープンチャット）ではどうすればいいでしょうか？基本的には同じことです。

```ts
client.on("square:message", async (message) => {
    const text = message.text;

    if (text === "!ping") {
        await message.reply("pong!");
    }
});
```

これだけで基本的なBOTを作成できます。\
他にもたくさんの機能があります！

次の体験をお楽しみに。

:::tip
問題が発生した場合は、[質問](/docs/question)も参照してください。
:::
