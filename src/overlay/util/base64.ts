export function encode(value: string | null) {
    if (!value) return "";
    return Buffer.from(value).toString("base64");
}

export function decode(value: string | null) {
    if (!value) return "";
    return Buffer.from(value, "base64").toString("utf-8");
}