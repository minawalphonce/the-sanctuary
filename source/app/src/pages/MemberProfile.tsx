import { useMemo } from "react";
import { NavLink, Outlet, useNavigate, useParams } from "react-router";
import { X, Pencil, Cake } from "lucide-react";
import { useDataStore } from "@/store/data";
import { initials, avatarPalette, formatDayMonth, calculateAge } from "@/lib/member";
import { cn } from "@/lib/utils";

const tabs = [
    { path: "overview", label: "Overview" },
    { path: "history", label: "History" },
    { path: "contact", label: "Contact" },
];

export default function MemberProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const members = useDataStore((s) => s.members);
    const member = useMemo(() => members.find((m) => m.id === id), [members, id]);

    if (!member) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-4 bg-ras-surface p-ras-edge text-center">
                <p className="text-ras-body-md text-ras-on-surface-variant">Member not found.</p>
                <button
                    type="button"
                    onClick={() => navigate("/members")}
                    className="rounded-ras-full bg-ras-primary px-6 py-2 text-ras-label-caps text-ras-on-primary"
                >
                    Back to Members
                </button>
            </div>
        );
    }

    const birthday = formatDayMonth(member.date_of_birth);
    const age = calculateAge(member.date_of_birth);
    const palette = avatarPalette(member.full_name);

    return (
        <div className="flex h-full flex-col bg-ras-surface-container-lowest">
            {/* Header */}
            <header className="relative shrink-0 bg-ras-primary px-ras-edge pb-8 pt-12 text-ras-on-primary">
                <button
                    type="button"
                    onClick={() => navigate("/members")}
                    className="absolute left-4 top-4 flex size-10 items-center justify-center rounded-full transition-colors hover:bg-white/10 active:opacity-80"
                >
                    <X className="size-6" />
                </button>
                <button
                    type="button"
                    onClick={() => navigate(`/members/${member.id}/edit`)}
                    className="absolute right-4 top-4 flex items-center gap-2 rounded-ras-full bg-ras-secondary px-4 py-1.5 text-ras-label-caps text-ras-on-secondary transition-transform hover:scale-105 active:scale-95"
                >
                    <Pencil className="size-4" />
                    Edit
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="mb-4 size-24 rounded-full border-4 border-ras-secondary-fixed-dim p-1">
                        {member.photo_url ? (
                            <img
                                src={member.photo_url}
                                alt={member.full_name}
                                className="size-full rounded-full object-cover"
                            />
                        ) : (
                            <div
                                className={cn(
                                    "flex size-full items-center justify-center rounded-full text-ras-headline-md",
                                    palette.bg,
                                    palette.text
                                )}
                            >
                                {initials(member.full_name)}
                            </div>
                        )}
                    </div>
                    <h1 className="text-ras-display-lg">{member.full_name}</h1>
                    {birthday && (
                        <p className="mb-3 flex items-center justify-center gap-1 text-ras-secondary-fixed-dim">
                            <Cake className="size-[18px]" />
                            Birthday: {birthday}
                            {age !== null && ` (${age})`}
                        </p>
                    )}
                    {member.group && (
                        <span className="inline-flex items-center gap-1 rounded-ras-full bg-ras-secondary px-3 py-1 text-ras-label-caps text-ras-on-secondary">
                            {member.group}
                        </span>
                    )}
                </div>
            </header>

            {/* Tab Bar */}
            <nav className="sticky top-0 z-10 flex shrink-0 border-b border-ras-outline-variant bg-ras-surface-container-lowest px-ras-edge">
                {tabs.map((tab) => (
                    <NavLink
                        key={tab.path}
                        to={`/members/${member.id}/${tab.path}`}
                        className={({ isActive }) =>
                            cn(
                                "flex-1 py-4 text-center text-ras-label-caps transition-colors",
                                isActive
                                    ? "border-b-2 border-ras-primary text-ras-primary"
                                    : "text-ras-on-surface-variant hover:text-ras-primary"
                            )
                        }
                    >
                        {tab.label}
                    </NavLink>
                ))}
            </nav>

            {/* Tab Content */}
            <main className="flex-1 overflow-y-auto p-ras-edge pb-12">
                <Outlet context={{ member }} />
            </main>
        </div>
    );
}
