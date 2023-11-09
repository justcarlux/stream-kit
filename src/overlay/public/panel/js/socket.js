const socket = io("/panel");

/**
 * 
 * @param { (log: string) => {} } listener 
 */
export function onConsoleOutput(listener) {
    socket.on("console-output", listener);
}