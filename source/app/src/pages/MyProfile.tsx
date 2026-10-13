import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { X, ShieldCheck, BarChart3, ChevronRight, LogOut, UserPlus, Check } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useDataStore } from "@/store/data";
import { LANGUAGES, getLanguage } from "@/i18n/languages";
import { cn } from "@/lib/utils";

function initials(name: string | null): string {
    if (!name) return "?";
    return name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
}

const fieldClass =
    "w-full rounded-ras-lg bg-ras-surface-container-low px-4 py-3 text-ras-title-sm text-ras-primary";

const labelClass = "px-1 text-ras-label-caps text-ras-on-surface-variant";

export default function MyProfile() {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation(undefined, { keyPrefix: "profile.me" });
    const activeLanguage = getLanguage(i18n.resolvedLanguage ?? i18n.language).code;
    const admins = useDataStore((s) => s.admins);
    const [user, setUser] = useState<User | null>(auth.currentUser);

    useEffect(() => onAuthStateChanged(auth, setUser), []);

    const photo = user?.photoURL;
    const name = user?.displayName ?? t("defaultName");
    const email = user?.email ?? "";
    const isAdmin = user ? admins.some((a) => a.id === user.uid) : false;

    const comingSoon = (feature: string) =>
        toast.info(t("comingSoon.title"), { description: t("comingSoon.description", { feature }) });

    return (
        <div className="flex h-full flex-col bg-ras-surface">
            {/* Header */}
            <header className="sticky top-0 z-50 flex min-h-16 w-full shrink-0 items-center justify-between border-b border-ras-outline-variant bg-ras-surface px-ras-edge pt-[env(safe-area-inset-top)]">
                <h1 className="text-ras-headline-md font-extrabold text-ras-primary">{t("title")}</h1>
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    aria-label={t("closeAria")}
                    className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-ras-surface-container-high active:opacity-80"
                >
                    <X className="size-5 text-ras-primary" />
                </button>
            </header>

            <main className="mx-auto w-full max-w-xl flex-1 overflow-y-auto px-ras-edge py-8 space-y-8 pb-12">
                {/* Profile Section */}
                <section className="flex flex-col items-center">
                    <div className="size-32 overflow-hidden rounded-ras-xl border-4 border-ras-surface-container-highest shadow-[0px_4px_20px_rgba(27,43,72,0.08)]">
                        {photo ? (
                            <img
                                src={photo}
                                alt={name}
                                referrerPolicy="no-referrer"
                                className="size-full object-cover"
                            />
                        ) : (
                            <div className="flex size-full items-center justify-center bg-ras-primary-container text-ras-headline-md text-ras-secondary-container">
                                {initials(name)}
                            </div>
                        )}
                    </div>

                    <div className="mt-10 w-full space-y-4">
                        <div className="space-y-5 rounded-ras-xl bg-ras-surface-container-lowest p-6 shadow-[0px_4px_20px_rgba(27,43,72,0.08)]">
                            <div className="space-y-1">
                                <label className={labelClass}>{t("fullName")}</label>
                                <p className={fieldClass}>{name}</p>
                            </div>
                            <div className="space-y-1">
                                <label className={labelClass}>{t("email")}</label>
                                <p className={fieldClass}>{email || "—"}</p>
                            </div>
                            <p className="px-1 text-ras-caption text-ras-on-surface-variant">
                                {t("googleNote")}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Administrative Section */}
                <section className="space-y-3">
                    <h2 className="px-1 text-ras-label-caps uppercase tracking-wider text-ras-secondary">
                        {t("administration.title")}
                    </h2>
                    <div className="overflow-hidden rounded-ras-xl bg-ras-surface-container-lowest shadow-[0px_4px_20px_rgba(27,43,72,0.08)]">
                        <button
                            type="button"
                            onClick={() => comingSoon(t("administration.manageAdmins"))}
                            className="flex w-full items-center justify-between border-b border-ras-outline-variant/30 p-ras-list-item transition-colors hover:bg-ras-surface-container-low"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex size-10 items-center justify-center rounded-ras-lg bg-ras-secondary-container text-ras-on-secondary-container">
                                    <ShieldCheck className="size-5" />
                                </div>
                                <span className="text-ras-title-sm text-ras-primary">{t("administration.manageAdmins")}</span>
                            </div>
                            <ChevronRight className="size-5 text-ras-outline rtl:rotate-180" />
                        </button>
                        <button
                            type="button"
                            onClick={() => comingSoon(t("administration.yearlyRollup"))}
                            className="flex w-full items-center justify-between border-b border-ras-outline-variant/30 p-ras-list-item transition-colors hover:bg-ras-surface-container-low"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex size-10 items-center justify-center rounded-ras-lg bg-ras-secondary-container text-ras-on-secondary-container">
                                    <BarChart3 className="size-5" />
                                </div>
                                <span className="text-ras-title-sm text-ras-primary">{t("administration.yearlyRollup")}</span>
                            </div>
                            <ChevronRight className="size-5 text-ras-outline rtl:rotate-180" />
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/assign")}
                            className="flex w-full items-center justify-between p-ras-list-item transition-colors hover:bg-ras-surface-container-low"
                        >
                            <div className="flex items-center gap-4">
                                <div className="flex size-10 items-center justify-center rounded-ras-lg bg-ras-secondary-container text-ras-on-secondary-container">
                                    <UserPlus className="size-5" />
                                </div>
                                <span className="text-ras-title-sm text-ras-primary">{t("administration.assignFollowup")}</span>
                            </div>
                            <ChevronRight className="size-5 text-ras-outline rtl:rotate-180" />
                        </button>
                    </div>
                    {isAdmin && (
                        <p className="px-1 text-ras-caption text-ras-on-surface-variant">
                            {t("signedInAsAdmin")}
                        </p>
                    )}
                </section>

                {/* Language */}
                <section className="space-y-3">
                    <h2 className="px-1 text-ras-label-caps uppercase tracking-wider text-ras-secondary">
                        {t("language.title")}
                    </h2>
                    <div
                        role="radiogroup"
                        aria-label={t("language.title")}
                        className="overflow-hidden rounded-ras-xl bg-ras-surface-container-lowest shadow-[0px_4px_20px_rgba(27,43,72,0.08)]"
                    >
                        {LANGUAGES.map(({ code, name }, index) => {
                            const active = code === activeLanguage;
                            return (
                                <button
                                    key={code}
                                    type="button"
                                    role="radio"
                                    aria-checked={active}
                                    lang={code}
                                    onClick={() => void i18n.changeLanguage(code)}
                                    className={cn(
                                        "flex w-full items-center justify-between p-ras-list-item text-start transition-colors hover:bg-ras-surface-container-low",
                                        index < LANGUAGES.length - 1 && "border-b border-ras-outline-variant/30"
                                    )}
                                >
                                    <span className={cn("text-ras-title-sm", active ? "text-ras-primary" : "text-ras-on-surface")}>
                                        {name}
                                    </span>
                                    {active && <Check className="size-5 text-ras-secondary" />}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Log Out */}
                <section className="pt-4">
                    <button
                        type="button"
                        onClick={() => signOut(auth)}
                        className="flex w-full items-center justify-center gap-2 rounded-ras-xl border-2 border-ras-error py-3 text-ras-title-sm text-ras-error transition-all hover:bg-ras-error-container/20 active:scale-[0.98]"
                    >
                        <LogOut className="size-5" />
                        {t("logOut")}
                    </button>
                    <p className="mt-6 text-center text-ras-caption text-ras-outline">
                        {t("footer")}
                    </p>
                </section>
            </main>
        </div>
    );
}
