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

export async function initialize() {
    const bot = new Client({
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
    bot.on("connected", () => {
        logger.run(
            `Connected to the Twitch Bot as: ${bot.getUsername()}`,
            { color: "green" }
        )
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
    await bot.connect();
}