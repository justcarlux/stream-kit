import { readFileSync, writeFileSync } from "fs";
import path from "node:path";
import * as logger from "./logger";

export interface IConfiguration {
    port?: number,
    twitchClientId?: string,
    twitchClientSecret?: string,
    twitchBotUsername?: string,
    twitchBotAccessToken?: string,
    googleClientId?: string,
    googleClientSecret?: string,
    twitchInterval?: number,
    youtubeInterval?: number,
    nowPlayingBinary?: string
}

const required: (keyof IConfiguration)[] = [
    "port",
    "twitchClientId",
    "twitchClientSecret",
    "googleClientId",
    "googleClientSecret",
    "nowPlayingBinary"
];

const defaults: IConfiguration = {
    twitchInterval: 90_000,
    youtubeInterval: 15_000
}

const filePath = path.join(process.cwd(), "config.json");
let config: IConfiguration = {};
try {
    config = JSON.parse(
        readFileSync(filePath, { encoding: "utf-8" })
    )
} catch (err) {}

const missing = required.filter(key => {
    if (config[key as keyof IConfiguration]) return false;
    return true;
})
if (missing.length) {
    throw new Error(`Missing keys from configuration file: ${missing.join(", ")}`);
}

export function get<K extends keyof IConfiguration>(key: K): IConfiguration[K] {
    return config[key] || defaults[key];
}

export function set<K extends keyof IConfiguration>(
    key: K, value: IConfiguration[K]
) {
    if (!value) {
        delete config[key];
    } else {
        config[key] = value;
    }
}

export async function save() {
    try {
        writeFileSync(filePath, JSON.stringify(config, null, 4));
    } catch (err: any) {
        logger.run(err.stack || err, { color: "red" });
    }
}

export function getAll() {
    return { ...defaults, ...config };
}