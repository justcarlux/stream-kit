import express, { Router } from "express";
import path from "node:path";
import { app } from "../app";
import { isLoggedIn } from "../middlewares/is-logged-in";

const router = Router();

router.use("/", isLoggedIn, express.static(
    path.join(app.get("public"), "panel")
));

export default router;