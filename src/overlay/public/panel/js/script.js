import * as socket from "./socket.js";
import { colorizedConsoleTokens } from "./helpers.js";
import { escapeHtml, quickFetch, renameLocalStorageKey } from "../../js/helpers.js";

const overlayTypes = {
    "/overlays/main": {
        template: `
            <h5 class="display-6" contenteditable="true">New Main Overlay Template</h5>
            <p class="blockquote-footer">Main Game Overlay</p>
            <div class="parameters">
                <div data-field-parameter="spotifysong">
                    <label class="form-check-label">Current Spotify song:</label>
                </div>
                <div data-field-parameter="twitchfollowers">
                    <label class="form-check-label">Twitch followers count:</label>
                </div>
                <div data-field-parameter="ytsubcount">
                    <label class="form-check-label">YouTube subscribers count:</label>
                </div>
                <div data-parameter="followersGoal">
                    <label class="form-label">Twitch followers goal:</label>
                </div>
                <div data-parameter="subscribersGoal">
                    <label class="form-label">YouTube subscribers goal:</label>
                </div>
            </div>
        `,
    },
    "/overlays/waiting": {
        template: `
            <h5 class="display-6" contenteditable="true">New Waiting Overlay Template</h5>
            <p class="blockquote-footer">Waiting Overlay</p>
            <div class="parameters">
                <div data-field-parameter="spotifysong">
                    <label class="form-check-label">Current Spotify song:</label>
                </div>
                <div data-field-parameter="twitchfollowers">
                    <label class="form-check-label">Twitch followers count:</label>
                </div>
                <div data-field-parameter="ytsubcount">
                    <label class="form-check-label">YouTube subscribers count:</label>
                </div>
                <div data-parameter="mainText">
                    <label class="form-label">Main text:</label>
                </div>
                <div data-parameter="secondaryText">
                    <label class="form-label">Secondary text:</label>
                </div>
                <div data-parameter="followersGoal">
                    <label class="form-label">Twitch followers goal:</label>
                </div>
                <div data-parameter="subscribersGoal">
                    <label class="form-label">YouTube subscribers goal:</label>
                </div>
            </div>
        `,
    },
};

/**
 * @typedef Configuration
 * @prop { number } twitchInterval
 * @prop { number } youtubeInterval
 */

const welcomeSection = {
    element: document.querySelector("section#welcome"),
    userInformationContainer: document.querySelector("section#welcome #user-information")
}
const overlaysSection = {
    element: document.querySelector("section#overlays"),
    container: document.querySelector("section#overlays #container"),
    createMainOverlayButton: document.querySelector(
        "section#overlays #create-buttons button[data-create-type='/overlays/main']"
    ),
    createWaitingOverlayButton: document.querySelector(
        "section#overlays #create-buttons button[data-create-type='/overlays/waiting']"
    ),
};
const refreshersSection = {
    twitchButton: document.querySelector("section#refreshers #twitch"),
    youtubeButton: document.querySelector("section#refreshers #youtube")
};
const twitchBotSection = {
    initializeButton: document.querySelector("section#twitch-bot button#initialize"),
    stopButton: document.querySelector("section#twitch-bot button#stop"),
};
const settingsSection = {
    twitchIntervalInput: document.querySelector(
        "section#settings input#twitch-interval"
    ),
    youtubeIntervalInput: document.querySelector(
        "section#settings input#youtube-interval"
    )
};
const consoleOutputSection = {
    content: document.querySelector("section#console-output #content"),
    autoscrollCheck: document.querySelector(
        "section#console-output #console-output-autoscroll"
    ),
};
const copiedToastElement = document.getElementById("copied-toast");
const copiedToast = bootstrap.Toast.getOrCreateInstance(copiedToastElement);

document.addEventListener("DOMContentLoaded", async () => {

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    /**
     * @type { {
     *    twitch: {
     *        name: string,
     *        url: string
     *    },
     *    youtube: {
     *        name: string,
     *        url: string,
     *    }
     * } }
     */
    const user = await quickFetch("/api/user", { parse: "json" });
    welcomeSection.userInformationContainer.innerHTML = `
        <div>Twitch account: <a href="${user.twitch.url}" target="_blank">${escapeHtml(user.twitch.name)}</a></div>
        <div>YouTube account: <a href="${user.youtube.url}" target="_blank">${escapeHtml(user.youtube.name)}</a></div>
    `;

    renderOverlays();

    /**
     * @type { Configuration }
     */
    const config = await quickFetch("/api/config/get", { parse: "json" });
    settingsSection.twitchIntervalInput.value = config.twitchInterval;
    settingsSection.youtubeIntervalInput.value = config.youtubeInterval;

    /**
     * @type { {
     *    initialized: boolean,
     *    username: string | null
     * } }
     */
    const status = (
        await quickFetch("/api/twitch/bot/status", { parse: "json" })
    );
    if (status.initialized) {
        twitchBotSection.initializeButton.disabled = true;
        twitchBotSection.initializeButton.textContent = `Bot connected as: ${status.username}`;
        twitchBotSection.stopButton.disabled = false;
    }

    for (let index = 0; index < document.forms.length; index++) {
        const form = document.forms.item(index);
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const body = {};
            form.querySelectorAll("input[name]").forEach((input) => {
                if (input.type === "number") {
                    body[input.name] = input.valueAsNumber;
                } else {
                    body[input.name] = input.value;
                }
            });
            quickFetch(form.action, {
                method: form.method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });
        });
    }

    colorizedConsoleTokens(
        (await quickFetch("/api/console-output", { parse: "json" })).output,
        consoleOutputSection.content
    );
    consoleOutputSection.content.scrollTo({
        top: consoleOutputSection.content.scrollHeight,
    });

    document.body.style.opacity = "1";

});

overlaysSection.createMainOverlayButton.addEventListener("click", () => {
    createOverlay("/overlays/main", {});
});

overlaysSection.createWaitingOverlayButton.addEventListener("click", () => {
    createOverlay("/overlays/waiting", {});
});

refreshersSection.twitchButton.addEventListener("click", async () => {
    refreshersSection.twitchButton.disabled = true;
    refreshersSection.twitchButton.textContent = "Refreshing Twitch...";
    try {
        await quickFetch("/api/twitch/refresh");
    } catch (err) {
        console.log(err);
    }
    refreshersSection.twitchButton.disabled = false;
    refreshersSection.twitchButton.textContent = "Twitch";
});

refreshersSection.youtubeButton.addEventListener("click", async () => {
    refreshersSection.youtubeButton.disabled = true;
    refreshersSection.youtubeButton.textContent = "Refreshing YouTube...";
    try {
        await quickFetch("/api/youtube/refresh");
    } catch (err) {
        console.log(err);
    }
    refreshersSection.youtubeButton.disabled = false;
    refreshersSection.youtubeButton.textContent = "YouTube";
});

twitchBotSection.initializeButton.addEventListener("click", async () => {
    twitchBotSection.initializeButton.textContent = "Initializing...";
    twitchBotSection.initializeButton.disabled = true;
    try {
        const response = await quickFetch("/api/twitch/bot/initialize", {
            parse: "json",
        });
        if (response.error) throw new Error();
    } catch (err) {
        twitchBotSection.initializeButton.textContent = "Initialize";
        twitchBotSection.initializeButton.disabled = false;
        return;
    }
});

twitchBotSection.stopButton.addEventListener("click", async () => {
    twitchBotSection.stopButton.textContent = "Stopping...";
    twitchBotSection.stopButton.disabled = true;
    try {
        const response = await quickFetch("/api/twitch/bot/stop", {
            parse: "json",
        });
        if (response.error) throw new Error();
    } catch (err) {
        twitchBotSection.stopButton.textContent = "Stop";
        twitchBotSection.stopButton.disabled = false;
        return;
    }
    twitchBotSection.stopButton.textContent = "Stop";
    twitchBotSection.initializeButton.textContent = "Initialize";
    twitchBotSection.initializeButton.disabled = false;
});

window.onfocus = () => {
    renderOverlays(); // for the funniest guys out there
}

socket.onConsoleOutput((output) => {
    colorizedConsoleTokens(`${output}\n`, consoleOutputSection.content);
    if (consoleOutputSection.autoscrollCheck.checked) {
        consoleOutputSection.content.scrollTo({
            top: consoleOutputSection.content.scrollHeight,
        });
    }
});

socket.onTwitchBotInitialized((username) => {
    twitchBotSection.initializeButton.disabled = true;
    twitchBotSection.initializeButton.textContent = `Bot connected as: ${username}`;
    twitchBotSection.stopButton.disabled = false;
    twitchBotSection.initializeButton.disabled = true;
});

socket.onTwitchBotStopped(() => {
    twitchBotSection.stopButton.textContent = "Stop";
    twitchBotSection.initializeButton.textContent = "Initialize";
    twitchBotSection.initializeButton.disabled = false;
    twitchBotSection.stopButton.disabled = true;
});

/**
 * @param { string } type
 * @param { Object } data
 * @param { number | undefined } providedIndex
 * @param { string | undefined } name
 */
function createOverlay(type, data, providedIndex, name) {
    
    const index = !providedIndex ? overlaysSection.container.children.length : providedIndex;
    const overlayContainer = document.createElement("div");
    overlayContainer.setAttribute("data-index", index);
    overlayContainer.setAttribute("data-url", type);
    overlayContainer.classList = "overlay";
    overlayContainer.innerHTML = overlayTypes[type].template;
    overlaysSection.container.appendChild(overlayContainer);

    const titleElement = overlayContainer.querySelector("h5");
    if (name) titleElement.textContent = name;
    const url = overlayContainer.getAttribute("data-url");

    let link =
        new URL(url, window.location.href).href +
        (Object.keys(data).length
            ? `/?${new URLSearchParams(data).toString()}`
            : "");

    const openLink = document.createElement("a");
    openLink.className = "open-link btn btn-primary";
    openLink.target = "_blank";
    openLink.textContent = "Open";
    openLink.href = link;
    overlayContainer.appendChild(openLink);

    function update() {
        const fields = [];
        overlayContainer
            .querySelectorAll("div[data-field-parameter]")
            .forEach((container) => {
                const fieldParameter = container.getAttribute(
                    "data-field-parameter"
                );
                const checked = container.querySelector(
                    "input[type='checkbox']"
                ).checked;
                if (checked) fields.push(fieldParameter);
            });
        data.fields = fields.join(",");
        link =
            `${new URL(url, window.location.href).href}?` +
            new URLSearchParams(data).toString();
        openLink.href = link;
        const currentIndex = overlayContainer.getAttribute("data-index");
        const currentName = titleElement.textContent;
        window.localStorage.setItem(currentIndex.toString(), JSON.stringify({
            name: currentName,
            type,
            data
        }));
    }

    const copyLinkButton = document.createElement("button");
    copyLinkButton.className = "copy-link-button btn btn-primary";
    copyLinkButton.textContent = "Copy link";
    copyLinkButton.addEventListener("click", () => {
        const title = titleElement.textContent;
        copiedToastElement.querySelector(
            ".toast-header strong"
        ).textContent = `${title} link`;
        copiedToast.show();
        navigator.clipboard.writeText(link);
    });
    overlayContainer.appendChild(copyLinkButton);
    
    const deleteButton = document.createElement("button");
    deleteButton.className = "copy-link-button btn btn-danger";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => {
        const currentIndex = overlayContainer.getAttribute("data-index");
        deleteOverlay(currentIndex);
    });
    overlayContainer.appendChild(deleteButton);

    titleElement.addEventListener("input", () => {
        update();
    });

    overlayContainer
        .querySelectorAll("div[data-parameter], div[data-field-parameter]")
        .forEach((container) => {
            const label = container.querySelector("label");
            const parameter = container.getAttribute("data-parameter");
            const fieldParameter = container.getAttribute(
                "data-field-parameter"
            );
            if (parameter) {
                const input = document.createElement("input");
                input.type = "text";
                input.value = data[parameter] || "";
                label.htmlFor = `${parameter}-${index}-input`;
                input.id = `${parameter}-${index}-input`;
                input.className = `form-control`;
                input.addEventListener("input", () => {
                    data[parameter] = input.value;
                    update();
                });
                container.appendChild(input);
            }
            if (fieldParameter) {
                const input = document.createElement("input");
                input.type = "checkbox";
                input.checked = data?.fields
                    ? data.fields.split(",").includes(fieldParameter)
                    : false;
                label.htmlFor = `${fieldParameter}-${index}-check`;
                input.id = `${fieldParameter}-${index}-check`;
                input.className = "form-check-input";
                input.addEventListener("input", () => {
                    update();
                });
                container.appendChild(input);
            }
        });

    const currentName = titleElement.textContent;
    window.localStorage.setItem(index.toString(), JSON.stringify({
        name: currentName,
        type,
        data
    }));

}

/**
 * @param { number } index 
 */
function deleteOverlay(index) {
    window.localStorage.removeItem(index.toString());
    Object.keys(window.localStorage).forEach(i => {
        const currentIndex = parseInt(i);
        if (currentIndex > index) {
            renameLocalStorageKey(i, (currentIndex - 1).toString() + "-");
        }
    });
    Object.keys(window.localStorage).forEach(key => {
        renameLocalStorageKey(key, key.replace("-", ""));
    });
    renderOverlays();
}

function renderOverlays() {
    overlaysSection.container.innerHTML = "";
    Object.keys(window.localStorage)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .forEach(index => {
        let overlay;
        try {
            overlay = JSON.parse(window.localStorage.getItem(index));
        } catch (err) {
            return;
        }
        const { type, data, name } = overlay;
        createOverlay(type, data, parseInt(index), name);
    });
}