import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import http from "node:http";
import path from "node:path";
import { Server } from "socket.io";
import * as config from "../util/config";
import exceptionCatchers from "./util/exception-catchers";
import * as spotify from "./util/spotify";
import * as twitch from "./util/twitch";
import * as tiktok from "./util/tiktok";
import * as logger from "../util/logger";
import { getPrivateAddress } from "./util/get-private-address";

export const app = express()
.set("public", path.join(require.main?.path as string, "overlay", "public"))
.use(cors())
.use(cookieParser())
.use(express.json())
.use((req, res, next) => {
    if (!app.get("logged-in")) {
        next();
        return;
    }
    logger.run(`${req.method} - ${req.url}`, {
        color: "cyan"
    })
    next();
})

export const server = http.createServer(app);
export const io = new Server(server);

import routes from "./routes/index.routes";
app.use("/", routes);

export async function initialize() {

    await new Promise<void>(resolve => {
        server.listen(config.get("port"), () => resolve());
    });

    logger.clearFile();
    exceptionCatchers();
    await spotify.initializeListener();
    await twitch.requestLogin();
    // await tiktok.requestLogin();
    twitch.initializeInterval();
    app.set("logged-in", true);
    
    const privateAddress = getPrivateAddress();
    logger.run(`Overlay initialized.`, {
         color: "green",
        stringBefore: "\n"
    });
    logger.run([
        `You can access the panel using:`,
        `- http://localhost:${config.get("port")}/panel (local computer)`,
        privateAddress ? `- http://${privateAddress}:${config.get("port")}/panel (local network)` : null
    ].filter(e => e).join("\n") + "\n", {
        color: "cyan"
    });

}