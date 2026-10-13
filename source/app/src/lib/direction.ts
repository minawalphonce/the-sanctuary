export type Direction = "ltr" | "rtl";

const STORAGE_KEY = "sanctuary.dir";

function read(): Direction | null {
    try {
        const v = localStorage.getItem(STORAGE_KEY);
        return v === "rtl" || v === "ltr" ? v : null;
    } catch {
        return null;
    }
}

function write(dir: Direction) {
    try {
        localStorage.setItem(STORAGE_KEY, dir);
    } catch {
        /* storage unavailable — direction just won't persist */
    }
}

// Test hook until language selection exists: `?dir=rtl` / `?dir=ltr` sets and
// persists the direction. Replaced by the language setting in the i18n phase.
export function getDirection(): Direction {
    const param = new URLSearchParams(window.location.search).get("dir");
    if (param === "rtl" || param === "ltr") {
        write(param);
        return param;
    }
    return read() ?? "ltr";
}

export function applyDirection(dir: Direction) {
    const root = document.documentElement;
    root.dir = dir;
    root.lang = dir === "rtl" ? "ar" : "en";
}
