import { Router } from "express";
import { readdir } from "fs/promises";
import { readFile } from "node:fs/promises";
import path from "path";
import * as config from "../../util/config";
import * as logger from "../../util/logger";
import { app, io } from "../app";
import { isLoggedIn } from "../middlewares/is-logged-in";
import * as spotify from "../util/spotify";
import * as twitch from "../util/twitch";
import * as youtube from "../util/youtube";
import * as bot from "../../bot/bot";
import { cleanError } from "../util/clean-error";

const router = Router();

router.get("/user", isLoggedIn, async (req, res) => {
    return res
    .status(200)
    .json({
        twitch: {
            name: twitch.credentials.user.displayName,
            url: `https://www.twitch.tv/${twitch.credentials.user.name}`
        },
        youtube: {
            name: youtube.credentials.channel.name,
            url: `https://www.youtube.com/channel/${youtube.credentials.channel.id}`
        }
    });
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

router.get("/youtube/subscribers", isLoggedIn, async (req, res) => {
    const subscribers = await youtube.getSubscribers();
    return res
    .status(200)
    .json({ subscribers });
});

router.get("/youtube/refresh", isLoggedIn, async (req, res) => {
    await youtube.refresh();
    logger.run("YouTube refreshed", {
        color: "green"
    });
    return res
    .status(200)
    .json({ message: "Refreshed!" })
});

router.get("/twitch/bot/status", isLoggedIn, async (req, res) => {
    const username = bot.getUsername();
    return res
    .status(200)
    .json({
        initialized: bot.alreadyInitialized,
        username
    });
});

router.get("/twitch/bot/initialize", isLoggedIn, async (req, res) => {
    try {
        await bot.initialize();
    } catch (err: any) {
        logger.run(
            err.toString(),
            { color: "red" }
        )
        return res
        .status(500)
        .json({ error: true, message: cleanError(err) })
    }
    io.of("/panel").emit("twitch-bot-initialized", bot.getUsername());
    return res
    .status(200)
    .json({ error: false, message: "Initialized!" })
});

router.get("/twitch/bot/stop", isLoggedIn, async (req, res) => {
    try {
        await bot.disconnect();
    } catch (err: any) {
        logger.run(
            err.toString(),
            { color: "red" }
        )
        return res
        .status(500)
        .json({ error: true, message: cleanError(err) })
    }
    io.of("/panel").emit("twitch-bot-stopped");
    return res
    .status(200)
    .json({ error: false, message: "Stopped!" })
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