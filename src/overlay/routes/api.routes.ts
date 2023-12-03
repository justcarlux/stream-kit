import { Router } from "express";
import { readdir } from "fs/promises";
import { app } from "../app";
import path from "path";
import { cleanError } from "../util/clean-error";
import { readFile } from "node:fs/promises";
import * as logger from "../../util/logger";
import * as spotify from "../util/spotify";
import * as twitch from "../util/twitch";
import { isLoggedIn } from "../middlewares/is-logged-in";
import * as config from "../../util/config";

const router = Router();

router.get("/media/waiting-screen/list", async (req, res) => {
    return res
    .status(200)
    .json(
        await readdir(
            path.join(app.get("public"), "media", "waiting-screen")
        )
    )
});

let lastRandomIndex = -1;
router.get("/media/waiting-screen/list/random-index", async (req, res) => {
    const length = (await readdir(
        path.join(app.get("public"), "media", "waiting-screen")
    )).length;
    let index = lastRandomIndex;
    while (index === lastRandomIndex) {
        index = Math.floor(Math.random() * length);
    }
    lastRandomIndex = index;
    return res
    .status(200)
    .json({ index })
});

router.get("/spotify/current-song", isLoggedIn, async (req, res) => {
    const name = spotify.getCurrentSong();
    return res
    .status(200)
    .json({ name });
});

router.get("/twitch/followers", isLoggedIn, async (req, res) => {
    const followers = await twitch.getFollowers();
    return res
    .status(200)
    .json({ followers });
});

router.get("/twitch/refresh", isLoggedIn, async (req, res) => {
    await twitch.refresh();
    logger.run("Twitch refreshed", {
        color: "green"
    });
    return res
    .status(200)
    .json({ message: "Refreshed!" })
});

router.get("/console-output", async (req, res) => {
    const output = await readFile(logger.filePath, { encoding: "utf-8" });
    return res
    .status(200)
    .json({ output })
});

router.get("/config/get", async (req, res) => {
    return res
    .status(200)
    .json(config.getAll())
});

router.post("/config/post", async (req, res) => {
    Object.keys(req.body).forEach(rawKey => {
        const key = rawKey as keyof config.IConfiguration;
        const value = req.body[rawKey] as config.IConfiguration[typeof key];
        config.set(key, value);
    });
    config.save();
});

export default router;