import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { DirectionProvider } from "@/components/ui/direction";
import { getLanguage } from "./languages";

// Feeds the active language's direction to Radix primitives.
export function LanguageDirection({ children }: { children: ReactNode }) {
    const { i18n } = useTranslation();
    return (
        <DirectionProvider dir={getLanguage(i18n.resolvedLanguage ?? i18n.language).dir}>
            {children}
        </DirectionProvider>
    );
}
