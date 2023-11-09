import * as socket from "../../js/socket.js";
import { fetchFundamentals } from "../../js/fundamentals.js";
import { parameters } from "../../../js/helpers.js";

const spotifySongSection = {
    container: document.querySelector("#spotify-song"),
    name: document.querySelector("#spotify-song #name")
}
const twitchFollowersSection = {
    container: document.querySelector("#twitch-followers"),
    count: document.querySelector("#twitch-followers #count")
}

document.addEventListener("DOMContentLoaded", async () => {

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