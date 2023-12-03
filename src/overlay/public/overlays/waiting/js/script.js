import { parameters, wait } from "../../../js/helpers.js";
import { fetchFundamentals } from "../../js/fundamentals.js";
import * as socket from "../../js/socket.js";

/**
 * @typedef GeometryDashLevel
 * @prop { number } id
 * @prop { string } name
 * @prop { string } author
 * @prop { { name: string, artist: string | null } } song
 * @prop { string } difficultyKey
 */

const spotifySongSection = {
    container: document.querySelector("#spotify-song"),
    name: document.querySelector("#spotify-song #name")
}
const twitchFollowersSection = {
    container: document.querySelector("#twitch-followers"),
    count: document.querySelector("#twitch-followers #count")
}
const extraTextSection = {
    container: document.querySelector("#extra-text"),
    main: document.querySelector("#extra-text #main"),
    secondary: document.querySelector("#extra-text #secondary")
}

/**
 * @type { string[] }
 */
// let videos;
document.addEventListener("DOMContentLoaded", async () => {

    await new Promise((resolve) => {
        const interval = setInterval(() => {
            const loaded = document.fonts.check('23px Nunito', "test");
            if (loaded) {
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });
    await wait(200);
    
    if (parameters.has("mainText")) {
        extraTextSection.main.textContent = parameters.get("mainText");
    }
    if (parameters.has("secondaryText")) {
        extraTextSection.secondary.textContent = parameters.get("secondaryText");
    }
    extraTextSection.container.classList.add("show");

    const {
        spotifyCurrentSong,
        twitchFollowers
    } = await fetchFundamentals();

    spotifySongSection.name.textContent = spotifyCurrentSong;
    spotifySongSection.container.classList.add("show");
    
    twitchFollowersSection.count.textContent = twitchFollowers;
    twitchFollowersSection.container.classList.add("show");
    
});

socket.onSpotifySong(song => {
    spotifySongSection.name.textContent = song || "Ninguna canción por el momento";
});

socket.onTwitchFollowers(followers => {
    if (followers === null) return;
    twitchFollowersSection.count.textContent = followers +
    (parameters.has("followersGoal") ? ` / ${parameters.get("followersGoal")}` : "");
});