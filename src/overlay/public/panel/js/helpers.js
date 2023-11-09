/**
 *
 * @param { string } text
 * @param { HTMLElement } container
 */
export function colorizedConsoleTokens(text, container) {

    const colors = {
        "\x1b[0m": `#FFFFFF`, // default
        "\x1b[32m": `#47C2A5`, // green
        "\x1b[31m": `#F04248`, // red
        "\x1b[33m": `#DDD78D`, // yellow
        "\x1b[36m": `#88CCF1`, // cyan
        "\x1b[35m": `#FF66FB`, // magenta
        "\x1b[34m": `#0000f7`, // blue
        "\x1b[90m": `#747273` // gray
    }

    const colorsRegExp =
        /(\x1b\[0m)|(\x1b\[32m)|(\x1b\[31m)|(\x1b\[33m)|(\x1b\[36m)|(\x1b\[35m)|(\x1b\[34m)|(\x1b\[90m)/g;
    
    /**
     * @type { HTMLElement }
     */
    let element;
    text.split(colorsRegExp)
    .filter((e) => e)
    .forEach((e) => {
        colorsRegExp.lastIndex = 0;
        if (e.match(colorsRegExp)) {
            if (element) container.appendChild(element);
            element = document.createElement("span");
            element.style.color = colors[e];
        } else {
            element.textContent = e;
        }
    });
    if (element) container.appendChild(element);

}
