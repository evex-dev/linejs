import { BaseClient } from "@evex/linejs/base";
import { FileStorage } from "@evex/linejs/storage";
import fs from "fs";
import path from "path";

export async function initializeClient(): Promise<{ client: any }> {
    const storage = new FileStorage("./storage.json");
    const client = new BaseClient({
	    device: "DESKTOPWIN",
    	storage,
    });
    client.on("pincall", (pin) => {
	    console.log("pincode:", pin);
    });
    client.on("qrcall", (qrUrl) => {
	    console.log("qrcode:", qrUrl);
    });
    client.on("update:authtoken", async (authToken) => {
	    await storage.set(".auth", authToken);
    });
    const authToken = await storage.get(".auth");
    if (typeof authToken === "string") {
	    await client.loginProcess.login({
		    authToken,
    	});
    } else {
	    await client.loginProcess.login({
		    email: prompt("email: ") ?? "",
    		password: prompt("password: ") ?? "",
	    });
    }
    return { client };
}

export async function startPollingSquareChatEvents(client: any): Promise<void> {
    function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
        return Promise.race([
            promise,
            new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
        ]) as Promise<T>;
    }

    async function retryApiCall<T>(fn: () => Promise<T>, retries = 4, delay = 3000): Promise<T> {
        for (let i = 0; i < retries; i++) {
            try {
                return await fn();
            } catch (err) {
                if (i === retries - 1) throw err;
                await new Promise(res => setTimeout(res, delay));
            }
        }
        throw new Error('retryApiCall: exhausted retries');
    }

    let joinedSquareChatMids: string[] = [];
    const chatSyncTokens = new Map<string, string | null>();
    const chatSeenEvents = new Map<string, Set<string>>();
    const syncJsonPath = path.resolve(__dirname, '../sync.json');

    function loadSyncTokens() {
        try {
            if (fs.existsSync(syncJsonPath)) {
                const raw = fs.readFileSync(syncJsonPath, 'utf8');
                const obj = JSON.parse(raw);
                if (obj && typeof obj === 'object') {
                    for (const [mid, token] of Object.entries(obj)) {
                        if (typeof token === 'string' && token.length > 0) {
                            chatSyncTokens.set(mid, token);
                        }
                    }
                }
            }
        } catch (err) {
            console.log(`loadSyncTokens error: ${typeof err === "object" && err && "message" in err ? (err as any).message : String(err)}`);
        }
    }

    function saveSyncTokens() {
        try {
            const obj: Record<string, string> = {};
            for (const [mid, token] of chatSyncTokens.entries()) {
                if (token) obj[mid] = token;
            }
            fs.writeFileSync(syncJsonPath, JSON.stringify(obj, null, 2), 'utf8');
        } catch (err) {
            console.log(`saveSyncTokens error: ${typeof err === "object" && err && "message" in err ? (err as any).message : String(err)}`);
        }
    }

    loadSyncTokens();

    async function updateJoinedSquareChats(): Promise<void> {
        try {
            const myEventResult: any = await retryApiCall(() => withTimeout(client.square.fetchMyEvents({ limit: 200 }), 30000), 2, 2000);
            joinedSquareChatMids = [];
            function safeStringify(obj: any) {
                return JSON.stringify(obj, (key, value) =>
                    typeof value === 'bigint' ? value.toString() + 'n' : value, 2);
            }
            if (Array.isArray(myEventResult?.events)) {
                for (const event of myEventResult.events) {
                    if (
                        event?.type === 'NOTIFIED_CREATE_SQUARE_CHAT_MEMBER' &&
                        event?.payload?.notifiedCreateSquareChatMember?.chat?.squareChatMid
                    ) {
                        const mid = event.payload.notifiedCreateSquareChatMember.chat.squareChatMid;
                        joinedSquareChatMids.push(mid);
                        if (!chatSyncTokens.has(mid)) {
                            chatSyncTokens.set(mid, null);
                        }
                        if (!chatSeenEvents.has(mid)) {
                            chatSeenEvents.set(mid, new Set());
                        }
                    }
                }
            }
        } catch (err) {
            console.log(`fetchMyEvents error: ${typeof err === "object" && err && "message" in err ? (err as any).message : String(err)}`);
        }
    }

    await updateJoinedSquareChats();
    const fetchInterval = 60 * 1000;
    let lastFetchTime = Date.now();
    while (true) {
        try {
            if (Date.now() - lastFetchTime > fetchInterval) {
                await updateJoinedSquareChats();
                lastFetchTime = Date.now();
            }
            function safeStringify(obj: any) {
                return JSON.stringify(obj, (key, value) =>
                    typeof value === 'bigint' ? value.toString() + 'n' : value, 2);
            }
            if (joinedSquareChatMids.length === 0) {
                console.log("No joinedSquareChatMids found. Waiting 10s before retry...");
                await new Promise(resolve => setTimeout(resolve, 10000));
                continue;
            }
            const batchSize = 3;
            for (let i = 0; i < joinedSquareChatMids.length; i += batchSize) {
                const batch = joinedSquareChatMids.slice(i, i + batchSize);
                const pollingPromises = batch.map(async (squareChatMid: string) => {
                    try {
                        const syncToken = chatSyncTokens.get(squareChatMid) || null;
                        const eventsResult: any = await retryApiCall(
                            () => withTimeout(client.square.fetchSquareChatEvents({ squareChatMid, limit: 10, syncToken, direction: "FORWARD" }), 30000),
                            4, 3000
                        );
                        if (eventsResult?.syncToken) {
                            chatSyncTokens.set(squareChatMid, eventsResult.syncToken);
                            saveSyncTokens();
                        }
                        const events = eventsResult?.events ?? [];
                        let seenSet = chatSeenEvents.get(squareChatMid);
                        if (!seenSet) {
                            seenSet = new Set();
                            chatSeenEvents.set(squareChatMid, seenSet);
                        }
                        for (const event of events) {
                            const eventId = (event.id ? String(event.id) : "") + ":" + (event.createdTime ? String(event.createdTime) : "");
                            if (seenSet.has(eventId)) {
                                continue;
                            }
                            seenSet.add(eventId);
                            try {
                                await processEventSquare(event, client);
                            } catch (err) {
                                console.log(`processEventSquare error: ${typeof err === "object" && err && "stack" in err ? (err as any).stack : String(err)}`);
                            }
                        }
                    } catch (err) {
                        console.log(`fetchSquareChatEvents error: ${typeof err === "object" && err && "stack" in err ? (err as any).stack : String(err)}`);
                    }
                });
                await Promise.all(pollingPromises);
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        } catch (err) {
            console.log(`startPollingSquareChatEvents error: ${typeof err === "object" && err && "stack" in err ? (err as any).stack : String(err)}`);
            await new Promise(resolve => setTimeout(resolve, 15000));
        }
    }
}

export async function run() {
    const { client } = await initializeClient();
    await startPollingSquareChatEvents(client);
}

if (require.main === module) {
    run().catch(err => {
        console.log('Fatal error', err && err.stack ? err.stack : err);
        process.exit(1);
    });
}

async function processEventSquare(event: any, client: any): Promise<void> {
    return;
}
