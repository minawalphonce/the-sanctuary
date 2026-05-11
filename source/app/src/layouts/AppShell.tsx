import { Outlet, NavLink, useLocation } from "react-router";
import {
    LayoutDashboard,
    CheckSquare,
    Users,
    MessageCircle,
} from "lucide-react";
import DataSync from "@/components/DataSync";
import { UserAvatar } from "@/components/UserAvatar";
import logo from "@/assets/logo.png";

const tabs = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/attendance", icon: CheckSquare, label: "Attendance" },
    { path: "/members", icon: Users, label: "Members" },
    { path: "/followup", icon: MessageCircle, label: "Follow-up" },
];

const pageTitles: Record<string, string> = {
    "/": "Dashboard",
    "/attendance": "Attendance",
    "/members": "Members",
    "/followup": "Follow-up",
};

export function AppShell() {
    const { pathname } = useLocation();
    const title = pageTitles[pathname] ?? "The Sanctuary";

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-ras-background">
            <DataSync />

            {/* Top Bar */}
            <header className="shrink-0 relative flex items-center px-ras-edge h-16 bg-ras-surface border-b border-ras-outline-variant">
                <div className="flex items-center gap-3">
                    <img src={logo} alt="The Sanctuary" className="w-16 h-16 object-contain" />
                </div>
                <span className="absolute left-1/2 -translate-x-1/2 text-ras-label-caps text-ras-on-surface-variant">
                    {title}
                </span>
                <div className="ml-auto">
                    <UserAvatar />
                </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="shrink-0 flex h-ras-bottom-nav bg-ras-surface border-t border-ras-outline-variant shadow-[0_-4px_20px_rgba(27,43,72,0.08)] pb-[env(safe-area-inset-bottom)]">
                {tabs.map(({ path, icon: Icon, label }) => {
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
                            <span className="text-ras-label-caps text-[10px]">{label}</span>
                        </NavLink>
                    );
                })}
            </nav>
        </div>
    );
}

export default AppShell;
