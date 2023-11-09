/**
 * @param { number } ms 
 */
export async function wait(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}

/**
 * @param { string } route 
 * @param { {
 *    method: "GET" | undefined,
 *    parse: "json" | "text"
 * } } options 
 */
export async function quickFetch(route, options) {
    const response = await fetch(route, {
        method: options.method || "GET"
    });
    switch (options.parse) {
        case "json":
            return await response.json();
    
        case "text":
            return await response.text();
    }
}

export const parameters = new URLSearchParams(window.location.search);