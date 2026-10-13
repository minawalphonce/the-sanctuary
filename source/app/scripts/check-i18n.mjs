// Fails if any locale's keys differ from en.json (plural suffixes are
// ignored, since languages differ in how many forms they need), or if a
// plural key has no `_other` form, or a locale has an empty value.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dir = join(dirname(fileURLToPath(import.meta.url)), "../src/i18n/locales");
const LOCALES = ["en", "sv", "ar", "it", "de"];
const PLURAL = /_(zero|one|two|few|many|other)$/;

function flatten(obj, prefix = "") {
    return Object.entries(obj).flatMap(([k, v]) =>
        v && typeof v === "object" ? flatten(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]
    );
}

const load = (l) => flatten(JSON.parse(readFileSync(join(dir, `${l}.json`), "utf8")));
const baseKeys = (entries) => new Set(entries.map(([k]) => k.replace(PLURAL, "")));

const en = load("en");
const enKeys = baseKeys(en);
let errors = 0;

for (const locale of LOCALES) {
    const entries = load(locale);
    const keys = baseKeys(entries);
    for (const k of enKeys) if (!keys.has(k)) (errors++, console.error(`[${locale}] missing: ${k}`));
    for (const k of keys) if (!enKeys.has(k)) (errors++, console.error(`[${locale}] extra: ${k}`));
    for (const [k, v] of entries) if (v === "") (errors++, console.error(`[${locale}] empty: ${k}`));
    const names = new Set(entries.map(([k]) => k));
    for (const [k] of entries) {
        if (PLURAL.test(k) && !names.has(k.replace(PLURAL, "_other"))) {
            errors++;
            console.error(`[${locale}] plural without _other: ${k}`);
        }
    }
}

if (errors) {
    console.error(`\ni18n check failed with ${errors} problem(s).`);
    process.exit(1);
}
console.log(`i18n check passed (${enKeys.size} keys × ${LOCALES.length} locales).`);
