import { isEmptyOrInvalid } from "../util";
import { LevelSearchResult, UnknownSongData } from "./interfaces";
import { parseLevel, parseMainSong, parseNewgroundsSong, parsePlayer } from "./parsers";

interface SearchLevelsOptions {
    page?: number
}

export async function search(searchTerm: string, options?: SearchLevelsOptions): Promise<LevelSearchResult[]> {
    
    const data = await (
        await fetch("http://www.boomlings.com/database/getGJLevels21.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "User-Agent": ""
            },
            body: new URLSearchParams({
                "gameVersion": "21",
                "binaryVersion": "35",
                "gdw": "0",
                "type": "0",
                "str": searchTerm,
                "diff": "-",
                "len": "-",
                "page": options?.page?.toString() || "0",
                "total": "0",
                "uncompleted": "0",
                "onlyCompleted": "0",
                "featured": "0",
                "original": "0",
                "twoPlayer": "0",
                "coins": "0",
                "epic": "0",
                "demonFilter": "3",
                "secret": "Wmfd2893gb7"
            })
        })
    ).text();

    if (isEmptyOrInvalid(data)) return [];

    const [levels, users, songs] = data.split("#");
    const parsedUsers = users.split("|");
    const parsedSongs = songs.split("~:~");

    return levels.split("|")
    .map((levelData): LevelSearchResult => {
        const level = parseLevel(levelData);
        return {
            level,
            player: parsePlayer(parsedUsers.find(e => e.includes(`${level.playerId}:`))),
            song: (() => {
                const newgroundsSong = parsedSongs.find(e => e.includes(`|~${level.customSongId}~|`));
                if (newgroundsSong) {
                    return parseNewgroundsSong(newgroundsSong);
                }
                if (level.customSongId && !newgroundsSong) {
                    return { id: level.customSongId, custom: true, unknown: true } as UnknownSongData;
                }
                return parseMainSong(level.officialSong);
            })()
        }
    });

}