export interface LevelSearchResult {
    level: LevelData,
    player: LevelPlayerData,
    song: MainSongData | NewgroundsSongData | UnknownSongData
}

export interface LevelData {
    name: string,
    description: string | null,
    id: number,
    version: number,
    playerId: number,
    downloads: number,
    likes: number,
    length: "tiny" | "short" | "medium" | "long" | "xl",
    customSongId: number,
    officialSong: number,
    gameVersion: number,
    coins: number,
    verifiedCoins: boolean,
    rating: LevelRatingData
}

export interface LevelRatingData {
    requestedStars: number,
    stars: number,
    difficulty: "na" | "auto" | "easy" | "normal" | "hard" | "harder" | "insane" | "easy-demon" | "medium-demon" | "hard-demon" | "insane-demon" | "extreme-demon"
    epic: boolean,
    featured: boolean
}

export interface LevelPlayerData {
    playerId: number,
    username: string,
    accountId: number
}

export interface NewgroundsSongData {
    id: number,
    name: string,
    artist: {
        id: number,
        name: string
    },
    size: number,
    videoId: string | null,
    youtubeUrl: string | null,
    verified: boolean,
    link: string,
    custom: boolean,
    unknown: boolean
}

export interface MainSongData {
    id: number,
    name: string,
    artist: string,
    custom: boolean,
    unknown: boolean
}

export interface UnknownSongData {
    id: number,
    custom: boolean
    unknown: boolean
}