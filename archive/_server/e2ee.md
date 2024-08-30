```ts
import { E2EE } from "./linejs/archive/_server/E2EETest.js";

const client = new E2EE({});

client.registerCert("cert")

client.on("pincall", (pincode) => {
    console.log(`pincode: ${pincode}`);
});

client.on("update:cert", d => console.log("cert", d))
client.on("update:authtoken", d => console.log("AuthToken:", d))

client.on("log", d => {
    console.log(d);
})

client.on("ready", (user) => {
    console.log(`Logged in as ${user.displayName} (${user.mid})`);
});

await client.login({
    device: "IOSIPAD",
    authToken: "auth",
});

client.saveE2EESelfKeyDataByKeyId("{keyId}",{"keyId": "", "privKey": "++fVY=", "pubKey": "~=", "e2eeVersion": "1"})
client.saveStorageData("e2eeGroupKeys:{c}",'{"privKey": "+di7+=", "keyId": 000}')
const e = await client.sync({revision:N})
console.log(e.operationResponse.operations[0].message)
console.log("decrypt e2ee txt")
console.log(await client.decryptE2EETextMessage(e.operationResponse.operations[0].message))
```