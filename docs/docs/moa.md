# Album (Moa)

`MoaService` exposes the LINE Album (Moa) REST API on `client.base.moa`. Unlike
Talk / Square, Moa speaks plain HTTP JSON on top of the LEGY proxy, so this
service uses `client.fetch` directly with a channel token issued for the album
channel (`1375220249`).

## Listing albums

```ts
import { loginWithAuthToken } from "@evex/linejs";

const client = await loginWithAuthToken("YOUR_AUTH_TOKEN", {
  device: "IOSIPAD",
});

let cursor = "";
while (true) {
  const resp = await client.base.moa.getAlbums({ cursor });
  const result = resp.result;
  for (const album of result?.albums ?? []) {
    console.log(`[${album.albumId}] ${album.title} (${album.photoCount} photos)`);
  }
  cursor = result?.nextCursor ?? result?.cursor ?? "";
  if (!cursor || !(result?.hasMore ?? true)) break;
}
```

## Listing photos in an album

```ts
let cursor = "";
while (true) {
  const resp = await client.base.moa.getPhotos({
    chatId: "cxxxxxxxxxxxxxxx",
    albumId: "1234567890123456789",
    cursor,
    pageSize: 100,
  });
  for (const photo of resp.result?.photos ?? []) {
    console.log(photo.oid, "shot at", photo.shotTime);
  }
  cursor = resp.result?.nextCursor ?? "";
  if (!cursor) break;
}
```

## Downloading the original bytes of a photo

`downloadPhoto` returns a `Uint8Array` so the caller can save it or process it
further.

```ts
import { writeFileSync } from "node:fs";

const bytes = await client.base.moa.downloadPhoto({
  chatId: "cxxxxxxxxxxxxxxx",
  albumId: "1234567890123456789",
  oid: "someOid",
});
writeFileSync("./out.jpg", bytes);
```

For videos, pass `prefix: "album/v"` (the `sid` field on `obsResourceId` tells
you whether the item is an image or a video):

```ts
const isVideo = photo.obsResourceId?.sid === "v";
const bytes = await client.base.moa.downloadPhoto({
  chatId,
  albumId,
  oid: photo.obsResourceId!.oid!,
  prefix: isVideo ? "album/v" : "album/a",
});
```

## Notes

- The channel token issued for `1375220249` is memoised inside the service and
  reused for every subsequent call. If the token is rejected (server-side
  expiry, revocation, ...) create a fresh `BaseClient` to reset the cache.
- Moa uses `X-Line-ChannelToken`, `X-Line-Mid` (your MID) and — for photo
  fetches — `X-Line-Album` (the album id) and `X-Line-Mid` set to the *chat*
  id. All of these are set for you automatically.
- The header override `accept: application/json` is important: the default
  `client.base.request.getHeader("GET")` returns `application/x-thrift`, which
  LEGY rejects for REST endpoints with
  `{"code":102001,"message":"一時的なエラーが発生しました。"}`.
