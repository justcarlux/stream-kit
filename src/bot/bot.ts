import { readFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "tmi.js";
import * as twitch from "../overlay/util/twitch";
import * as config from "../util/config";
import * as logger from "../util/logger";

interface Command {
    aliases: string[],
    response: string    
}

let bot: Client;

export let alreadyInitialized = false;
let connecting = false;

export async function initialize() {
    const missing = ["twitchBotUsername", "twitchBotAccessToken"].filter(key => {
        if (config.getAll()[key as keyof config.IConfiguration]) return false;
        return true;
    })
    if (missing.length) {
        throw new Error(`Unable to start the bot. Missing keys from configuration file: ${missing.join(", ")}`);
    }
    if (alreadyInitialized) {
        throw new Error("Bot is already initialized.");
    }
    if (connecting) return; // silent return
    bot = new Client({
        connection: {
            reconnect: true,
        },
        channels: [
            twitch.credentials.user.name
        ],
        identity: {
            username: config.get("twitchBotUsername"),
            password: config.get("twitchBotAccessToken")
        },
    });
    bot.connect();
    connecting = true;
    await new Promise<void>((resolve, reject) => {
        bot.on("disconnected", (reason) => {
            reject(reason);
            connecting = false;
        })
        bot.on("connected", () => {
            connecting = false;
            alreadyInitialized = true;
            logger.run(
                `Successfully connected to the Twitch Bot as: ${bot.getUsername()}`,
                { color: "green" }
            )
            resolve();
        });
    });
    bot.on("message", async (channel, userstate, message, self) => {
        let commands = [];
        try {
            commands = JSON.parse(
                await readFile(path.join(process.cwd(), "bot-commands.json"), { encoding: "utf-8" })
            );
        } catch (err) {}
        for (const index in commands) {
            const command: Command = commands[index];
            if (
                command.aliases.some(e => e.toLowerCase() === message.toLowerCase())
            ) {
                bot.say(channel, command.response);
                break;
            }
        }
    });
}

export async function disconnect() {
    if (!bot || !alreadyInitialized) {
        logger.run(
            `Tried to stop the bot, but it wasn't initialized.`,
            { color: "yellow" }
        )
        return;
    }
    alreadyInitialized = false;
    await bot.disconnect();
    logger.run(
        `Twitch Bot disconnected.`,
        { color: "green" }
    )
}

export function getUsername() {
    if (!bot || !alreadyInitialized) {
        return null;
    }
    return bot.getUsername();
}