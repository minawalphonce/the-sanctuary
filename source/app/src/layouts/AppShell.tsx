import { Outlet, NavLink, useLocation, useNavigate } from "react-router";
import {
    LayoutDashboard,
    CheckSquare,
    Users,
    MessageCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import DataSync from "@/components/DataSync";
import { UserAvatar } from "@/components/UserAvatar";

// `key` is the translation key under app.shell.tabs.
const tabs = [
    { path: "/", icon: LayoutDashboard, key: "dashboard" },
    { path: "/attendance", icon: CheckSquare, key: "attendance" },
    { path: "/members", icon: Users, key: "members" },
    { path: "/followup", icon: MessageCircle, key: "followup" },
];

export function AppShell() {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation(undefined, { keyPrefix: "app.shell" });
    const activeTab = tabs.find(({ path }) => path === pathname);
    const title = activeTab ? t(`tabs.${activeTab.key}`) : t("appName");

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-ras-background">
            {/* Top Bar */}
            <header className="shrink-0 bg-ras-primary pt-[env(safe-area-inset-top)]">
                <div className="flex items-center justify-between gap-3 px-ras-edge h-14">
                    <span className="text-ras-headline-md text-ras-on-primary">
                        {title}
                    </span>
                    <button
                        type="button"
                        onClick={() => navigate("/profile")}
                        aria-label={t("profileAria")}
                        className="rounded-full transition-opacity active:opacity-80"
                    >
                        <UserAvatar />
                    </button>
                </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="shrink-0 flex min-h-ras-bottom-nav bg-ras-surface border-t border-ras-outline-variant shadow-[0_-4px_20px_rgba(27,43,72,0.08)] pb-[env(safe-area-inset-bottom)]">
                {tabs.map(({ path, icon: Icon, key }) => {
                    const isActive = path === "/" ? pathname === "/" : pathname.startsWith(path);

                    return (
                        <NavLink
                            key={path}
                            to={path}
                            className={[
                                "flex flex-1 flex-col items-center justify-center gap-0.5 pt-1 transition-colors",
                                isActive
                                    ? "text-ras-primary border-t-2 border-ras-secondary"
                                    : "text-ras-on-surface-variant",
                            ].join(" ")}
                        >
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                            <span className="text-ras-label-caps text-[10px]">{t(`tabs.${key}`)}</span>
                        </NavLink>
                    );
                })}
            </nav>
            <DataSync />
        </div>
    );
}

export default AppShell;
