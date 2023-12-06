const socket = io("/panel");

/**
 * 
 * @param { (log: string) => {} } listener 
 */
export function onConsoleOutput(listener) {
    socket.on("console-output", listener);
}

/**
 * 
 * @param { (username: string) => {} } listener 
 */
export function onTwitchBotInitialized(listener) {
    socket.on("twitch-bot-initialized", listener);
}

/**
 * 
 * @param { () => {} } listener 
 */
export function onTwitchBotStopped(listener) {
    socket.on("twitch-bot-stopped", listener);
}