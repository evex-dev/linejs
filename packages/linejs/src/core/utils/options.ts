export function mergeObject<T1, T2 extends Partial<T1>>(
    base: T1,
    add: T2,
): T1 & T2 {
    return { ...base, ...add };
}
