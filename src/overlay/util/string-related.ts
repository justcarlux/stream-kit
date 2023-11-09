interface GenerateRandomStringOptions {
    digits?: boolean,
    symbols?: boolean
}

export function generateRandomString(length: number, options: GenerateRandomStringOptions) {
    const dictionary = "abcdefghijklmnopqrstuvwxyz" +
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
    (options.digits ? "123456789" : "") +
    (options.symbols ? "`’\"'()[]{}:;,-_¡!.<>¿?#$%&=+-*/¨ñÑ" : "");
    return new Array(length).fill(null).map(() => {
        return dictionary.at(Math.floor(Math.random() * dictionary.length))
    }).join("");
}

export function stringifyAny(object: any): string {
    if (object === undefined) return "undefined";
    if (object === null) return "null";
    return typeof object === 'object' ?
        (Object.keys(object).length ? JSON.stringify(object, null, 4) : object.toString())
    : object.toString();
}
