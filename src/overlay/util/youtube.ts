import { google } from "googleapis";
import * as config from "../../util/config";
import * as logger from "../../util/logger";
import { YouTubeCredentialsHolder } from "../structures/YouTubeCredentialsHolder";
import { io } from "../app";

const client = new google.auth.OAuth2({
    clientId: config.get("googleClientId"),
    clientSecret: config.get("googleClientSecret"),
    redirectUri: `http://localhost:${config.get("port")}/youtube/callback`
});

export const credentials = new YouTubeCredentialsHolder();

export function generateOAuthURL(scopes: string[], state: string) {
    return client.generateAuthUrl({
        scope: scopes,
        access_type: "online",
        state
    });
}

export async function authenticate(code: string) {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);
    const response = await credentials.youtube.channels.list({
        auth: client,
        part: ["snippet", "statistics"],
        mine: true
    });
    const channel = response.data.items?.at(0);
    if (!channel) {
        throw new Error("There's not a YouTube channel belonging to this Google Account");
    }
    if (!channel.statistics) {
        throw new Error("Failed to fetch statistics");
    }
    if (channel.statistics.hiddenSubscriberCount) {
        throw new Error("The YouTube channel has its subscribers hidden");
    }
    credentials.channel = {
        id: channel.id as string,
        name: channel.snippet?.title as string,
        description: channel.snippet?.description,
        customUrl: channel.snippet?.customUrl as string
    }
    credentials.client = client;
    subscribersCache = parseInt(channel.statistics.subscriberCount || "");
}

let subscribersCache: number;
export async function getSubscribers() {
    let subscribers: string | null | undefined = null;
    try {
        subscribers = (await credentials.youtube.channels.list({
            auth: client,
            part: ["statistics"],
            mine: true
        })).data.items?.at(0)?.statistics?.subscriberCount;
        if (subscribers === null || subscribers === undefined) {
            return subscribersCache;
        }
    } catch (err) {
        logger.run(err, { color: "red" });
        return subscribersCache;
    }
    const value = parseInt(subscribers);
    subscribersCache = value;
    return value;
}

export async function initializeInterval() {
    refresh();
    setTimeout(() => refresh(true), config.get("youtubeInterval"));
}

export async function refresh(interval?: boolean) {
    io.sockets.emit("youtube-subscribers", await getSubscribers());
    if (interval) {
        setTimeout(() => refresh(true), config.get("youtubeInterval"));
    }
}

export async function requestLogin() {
    const url = `http://localhost:${config.get("port")}/youtube/login`;
    const draft = logger.run(
        `(2/2) Log-in to YouTube: ${url}`,
        { color: "yellow" }, true
    )
    return await new Promise<void>(resolve => {
        credentials.once("provided", () => {
            logger.run(
                `(2/2) Log-in to YouTube: Success -> Account: ${credentials.channel.name}`,
                { logFunction: draft, color: "green" }
            )
            resolve();
        });
    });
}