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
 *    headers: Object | undefined,
 *    body: string | undefined,
 *    parse: "json" | "text"
 * } } options 
 */
export async function quickFetch(route, options) {
    const response = await fetch(route, {
        method: options?.method || "GET",
        headers: options?.headers,
        body: options?.body
    });
    switch (options?.parse) {
        case "json":
            return await response.json();
    
        case "text":
            return await response.text();
        
        case "arrayBuffer":
            return await response.arrayBuffer();
    }
}

export const parameters = new URLSearchParams(window.location.search);

/**
 * 
 * @param { string } oldKey 
 * @param { string } newKey 
 */
export function renameLocalStorageKey(oldKey, newKey) {
    const data = window.localStorage.getItem(oldKey);
    window.localStorage.removeItem(oldKey);
    window.localStorage.setItem(newKey, data);
}

/**
 * @param {string} text
*/
export function escapeHtml(text) {
    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");
}