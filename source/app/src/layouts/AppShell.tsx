import { Outlet, NavLink, useLocation } from "react-router";
import DataSync from "@/components/DataSync";

const tabs = [
    { path: "/", icon: "dashboard", label: "Dashboard" },
    { path: "/attendance", icon: "fact_check", label: "Attendance" },
    { path: "/members", icon: "group", label: "Members" },
    { path: "/followup", icon: "assignment_turned_in", label: "Follow-up" },
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
        <div className="flex flex-col h-dvh max-w-full overflow-x-hidden bg-ras-surface">
            <DataSync />

            {/* Top Bar */}
            <header className="flex items-center justify-between px-ras-edge h-16 border-b border-ras-outline-variant bg-ras-surface shrink-0 sticky top-0 z-50">
                <span className="text-ras-headline-md text-ras-primary">
                    The Sanctuary
                </span>
                <span className="text-ras-body-md font-semibold text-ras-on-surface">
                    {title}
                </span>
                {/* Reserved for future actions */}
                <div className="w-10" />
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <nav className="shrink-0 bg-ras-surface border-t border-ras-outline-variant shadow-[0px_-4px_20px_rgba(27,43,72,0.08)] pb-safe">
                <div className="flex justify-around items-stretch px-2 h-[4.5rem]">
                    {tabs.map(({ path, icon, label }) => {
                        // exact match for "/" to avoid highlighting Dashboard on all routes
                        const isActive =
                            path === "/" ? pathname === "/" : pathname.startsWith(path);

                        return (
                            <NavLink
                                key={path}
                                to={path}
                                className={`flex flex-1 flex-col items-center justify-center gap-0.5 pt-1 transition-colors active:scale-95 duration-150 border-t-2 ${
                                    isActive
                                        ? "text-ras-primary border-ras-secondary"
                                        : "text-ras-on-surface-variant border-transparent"
                                }`}
                            >
                                <span
                                    className="material-symbols-outlined text-[24px] leading-none"
                                    aria-hidden="true"
                                >
                                    {icon}
                                </span>
                                <span className="text-ras-label-caps">
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