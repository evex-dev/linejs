# Thrift read/write and rename

## How to use

```ts
import * as thrift from "thrift";
import { readThrift, ThriftRenameParser, writeThrift } from "./mod.ts";

const thriftFile = `
struct test_arg {
    1: testRequest request;
}

struct testRequest {
    1: string testText;
}

struct test_result {
    0: testResponse success;
}

struct testResponse {
    1: string text;
    2: i32 num;
}
`;

const parser = new ThriftRenameParser();

parser.add_def(thriftFile);

const reqdata: Uint8Array = writeThrift(
    [
        [12, 1, [
            [11, 1, "text"],
        ]],
    ],
    "test",
    thrift.TCompactProtocol,
);

const response = await fetch("https://example.com/api/", {
    body: reqdata,
    method: "POST",
});

const resdata = parser.rename_data(
    readThrift(new Uint8Array(await response.arrayBuffer())),
);

console.log(resdata.data);
// { "text" : "~" , "num" : ~ }
```
