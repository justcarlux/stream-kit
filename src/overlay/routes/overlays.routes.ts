import express, { Router } from "express";
import { app } from "../app";
import path from "node:path";
import { isLoggedIn } from "../middlewares/is-logged-in";

const router = Router();

router.use("/", isLoggedIn, express.static(
    path.join(app.get("public"), "overlays")
));

export default router;