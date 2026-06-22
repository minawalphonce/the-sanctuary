import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search, SlidersHorizontal, Phone, Plus, Rows3, Layers } from "lucide-react";
import { useDataStore } from "@/store/data";
import type { Member } from "@/lib/sheets";
import { cn } from "@/lib/utils";
import {
    MemberFilterSheet,
    type MemberFilters,
} from "@/components/MemberFilterSheet";

const AVATAR_PALETTE = [
    { bg: "bg-ras-primary-fixed", text: "text-ras-primary" },
    { bg: "bg-ras-secondary-fixed-dim", text: "text-ras-on-secondary-fixed" },
    { bg: "bg-ras-tertiary-fixed", text: "text-ras-tertiary" },
    { bg: "bg-ras-surface-container-highest", text: "text-ras-on-surface" },
];

function initials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
}

function avatarPalette(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % AVATAR_PALETTE.length;
    return AVATAR_PALETTE[hash];
}

const MONTH_ABBR = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function parseDdMmYyyy(value: string): { day: number; month: number; year: number } | null {
    const [d, m, y] = value.split("/").map(Number);
    if (!d || !m || !y) return null;
    return { day: d, month: m, year: y };
}

function formatDayMonth(value: string): string | null {
    const parsed = parseDdMmYyyy(value);
    if (!parsed) return null;
    return `${parsed.day} ${MONTH_ABBR[parsed.month - 1]}`;
}

function calculateAge(value: string): number | null {
    const parsed = parseDdMmYyyy(value);
    if (!parsed) return null;
    const today = new Date();
    let age = today.getFullYear() - parsed.year;
    const hasHadBirthdayThisYear =
        today.getMonth() + 1 > parsed.month ||
        (today.getMonth() + 1 === parsed.month && today.getDate() >= parsed.day);
    if (!hasHadBirthdayThisYear) age--;
    return age;
}

function MemberAvatar({ name, photoUrl }: { name: string; photoUrl?: string }) {
    if (photoUrl) {
        return (
            <img
                src={photoUrl}
                alt={name}
                className="size-12 shrink-0 rounded-full object-cover"
            />
        );
    }

    const palette = avatarPalette(name);
    return (
        <div
            className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-full text-ras-headline-md",
                palette.bg,
                palette.text
            )}
        >
            {initials(name)}
        </div>
    );
}

function MemberRow({ member }: { member: Member }) {
    const dayMonth = formatDayMonth(member.date_of_birth);
    const age = calculateAge(member.date_of_birth);
    const birthdayLabel = dayMonth ? `${dayMonth}${age !== null ? ` • ${age}y` : ""}` : null;

    return (
        <div
            onClick={() => console.log("member tapped", member.id)}
            className="flex h-[72px] cursor-pointer items-center justify-between border-b border-ras-outline-variant bg-ras-surface px-ras-edge transition-colors hover:bg-ras-surface-container-low active:opacity-80"
        >
            <div className="flex items-center gap-4">
                <MemberAvatar name={member.full_name} photoUrl={member.photo_url} />
                <div className="flex flex-col">
                    <span className="text-ras-title-sm text-ras-on-surface">
                        {member.full_name}
                    </span>
                    <span className="text-ras-caption text-ras-on-surface-variant">
                        {[member.group, birthdayLabel].filter(Boolean).join(" • ")}
                    </span>
                </div>
            </div>
            <a
                href={member.phone ? `tel:${member.phone}` : undefined}
                onClick={(e) => e.stopPropagation()}
                aria-disabled={!member.phone}
                className={cn(
                    "flex size-10 items-center justify-center rounded-full border border-ras-outline-variant text-ras-primary transition-all",
                    member.phone
                        ? "hover:bg-ras-primary-container hover:text-ras-on-primary-container"
                        : "pointer-events-none opacity-40"
                )}
            >
                <Phone className="size-5" />
            </a>
        </div>
    );
}

export default function Members() {
    const navigate = useNavigate();
    const members = useDataStore((s) => s.members);
    const [search, setSearch] = useState("");
    const [filterOpen, setFilterOpen] = useState(false);
    const [groupByClass, setGroupByClass] = useState(true);
    const [filters, setFilters] = useState<MemberFilters>({
        groups: [],
        status: "active",
        sort: "name-az",
    });

    const allGroups = useMemo(
        () =>
            Array.from(new Set(members.map((m) => m.group).filter(Boolean))).sort(),
        [members]
    );

    const filtered = useMemo(() => {
        const query = search.trim().toLowerCase();
        return members
            .filter((m) => (filters.status === "active" ? m.active : !m.active))
            .filter((m) => filters.groups.length === 0 || filters.groups.includes(m.group))
            .filter((m) => !query || m.full_name.toLowerCase().includes(query) || m.id.includes(query))
            .sort((a, b) => a.full_name.localeCompare(b.full_name));
    }, [members, search, filters]);

    const grouped = useMemo(() => {
        if (!groupByClass) return null;
        const map = new Map<string, Member[]>();
        for (const m of filtered) {
            const key = m.group || "Ungrouped";
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(m);
        }
        return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    }, [filtered, groupByClass]);

    const activeFilterCount = filters.groups.length + (filters.status === "inactive" ? 1 : 0);

    return (
        <div className="flex h-full flex-col">
            {/* Search & Filter Bar */}
            <div className="sticky top-0 z-40 border-b border-ras-outline-variant bg-ras-background px-ras-edge py-4">
                <div className="flex flex-col gap-ras-stack">
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ras-on-surface-variant" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            type="text"
                            placeholder={`Search ${members.length} members...`}
                            className="h-12 w-full rounded-ras-xl border border-ras-outline-variant bg-ras-surface-container-low pl-11 pr-4 text-ras-body-md outline-none transition-all focus:border-transparent focus:ring-2 focus:ring-ras-primary"
                        />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        <button
                            type="button"
                            onClick={() => setFilterOpen(true)}
                            className="relative flex shrink-0 items-center justify-center rounded-ras-lg bg-ras-surface-container-highest p-2 text-ras-on-surface-variant transition-colors hover:bg-ras-surface-container-high"
                        >
                            <SlidersHorizontal className="size-5" />
                            {activeFilterCount > 0 && (
                                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-ras-secondary text-[10px] font-bold text-ras-on-secondary">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setGroupByClass((v) => !v)}
                            title={groupByClass ? "Show all members" : "Group by class"}
                            className="flex shrink-0 items-center gap-1.5 rounded-ras-full bg-ras-surface-container-highest px-3 py-1.5 text-ras-label-caps text-ras-on-surface-variant transition-colors hover:bg-ras-surface-container-high"
                        >
                            {groupByClass ? <Layers className="size-4" /> : <Rows3 className="size-4" />}
                            {groupByClass ? "Grouped" : "All"}
                        </button>
                        {allGroups.map((group) => {
                            const checked = filters.groups.includes(group);
                            return (
                                <button
                                    key={group}
                                    type="button"
                                    onClick={() =>
                                        setFilters((f) => ({
                                            ...f,
                                            groups: checked
                                                ? f.groups.filter((g) => g !== group)
                                                : [...f.groups, group],
                                        }))
                                    }
                                    className={cn(
                                        "shrink-0 whitespace-nowrap rounded-ras-full px-4 py-1.5 text-ras-label-caps transition-colors",
                                        checked
                                            ? "bg-ras-primary text-ras-on-primary"
                                            : "bg-ras-surface-container-highest text-ras-on-surface-variant hover:bg-ras-surface-container-high"
                                    )}
                                >
                                    {group}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Member List */}
            <div className="flex-1 overflow-y-auto pb-24">
                {filtered.length === 0 && (
                    <div className="flex flex-col items-center gap-2 px-ras-edge py-16 text-center">
                        <span className="text-ras-body-md text-ras-on-surface-variant">
                            No members match your filters.
                        </span>
                    </div>
                )}

                {grouped
                    ? grouped.map(([group, groupMembers]) => (
                          <div key={group}>
                              <div className="sticky top-0 z-30 bg-ras-surface-container-low px-ras-edge py-2">
                                  <span className="text-ras-label-caps text-ras-secondary">
                                      {group.toUpperCase()}
                                  </span>
                              </div>
                              {groupMembers.map((m) => (
                                  <MemberRow key={m.id} member={m} />
                              ))}
                          </div>
                      ))
                    : filtered.map((m) => <MemberRow key={m.id} member={m} />)}
            </div>

            {/* FAB for adding member */}
            <button
                type="button"
                onClick={() => navigate("/members/add")}
                className="fixed bottom-24 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-ras-primary text-ras-on-primary shadow-[0px_4px_20px_rgba(27,43,72,0.2)] transition-transform active:scale-95"
            >
                <Plus className="size-6" />
            </button>

            <MemberFilterSheet
                open={filterOpen}
                onOpenChange={setFilterOpen}
                allGroups={allGroups}
                filters={filters}
                onApply={setFilters}
            />
        </div>
    );
}
