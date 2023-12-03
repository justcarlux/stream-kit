import * as bot from "./bot/bot";
import * as overlay from "./overlay/app";

async function main() {
    await overlay.initialize();
    await bot.initialize();
}

main();