import { quickFetch, parameters } from "../../js/helpers.js";

const fundamentals = [

    /**
     * @returns { Promise<{ spotifyCurrentSong: string }> }
     */
    async () => {
        return {
            spotifyCurrentSong: (await quickFetch("/api/spotify/current-song", {
                parse: "json"
            })).name || "Ninguna canción por el momento"
        }
    },

    /**
     * @returns { Promise<{ twitchFollowers: string }> }
     */
    async () => {
        /**
         * @type { { followers: number } }
         */
        const { followers } = await quickFetch("/api/twitch/followers", {
            parse: "json"
        });
        return {
            twitchFollowers: followers + 
            (parameters.get("followersGoal") ? ` / ${parameters.get("followersGoal")}` : "")
        }
    },

    /**
     * @returns { Promise<{ youtubeSubscribers: string }> }
     */
    async () => {
        /**
         * @type { { subscribers: number } }
         */
        const { subscribers } = await quickFetch("/api/youtube/subscribers", {
            parse: "json"
        });
        return {
            youtubeSubscribers: subscribers + 
            (parameters.get("subscribersGoal") ? ` / ${parameters.get("subscribersGoal")}` : "")
        }
    }

]

/**
 * @returns { {
 *  spotifyCurrentSong: string,
 *  twitchFollowers: string,
 *  youtubeSubscribers: string
 * } }
 */
export async function fetchFundamentals() {
    const result = await Promise.all(
        fundamentals.map(e => e())
    );
    return result.reduce((initial, current) => {
        return { ...initial, ...current }
    }, {});
}