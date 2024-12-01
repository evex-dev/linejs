import type { Auth } from "../auth/mod.ts";

export interface ClientInit {
    auth: Auth
}

export class Client {
    constructor(init: ClientInit) {
        
    }
}