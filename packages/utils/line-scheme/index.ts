/**
 * @module
 * Utility for LINE Scheme URI
 */

type LINE_SCHEME_PREFIX =
    | "line://"
    | "http://line.me/R/"
    | "https://line.me/R/"
    | "http://line.naver.jp/R/"
    | "https://line.naver.jp/R/"
    // deno-lint-ignore ban-types
    | (string & {});

class LINE_SCHEME_BASE {
    constructor(
        public prefix: LINE_SCHEME_PREFIX = "line://",
    ) {}

    public getHome() {
        return this.prefix + "home";
    }

    public getProfile() {
        return this.prefix + "profile";
    }
}

console.log(new LINE_SCHEME_BASE("line://").getHome())

export { LINE_SCHEME_BASE as LINE_SCHEME };
