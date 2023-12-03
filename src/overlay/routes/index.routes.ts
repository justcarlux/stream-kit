import { Router } from "express";
import express from "express";
import { app } from "../app";
import path from "node:path";

const router = Router();

import mediaRoutes from "./media.routes";
router.use("/media", mediaRoutes);

import panelRoutes from "./panel.routes";
router.use("/panel", panelRoutes);

import overlaysRoutes from "./overlays.routes";
router.use("/overlays", overlaysRoutes);

import apiRoutes from "./api.routes";
router.use("/api", apiRoutes);

import twitchRoutes from "./twitch.routes";
router.use("/twitch", twitchRoutes);

import tiktokRoutes from "./tiktok.routes";
router.use("/tiktok", tiktokRoutes);

router.use("/css", express.static(
    path.join(app.get("public"), "css")
));

router.use("/js", express.static(
    path.join(app.get("public"), "js")
));

export default router;