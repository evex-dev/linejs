import { base, LINEStruct } from "./legyfetch.js";

// patch
base.talk.sync = async function (options = {}) {
  const { limit, revision, individualRev, globalRev, timeout } = {
    limit: 100, revision: 0, globalRev: 0, individualRev: 0,
    timeout: base.config.longTimeout,
    ...options,
  };
  return await base.request.request(
    LINEStruct.sync_args({
      request: {
        lastRevision: revision,
        lastGlobalRevision: globalRev,
        lastIndividualRevision: individualRev,
        count: limit,
      },
    }),
    "sync", 3, true, "/SYNC3", {}, timeout,
  );
};

const profile = await base.talk.getProfile();
console.log(`Logged in: ${profile.displayName} (${profile.mid})`);
const polling = base.createPolling();
for await (const op of polling._listenTalkEvents({ pollingInterval: 1000 })) {
  if (op.type === "RECEIVE_MESSAGE" || op.type === "SEND_MESSAGE") {
    const message = op.message;
    let text = message?.text;
    if (message?.chunks) {
      try {
        const decrypted = await base.e2ee.decryptE2EEMessage(message);
        text = decrypted.text;
      } catch (e) {
      }
    }
    if (text === "!ping") {
      const replyTo = message.to === profile.mid ? message.from : message.to;
      await base.talk.sendMessage({
        to: replyTo,
        text: "pong!",
        e2ee: !!message.chunks,
      });
    }
  }
}
