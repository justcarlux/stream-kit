import * as socket from "./socket.js";
import { colorizedConsoleTokens } from "./helpers.js";
import { quickFetch } from "../../js/helpers.js";

/**
 * @typedef Configuration
 * @prop { number } port
 * @prop { string } twitchClientId
 * @prop { string } twitchClientSecret
 * @prop { number } twitchInterval
 */

const refreshersSection = {
    twitchButton: document.querySelector("section#refreshers #twitch")
}
const settingsSection = {
    twitchIntervalInput: document.querySelector("section#settings input#twitch-interval")
}
const consoleOutputSection = {
    content: document.querySelector("section#console-output #content"),
    autoscrollCheck: document.querySelector("section#console-output #console-output-autoscroll")
}

document.addEventListener("DOMContentLoaded", async () => {

    colorizedConsoleTokens(
        (await (
            await fetch("/api/console-output")).json()
        ).output,
        consoleOutputSection.content
    )
    consoleOutputSection.content.scrollTo({
        top: consoleOutputSection.content.scrollHeight
    });

    /**
     * @type { Configuration }
     */
    const config = await quickFetch("/api/config/get", { parse: "json" });
    settingsSection.twitchIntervalInput.value = config.twitchInterval;
    
    for (let index = 0; index < document.forms.length; index++) {
        const form = document.forms.item(index);
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const body = {};
            form.querySelectorAll("input[name]").forEach(input => {
                if (input.type === "number") {
                    body[input.name] = input.valueAsNumber;
                } else {
                    body[input.name] = input.value;
                }
            });
            fetch(form.action, {
                method: form.method,
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify(body)
            });
        });
    }

    document.querySelectorAll(".overlay").forEach(element => {

        const url = element.getAttribute("data-url");
        let data = {};
        try {
            data = JSON.parse(window.localStorage.getItem(url)) || {};
        } catch (err) {}
        let link = new URL(url, window.location.href).href +
        (Object.keys(data).length ? `?${new URLSearchParams(data).toString()}` : "");

        const openLink = document.createElement("a");
        openLink.className = "open-link button";
        openLink.target = "_blank";
        openLink.textContent = "Open";
        openLink.href = link;
        element.appendChild(openLink);

        const copyLinkButton = document.createElement("button");
        copyLinkButton.className = "copy-link-button";
        copyLinkButton.textContent = "Copy link";
        copyLinkButton.addEventListener("click", () => {
            navigator.clipboard.writeText(link);
        });
        element.appendChild(copyLinkButton);

        element.querySelectorAll("input").forEach(input => {
            const parameter = input.getAttribute("data-parameter");
            input.placeholder = parameter;
            input.value = data[parameter] || "";
            input.addEventListener("input", () => {
                const params = {};
                element.querySelectorAll("input").forEach(_input => {
                    if (_input.value) {
                        params[_input.getAttribute("data-parameter")] = _input.value;
                    }
                    data[_input.getAttribute("data-parameter")] = _input.value;
                });
                link = `${new URL(url, window.location.href).href}?` +
                new URLSearchParams(params).toString();
                openLink.href = link;
                window.localStorage.setItem(url, JSON.stringify(data));
            });
        });

    });

    document.body.style.opacity = "1";

});

refreshersSection.twitchButton.addEventListener("click", () => {
    fetch("/api/twitch/refresh");
});

socket.onConsoleOutput((output) => {
    colorizedConsoleTokens(
        `${output}\n`,
        consoleOutputSection.content
    )
    if (consoleOutputSection.autoscrollCheck.checked) {
        consoleOutputSection.content.scrollTo({ top: consoleOutputSection.content.scrollHeight });
    }
});