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

const topInfoContainer = document.querySelector("section#top-info");
const spotifySongSection = {
    container: document.querySelector("#spotify-song"),
    name: document.querySelector("#spotify-song #name")
}
const twitchFollowersSection = {
    container: document.querySelector("#twitch-followers"),
    count: document.querySelector("#twitch-followers #count")
}
const youtubeSubscribersSection = {
    container: document.querySelector("#youtube-subscribers"),
    count: document.querySelector("#youtube-subscribers #count")
}
const bottomInfoContainer = document.querySelector("section#bottom-info");
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
    
    if (parameters.get("mainText")) {
        extraTextSection.main.textContent = parameters.get("mainText");
    }
    if (parameters.get("secondaryText")) {
        extraTextSection.secondary.textContent = parameters.get("secondaryText");
    }
    if (!bottomInfoContainer.textContent.trim()) {
        bottomInfoContainer.style.display = "none";
    }
    bottomInfoContainer.classList.add("show");

    const fields = parameters.get("fields") ? parameters.get("fields").split(",") : [];
    if (fields.includes("spotifysong")) {
        spotifySongSection.container.style.display = "flex";
    }
    if (fields.includes("twitchfollowers")) {
        twitchFollowersSection.container.style.display = "flex";
    }
    if (fields.includes("ytsubcount")) {
        youtubeSubscribersSection.container.style.display = "flex";
    }

    const {
        spotifyCurrentSong,
        twitchFollowers,
        youtubeSubscribers
    } = await fetchFundamentals();

    spotifySongSection.name.textContent = spotifyCurrentSong;
    twitchFollowersSection.count.textContent = twitchFollowers;
    youtubeSubscribersSection.count.textContent = youtubeSubscribers;
    topInfoContainer.classList.add("show");
    
});

socket.onSpotifySong(song => {
    spotifySongSection.name.textContent = song || "Ninguna canción por el momento";
});

socket.onTwitchFollowers(followers => {
    twitchFollowersSection.count.textContent = followers +
    (parameters.get("followersGoal") ? ` / ${parameters.get("followersGoal")}` : "");
});

socket.onYouTubeSubscribers(subscribers => {
    youtubeSubscribersSection.count.textContent = subscribers +
    (parameters.get("subscribersGoal") ? ` / ${parameters.get("subscribersGoal")}` : "");
});