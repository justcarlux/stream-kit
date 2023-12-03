import querystring from "node:querystring";
import * as config from "../../util/config";
import { TikTokCredentialsHolder } from "../structures/TikTokCredentialsHolder";
import * as logger from "../../util/logger";

export const credentials = new TikTokCredentialsHolder();
const oAuthBaseURL = "https://www.tiktok.com/v2/auth";

export function generateOAuthURL(scopes: string[], state: string) {
    return `${oAuthBaseURL}/authorize?${querystring.stringify({
        client_key: config.get("tiktokClientKey"),
        scope: "user.info.basic",
        redirect_uri: `http://localhost:${config.get("port")}/tiktok/callback`,
        state,
        response_type: "code"
    })}`
}

export async function requestLogin() {
    const url = `http://localhost:${config.get("port")}/tiktok/login`;
    const draft = logger.run(
        `(2/2) Log-in to TikTok: ${url}`,
        { color: "yellow" }, true
    )
    // spawn(`start ${url}`, { shell: true, windowsHide: true });
    return await new Promise<void>(resolve => {
        credentials.once("provided", () => {
            logger.run(
                `Log-in to TikTok: Success -> Account: `,
                { logFunction: draft, color: "green" }
            )
            resolve();
        });
    });
}