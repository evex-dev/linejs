import type { ClientInitBase } from "../core/types.ts";
export class Login {
    readonly client;
    constructor(init: ClientInitBase) {
        this.client = init.client;
    }

    /**
     * Login with email and password.
     * @param email account e-mail address
     * @param password account password
     * @param pinCode Custom pin-code. It have to be 6-digit.
     */
    async withPassword(email: string, password: string, pinCode: string) {
    }
}
