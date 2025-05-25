import "@jest/globals";

declare global {
    const jest: typeof import("@jest/globals");
    const describe: typeof import("@jest/globals").describe;
    const it: typeof import("@jest/globals").it;
    const expect: typeof import("@jest/globals").expect;
    const beforeEach: typeof import("@jest/globals").beforeEach;
}
