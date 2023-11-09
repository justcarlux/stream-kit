import { LevelRatingData } from "./levels/interfaces";

export function parseNumber(value: string | null) {
    return (
        value?.match(/\-?(\d+\.\d+|\d+)/g)?.join("")?.length === value?.length && 
        typeof value?.length === "number"
    ) ? Number(value) : 0;
}

export function parseBoolean(value: string | null) {
    return value === '1';
}

export function mapData(raw: string[] | null) {
    const map = new Map<string, string>();
    if (!raw) return map;
    raw.forEach((element, index) => {
        if (index % 2 === 0) map.set(element, raw[index + 1]);
    });
    return map;
}

export function isEmptyOrInvalid(text: string) {
    return text === "-1" || text === "-2" || !text;
}

export function getDifficultyImageKey(rating: LevelRatingData) {
    let key: string = '';
    if (rating.featured) key = "featured-";
    if (rating.epic) key = "epic-";
    key += rating.difficulty;
    if (rating.stars) key += `-${rating.stars}`;
    return key;
}