export function cleanError(err: any) {
    return err.toString().replace("Error:").trim();
}