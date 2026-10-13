export const LANGUAGES = [
    { code: "en", name: "English", dir: "ltr", intlLocale: "en" },
    { code: "sv", name: "Svenska", dir: "ltr", intlLocale: "sv" },
    { code: "ar", name: "العربية", dir: "rtl", intlLocale: "ar-EG" },
    { code: "it", name: "Italiano", dir: "ltr", intlLocale: "it" },
    { code: "de", name: "Deutsch", dir: "ltr", intlLocale: "de" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];

export const DEFAULT_LANGUAGE: LanguageCode = "en";

export function getLanguage(code: string | undefined) {
    return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}
