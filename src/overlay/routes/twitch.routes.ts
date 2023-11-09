import { Router } from "express";
import { generateRandomString } from "../util/string-related";
import * as twitch from "../util/twitch";
import { cleanError } from "../util/clean-error";

const router = Router();
const apiScopes = ["moderator:read:followers"];
const stateCookieKey = "twitchAuthState";

router.get("/login", (req, res) => {
    const state = generateRandomString(16, { digits: true });
    res.cookie(stateCookieKey, state);
    res.redirect(twitch.generateOAuthURL(apiScopes, state));
});

router.get("/callback", async (req, res) => {
    const error = req.query.error_description as string | null;
    if (error) {
        return res
        .status(401)
        .json({
            error: true,
            message: error
        })
    }
    const code = req.query.code as string | null;
    if (!code) {
        return res
        .status(401)
        .json({
            error: true,
            message: "No code was provided"
        })
    }
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies[stateCookieKey] : null;
    if (state === null || state !== storedState) {
        return res
        .status(400)
        .json({
            error: true,
            message: "Cookie state mismatch"
        });
    }
    res.clearCookie(stateCookieKey);
    try {
        await twitch.authenticate(code);
    } catch (err: any) {
        return res
        .status(500)
        .json({
            error: true,
            message: cleanError(err)
        });
    }
    return res
    .status(200)
    .json({
        error: false,
        message: "Authenticated successfully"
    });
});

export default router;