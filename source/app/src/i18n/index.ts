import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { applyDirection } from "@/lib/direction";
import { DEFAULT_LANGUAGE, LANGUAGES, getLanguage } from "./languages";
import en from "./locales/en.json";
import sv from "./locales/sv.json";
import ar from "./locales/ar.json";
import it from "./locales/it.json";
import de from "./locales/de.json";

export const LANGUAGE_STORAGE_KEY = "sanctuary.lang";

void i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            sv: { translation: sv },
            ar: { translation: ar },
            it: { translation: it },
            de: { translation: de },
        },
        supportedLngs: LANGUAGES.map((l) => l.code),
        fallbackLng: DEFAULT_LANGUAGE,
        nonExplicitSupportedLngs: true,
        load: "languageOnly",
        interpolation: { escapeValue: false },
        detection: {
            // `?lng=ar` is handy for testing; the choice is then remembered.
            order: ["querystring", "localStorage", "navigator"],
            lookupQuerystring: "lng",
            lookupLocalStorage: LANGUAGE_STORAGE_KEY,
            caches: ["localStorage"],
        },
    });

// Keep <html lang/dir> in sync with the active language.
const sync = (lng: string) => applyDirection(getLanguage(lng).dir, getLanguage(lng).code);
sync(i18n.resolvedLanguage ?? i18n.language);
i18n.on("languageChanged", sync);

export default i18n;
