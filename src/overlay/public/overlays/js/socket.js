const socket = io();

/**
 * 
 * @param { (song: string) => {} } listener 
 */
export function onSpotifySong(listener) {
    socket.on("spotify-song", listener);
}

/**
 * 
 * @param { (followers: number | null) => {} } listener 
 */
export function onTwitchFollowers(listener) {
    socket.on("twitch-followers", listener);
}