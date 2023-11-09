import * as constants from "../constants.json";
import * as base64 from "../../base64";
import { parseBoolean, mapData, parseNumber } from "../util";
import { LevelData, MainSongData, NewgroundsSongData, LevelPlayerData, LevelRatingData, UnknownSongData } from "./interfaces";

export function parseRating(levelData: Map<string, string>): LevelRatingData {
    const get = (index: number) => levelData.get(index.toString())?.toString() ?? "";
    return {
        requestedStars: parseNumber(get(39)),
        stars: parseNumber(get(18)),
        difficulty: (() => {
            const isDemon = parseBoolean(get(17));
            const isAuto = parseBoolean(get(25));
            if (isAuto) return "auto";
            if (isDemon) {
                return {
                    "3": "easy-demon",
                    "4": "medium-demon",
                    "0": "hard-demon",
                    "5": "insane-demon",
                    "6": "extreme-demon"
                }[get(43)]
            }
            return {
                "0": "na",
                "10": "easy",
                "20": "normal",
                "30": "hard",
                "40": "harder",
                "50": "insane"
            }[get(9)]
        })() as LevelRatingData["difficulty"],
        epic: parseBoolean(get(42)),
        featured: parseNumber(get(19)) !== 0
    }
}

export function parseLevel(raw: string): LevelData {

    const levelData = mapData(raw.split(":"));
    const get = (index: number) => levelData.get(index.toString())?.toString() ?? "";

    return {
        name: get(2),
        description: get(3) ? base64.decode(get(3)) : null,
        id: parseNumber(get(1)),
        version: parseNumber(get(5)),
        playerId: parseNumber(get(6)),
        downloads: parseNumber(get(10)),
        likes: parseNumber(get(14)),
        length: (() => {
            return {
                "0": "tiny",
                "1": "short",
                "2": "medium",
                "3": "long",
                "4": "xl"
            }[get(15)] as LevelData["length"];
        })(),
        customSongId: parseNumber(get(35)),
        officialSong: parseNumber(get(12)),
        gameVersion: parseNumber(get(13)),
        coins: parseNumber(get(37)),
        verifiedCoins: parseBoolean(get(38)),
        rating: parseRating(levelData)
    };

}

export function parsePlayer(raw?: string): LevelPlayerData {
    if (!raw) return { playerId: 0, username: "", accountId: 0 }
    const [playerId, username, accountId] = raw.split(":");
    return {
        playerId: parseNumber(playerId),
        username,
        accountId: parseNumber(accountId)
    };
}

export function parseMainSong(officialSong: number): MainSongData {
    const track = constants.mainGameSongs[
        officialSong.toString() as keyof typeof constants.mainGameSongs
    ]
    return {
        id: officialSong,
        name: track.name,
        artist: track.artist,
        custom: false,
        unknown: false
    }
}

export function parseNewgroundsSong(raw: string): NewgroundsSongData {

    const songData = mapData(raw.split("~|~"));
    const get = (index: number) => songData.get(index.toString())?.toString() ?? "";

    return {
        id: parseNumber(get(1)),
        name: get(2),
        artist: {
            id: parseNumber(get(3)),
            name: get(4)
        },
        size: parseNumber(get(5)),
        videoId: get(6) || null,
        youtubeUrl: get(7) ? `https://www.youtube.com/channel/${get(7)}` : null,
        verified: parseBoolean(get(8)),
        link: decodeURIComponent(get(10) as string),
        custom: true,
        unknown: false
    }

}