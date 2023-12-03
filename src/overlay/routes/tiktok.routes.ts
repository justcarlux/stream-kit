import { Router } from "express";
import { generateRandomString } from "../util/string-related";
import * as twitch from "../util/twitch";
import { cleanError } from "../util/clean-error";

const router = Router();
const apiScopes = ["user.info.basic"];
const stateCookieKey = "tiktokAuthState";

router.get("/login", (req, res) => {
    const state = generateRandomString(32, { digits: true });
    res.cookie(stateCookieKey, state);
    res.redirect(twitch.generateOAuthURL(apiScopes, state));
});

router.get("/callback", async (req, res) => {
    console.log(req);
});

export default router;