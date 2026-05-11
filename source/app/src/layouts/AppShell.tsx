import { Outlet, NavLink, useLocation } from "react-router";
import {
    LayoutDashboard,
    CheckSquare,
    Users,
    MessageCircle,
} from "lucide-react";
import DataSync from "@/components/DataSync";

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
    const title = pageTitles[pathname] ?? "App";

    return (
        <div className="flex flex-col h-screen bg-background">
            <DataSync />
            {/* Top Bar */}
            <header className="flex items-center justify-between px-4 h-14 border-b bg-background shrink-0">
                <span className="text-sm font-medium text-muted-foreground">
                    Youth Admin
                </span>
                <span className="text-base font-semibold">{title}</span>
                {/* Right side reserved for future actions (e.g. avatar, notifications) */}
                <div className="w-16" />
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="shrink-0 border-t bg-background pb-safe">
                <div className="flex">
                    {tabs.map(({ path, icon: Icon, label }) => {
                        // exact match for "/" to avoid highlighting Dashboard on all routes
                        const isActive =
                            path === "/" ? pathname === "/" : pathname.startsWith(path);

                        return (
                            <NavLink
                                key={path}
                                to={path}
                                className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-muted-foreground transition-colors"
                            >
                                <Icon
                                    size={22}
                                    className={isActive ? "text-primary" : "text-muted-foreground"}
                                    strokeWidth={isActive ? 2.5 : 1.8}
                                />
                                <span
                                    className={`text-[10px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"
                                        }`}
                                >
                                    {label}
                                </span>
                            </NavLink>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
}


export default AppShell;