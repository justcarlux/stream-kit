import express, { Router } from "express";
import { app } from "../app";
import path from "node:path";

const router = Router();

router.use("/", express.static(
    path.join(app.get("public"), "media")
));

export default router;