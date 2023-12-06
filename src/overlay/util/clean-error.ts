export function cleanError(err: any) {
    return err.toString()
        .replace("RangeError:", "")
        .replace("Error:", "")
        .trim();
}