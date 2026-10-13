export type Direction = "ltr" | "rtl";

// Applied by the i18n layer whenever the language changes.
export function applyDirection(dir: Direction, lang: string) {
    const root = document.documentElement;
    root.dir = dir;
    root.lang = lang;
}
