import * as socket from "../../js/socket.js";
import { fetchFundamentals } from "../../js/fundamentals.js";
import { parameters } from "../../../js/helpers.js";

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

document.addEventListener("DOMContentLoaded", async () => {

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
    console.log(subscribers);
    youtubeSubscribersSection.count.textContent = subscribers +
    (parameters.get("subscribersGoal") ? ` / ${parameters.get("subscribersGoal")}` : "");
});