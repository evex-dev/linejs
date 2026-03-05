import { BaseClient } from "@evex/linejs/base";
import { LINEStruct } from "@evex/linejs/thrift";
import crypto from "node:crypto";
import https from "node:https";
import xxhashInit from "xxhash-wasm";

const APP_VER = "26.2.0";
const SYSTEM_NAME = "Android OS";
const SYSTEM_VER = "15";
const X_LINE_APP = `ANDROID\t${APP_VER}\t${SYSTEM_NAME}\t${SYSTEM_VER}`;
const USER_AGENT = `Line/${APP_VER}`;

// authKeyでもPrimaryTokenでも大丈夫
const AUTH_KEY = "u***************:++++++++++++++++++";

function createToken(authKey) {
  const [mid, ...rest] = authKey.split(":");
  const key = Buffer.from(rest.join(":"), "base64");
  const iat =
    Buffer.from(`iat: ${Math.floor(Date.now() / 1000) * 60}\n`, "utf-8").toString("base64") + ".";
  const digest = crypto.createHmac("sha1", key).update(iat).digest("base64");
  return `${mid}:${iat}.${digest}`;
}

function isAlreadyToken(value) {
  const idx = value.indexOf(":");
  if (idx === -1) return false;
  const payload = value.substring(idx + 1);
  try {
    const decoded = Buffer.from(payload.split(".")[0], "base64").toString("utf-8");
    return decoded.startsWith("iat:");
  } catch {
    return false;
  }
}

function resolveToken(value) {
  if (isAlreadyToken(value)) {
    console.log("PrimaryToken");
    return value;
  }
  console.log("authKey to PrimaryToken");
  return createToken(value);
}

// legy enc
const LINE_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsMC6HAYeMq4R59e2yRw6
W1OWT2t9aepiAp4fbSCXzRj7A29BOAFAvKlzAub4oxN13Nt8dbcB+ICAufyDnN5N
d3+vXgDxEXZ/sx2/wuFbC3B3evSNKR4hKcs80suRs8aL6EeWi+bAU2oYIc78Bbqh
Nzx0WCzZSJbMBFw1VlsU/HQ/XdiUufopl5QSa0S246XXmwJmmXRO0v7bNvrxaNV0
cbviGkOvTlBt1+RerIFHMTw3SwLDnCOolTz3CuE5V2OrPZCmC0nlmPRzwUfxoxxs
/6qFdpZNoORH/s5mQenSyqPkmH8TBOlHJWPH3eN1k6aZIlK5S54mcUb/oNRRq9wD
1wIDAQAB
-----END PUBLIC KEY-----`;

const LEGY_IV = Buffer.from([78, 9, 72, 62, 56, 245, 255, 114, 128, 18, 123, 158, 251, 92, 45, 51]);
const LEGY_LE = "7";
const LEGY_LCS_PREFIX = "0008";
const LEGY_GF_URL = "https://gf.line.naver.jp/enc";
const leGyAesKey = crypto.randomBytes(16);
const xLcs = LEGY_LCS_PREFIX + crypto.publicEncrypt(
  { key: LINE_PUBLIC_KEY, padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha1" },
  leGyAesKey,
).toString("base64");
let xxh = null;

// Serialize
function encHeaders(headers) {
  const keys = Object.keys(headers);
  const parts = [];
  parts.push(Buffer.from([(keys.length >> 8) & 0xff, keys.length & 0xff]));
  for (const k of keys) {
    const kBuf = Buffer.from(k, "ascii");
    const vBuf = Buffer.from(headers[k], "ascii");
    parts.push(Buffer.from([(kBuf.length >> 8) & 0xff, kBuf.length & 0xff]));
    parts.push(kBuf);
    parts.push(Buffer.from([(vBuf.length >> 8) & 0xff, vBuf.length & 0xff]));
    parts.push(vBuf);
  }
  const body = Buffer.concat(parts);
  return Buffer.concat([Buffer.from([(body.length >> 8) & 0xff, body.length & 0xff]), body]);
}

// parse
function decHeaders(data) {
  let off = 0;
  const ri16 = () => { const v = (data[off] << 8) | data[off + 1]; off += 2; return v; };
  const dataLen = ri16() + 2;
  const count = ri16();
  const headers = {};
  for (let i = 0; i < count; i++) {
    const kl = ri16(); const k = data.subarray(off, off + kl).toString("ascii"); off += kl;
    const vl = ri16(); const v = data.subarray(off, off + vl).toString("ascii"); off += vl;
    headers[k] = v;
  }
  return { headers, data: data.subarray(dataLen) };
}

function pkcs7Unpad(buf) {
  const n = buf[buf.length - 1];
  return (n > 0 && n <= 16) ? buf.subarray(0, buf.length - n) : buf;
}

function pkcs7Pad(buf, bs) {
  const n = bs - (buf.length % bs);
  return Buffer.concat([buf, Buffer.alloc(n, n)]);
}

// AES-128-CBC enc
function leGyEncrypt(pt) {
  const c = crypto.createCipheriv("aes-128-cbc", leGyAesKey, LEGY_IV);
  c.setAutoPadding(true);
  return Buffer.concat([c.update(pt), c.final()]);
}

// AES-128-CBC dec
function leGyDecrypt(ct) {
  const padded = pkcs7Pad(ct, 16);
  const d = crypto.createDecipheriv("aes-128-cbc", leGyAesKey, LEGY_IV);
  d.setAutoPadding(false);
  const dec = Buffer.concat([d.update(padded), d.final()]);
  return pkcs7Unpad(dec.subarray(0, dec.length - 16));
}

// xxHash32 HMAC
function leGyHmac(key, data, h) {
  const opad = Buffer.alloc(16);
  const ipad = Buffer.alloc(16);
  for (let i = 0; i < 16; i++) {
    opad[i] = 0x5c ^ key[i];
    ipad[i] = 0x36 ^ key[i];
  }
  const innerHex = (h.h32Raw(Buffer.concat([ipad, data]), 0) >>> 0).toString(16).padStart(8, "0");
  const outerHex = (h.h32Raw(Buffer.concat([opad, Buffer.from(innerHex, "hex")]), 0) >>> 0).toString(16).padStart(8, "0");
  return Buffer.from(outerHex, "hex");
}

async function leGyFetch(request) {
  if (!xxh) xxh = await xxhashInit();
  const url = new URL(request.url);
  const path = url.pathname;
  const thriftBody = Buffer.from(await request.arrayBuffer());
  const token = request.headers.get("x-line-access");
  // legy header
  const inner = token
    ? { "x-lt": token, "x-lpqs": path }
    : { "x-lpqs": path };
  const plaintext = Buffer.concat([encHeaders(inner), thriftBody]);
  const leInt = parseInt(LEGY_LE, 10);
  const fixBytes = (leInt & 4) === 4;
  let toEncrypt = fixBytes
    ? Buffer.concat([Buffer.from([leInt]), plaintext])
    : plaintext;
  let enc = leGyEncrypt(toEncrypt);
  if ((leInt & 2) === 2) {
    enc = Buffer.concat([enc, leGyHmac(leGyAesKey, enc, xxh)]);
  }
  // gf.line.naver.jp/enc
  const { statusCode, responseBody, responseHeaders } = await new Promise((resolve, reject) => {
    const gfUrl = new URL(LEGY_GF_URL);
    const req = https.request({
      hostname: gfUrl.hostname,
      port: 443,
      path: gfUrl.pathname,
      method: "POST",
      headers: {
        "x-line-application": X_LINE_APP,
        "x-le": LEGY_LE,
        "x-lap": "5",
        "x-lpv": "1",
        "x-lcs": xLcs,
        "User-Agent": USER_AGENT,
        "content-type": "application/x-thrift; protocol=TBINARY",
        "x-lal": "ja_JP",
        "x-lhm": "POST",
        "accept": "*/*",
        "accept-encoding": "gzip, deflate",
        "connection": "keep-alive",
        "Content-Length": enc.length,
      },
    }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve({
        statusCode: res.statusCode,
        responseBody: Buffer.concat(chunks),
        responseHeaders: res.headers,
      }));
    });
    req.on("error", reject);
    req.write(enc);
    req.end();
  });
  if (!responseBody.length) {
    return new Response(responseBody, { status: statusCode });
  }
  // legy dec
  let dec = leGyDecrypt(responseBody);
  if (fixBytes) dec = dec.subarray(1);
  const { headers: innerH, data: thriftData } = decHeaders(dec);
  const innerStatus = innerH["x-lc"];
  const httpStatus = (innerStatus && innerStatus !== "200") ? parseInt(innerStatus, 10) : statusCode;
  return new Response(thriftData, {
    status: httpStatus,
    headers: { "content-type": "application/x-thrift" },
  });
}

// linejs BaseClient
const base = new BaseClient({ device: "ANDROID", version: APP_VER, fetch: leGyFetch });
base.authToken = resolveToken(AUTH_KEY);
base.request.systemType = X_LINE_APP;
base.request.userAgent = USER_AGENT;
base.talk.requestPath = "/S3";
base.talk.protocolType = 3;

export { base, LINEStruct };
