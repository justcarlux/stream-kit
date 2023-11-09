import { quickFetch, wait, parameters } from "../../../js/helpers.js";
import * as socket from "../../js/socket.js";
import { fetchFundamentals } from "../../js/fundamentals.js";

/**
 * @typedef GeometryDashLevel
 * @prop { number } id
 * @prop { string } name
 * @prop { string } author
 * @prop { { name: string, artist: string | null } } song
 * @prop { string } difficultyKey
 */

const videoElement = document.querySelector("video");
const levelInfoSection = {
    container: document.querySelector("#level-info"),
    image: document.querySelector("#level-info img"),
    name: document.querySelector("#level-info #name"),
    author: document.querySelector("#level-info #author")
}
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

    // videos = await quickFetch("/api/media/waiting-screen/list", { parse: "json" });
    
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

    // changeVideo(false);
    
});

// /**
//  * @param { boolean } fromEndedEvent
//  */
// async function changeVideo(fromEndedEvent) {
//     if (fromEndedEvent) {
//         levelInfoSection.container.classList.remove("show");
//         levelInfoSection.container.classList.add("hide");
//         await wait(900);
//     }
//     /**
//      * @type { { index: number } }
//      */
//     const { index } = await quickFetch("/api/media/waiting-screen/list/random-index", { parse: "json" });
//     const selected = videos[index];
//     videoElement.src = `/media/waiting-screen/${selected}`;
//     videoElement.play();
//     videoElement.onended = () => changeVideo(true);
//     updateLevelInformation(selected.slice(0, selected.lastIndexOf(".")));
// }

// /**
//  * @param { string } levelId
//  */
// async function updateLevelInformation(levelId) {

//     /**
//      * @type { GeometryDashLevel | null }
//      */
//     let level = null;
//     let remainingTries = 5;
//     while (!level && remainingTries > 0) {
//         if (remainingTries < 5) await wait(1000);
//         try {
//             level = (await quickFetch(`/api/geometry-dash/level/${levelId}`, { parse: "json" })).data;
//         } catch (err) {}
//         remainingTries--;
//     }

//     if (level) {
//         levelInfoSection.image.src = `/media/geometry-dash/difficulty-faces/${level.difficultyKey}.png`;
//         levelInfoSection.name.textContent = `${level.name} (ID: ${level.id})`;
//         levelInfoSection.author.textContent = `Creado por: ${level.author}`;
//     } else {
//         levelInfoSection.image.src = `/media/geometry-dash/difficulty-faces/na.png`;
//         levelInfoSection.name.textContent = `No conozco este nivel. :(`;
//         levelInfoSection.author.innerHTML = "";
//     }

//     await new Promise((resolve) => {
//         levelInfoSection.image.onload = resolve();
//     });

//     levelInfoSection.container.classList.remove("hide");
//     levelInfoSection.container.classList.add("show");

// }

socket.onSpotifySong(song => {
    spotifySongSection.name.textContent = song || "Ninguna canción por el momento";
});

socket.onTwitchFollowers(followers => {
    if (followers === null) return;
    twitchFollowersSection.count.textContent = followers +
    (parameters.has("followersGoal") ? ` / ${parameters.get("followersGoal")}` : "");
});