import { exec } from "node:child_process";
import { io } from "../app";
import * as config from "../../util/config";
import * as logger from "../../util/logger";

let currentSong = "null";
export async function initializeListener() {
    const command = (
        process.platform === "win32" ? "cmd /c chcp 65001>nul && " : "" // fix encoding thing idk
    ) + config.get("nowPlayingBinary")
    const nowPlayingProcess = exec(command, { windowsHide: true });
    nowPlayingProcess.stdout?.on("data", (data: Buffer) => {
        currentSong = data.toString("utf-8").trim();
        io.sockets.emit("spotify-song", getCurrentSong());
    });
    nowPlayingProcess.on("close", () => {
        logger.run("Spotify listener has been terminated.", {
            color: "red",
            category: "Fatal"
        });
        process.exit(0);
    });
}

export function getCurrentSong() {
    return currentSong === "null" ? null : currentSong;
}