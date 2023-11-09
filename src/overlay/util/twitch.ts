import { TwitchCredentialsHolder } from "../structures/TwitchCredentialsHolder";
import * as logger from "../util/logger";
import * as config from "./config";
import querystring from "node:querystring";
import { RefreshingAuthProvider, exchangeCode } from '@twurple/auth';
import { ApiClient, HelixUser } from "@twurple/api";
import { io } from "../app";
import { EventSubWsListener } from "@twurple/eventsub-ws";
import { spawn } from "node:child_process";

const credentials = new TwitchCredentialsHolder();
const oAuthBaseURL = "https://id.twitch.tv/oauth2";

export function generateOAuthURL(scopes: string[], state: string) {
    return `${oAuthBaseURL}/authorize?${querystring.stringify({
        response_type: "code",
        client_id: config.get("twitchClientId"),
        redirect_uri: `http://localhost:${config.get("port")}/twitch/callback`,
        scope: scopes.join(" "),
        state
    })}`
}

export async function authenticate(code: string) {

    const accessToken = await exchangeCode(
        config.get("twitchClientId") as string,
        config.get("twitchClientSecret") as string,
        code,
        `http://localhost:${config.get("port")}/twitch/callback`
    );
    const authProvider = new RefreshingAuthProvider({
        clientId: config.get("twitchClientId") as string,
        clientSecret: config.get("twitchClientSecret") as string
    });

    const userId = await authProvider.addUserForToken(accessToken);
    credentials.api = new ApiClient({ authProvider });
    credentials.eventSubListener = new EventSubWsListener({ apiClient: credentials.api });
    credentials.eventSubListener.start();
    credentials.eventSubListener.onChannelFollow(userId, userId, async (event) => {
        io.sockets.emit("twitch-followers", (followersCache as number) + 1);
    });
    credentials.user = await credentials.api.users.getUserById(userId) as HelixUser;

}

let followersCache: number | null = null;
export async function getFollowers() {
    let followers: number | null = null;
    try {
        followers = (await credentials.user.getChannelFollowers()).total;
    } catch (err) {
        logger.run(err, { color: "red" });
    }
    followersCache = followers;
    return followers;
}

export async function initializeInterval() {
    refresh();
    setTimeout(() => refresh(true), config.get("twitchInterval"));
}

export async function refresh(interval?: boolean) {
    io.sockets.emit("twitch-followers", await getFollowers());
    if (interval) {
        setTimeout(() => refresh(true), config.get("twitchInterval"));
    }
}

export async function requestLogin() {
    const url = `http://localhost:${config.get("port")}/twitch/login`;
    const draft = logger.run(
        `Log-in to Twitch: ${url}`,
        { color: "yellow" }, true
    )
    spawn(`start ${url}`, { shell: true, windowsHide: true });
    return await new Promise<void>(resolve => {
        credentials.once("provided", () => {
            logger.run(
                `Log-in to Twitch: Success -> Account: ${credentials.user.name}`,
                { logFunction: draft, color: "green" }
            )
            resolve();
        });
    });
}