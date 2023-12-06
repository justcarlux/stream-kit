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
 * @param { (followers: number) => {} } listener 
 */
export function onTwitchFollowers(listener) {
    socket.on("twitch-followers", listener);
}

/**
 * 
 * @param { (subscribers: number) => {} } listener 
 */
export function onYouTubeSubscribers(listener) {
    socket.on("youtube-subscribers", listener);
}