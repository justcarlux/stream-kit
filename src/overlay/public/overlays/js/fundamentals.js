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
     * @returns { Promise<{ twitchFollowers: number | null }> }
     */
    async () => {
        /**
         * @type { { followers: number } }
         */
        const { followers } = await quickFetch("/api/twitch/followers", {
            parse: "json"
        });
        if (followers === null) return { twitchFollowers: null };
        return {
            twitchFollowers: followers + 
            (parameters.has("followersGoal") ? ` / ${parameters.get("followersGoal")}` : "")
        }
    }

]

/**
 * @returns { {
 *  spotifyCurrentSong: string,
 *  twitchFollowers: number | null
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