import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Search, SlidersHorizontal, Phone, MessageCircle, Plus, Rows3, Layers, UserX } from "lucide-react";
import { useDataStore } from "@/store/data";
import type { Admin, Member } from "@/lib/sheets";
import { cn } from "@/lib/utils";
import { memberCaption, whatsappHref } from "@/lib/member";
import { currentAssignmentsByMember } from "@/lib/assignments";
import { MemberAvatar } from "@/components/MemberAvatar";
import { AssigneeIndicator } from "@/components/AssigneeIndicator";
import { FilterChip } from "@/components/FilterChip";
import {
    MemberFilterSheet,
    type MemberFilters,
} from "@/components/MemberFilterSheet";

function MemberRow({ member, admin }: { member: Member; admin: Admin | null }) {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/members/${member.id}`)}
            className={cn(
                "flex h-[72px] cursor-pointer items-center justify-between border-b border-ras-outline-variant bg-ras-surface px-ras-edge transition-colors hover:bg-ras-surface-container-low active:opacity-80",
                !member.active && "opacity-50"
            )}
        >
            <div className="flex min-w-0 items-center gap-4">
                <MemberAvatar name={member.full_name} photoUrl={member.photo_url} />
                <div className="flex min-w-0 flex-col">
                    <span className="flex min-w-0 items-center gap-2 text-ras-title-sm text-ras-on-surface">
                        <span
                            aria-label={member.active ? "Active" : "Inactive"}
                            title={member.active ? "Active" : "Inactive"}
                            className={cn(
                                "size-2 shrink-0 rounded-full",
                                member.active ? "bg-ras-tertiary" : "bg-ras-on-surface-variant"
                            )}
                        />
                        <span className="truncate">{member.full_name}</span>
                    </span>
                    <span className="flex min-w-0 items-center gap-1.5 text-ras-caption text-ras-on-surface-variant">
                        {member.active && <AssigneeIndicator admin={admin} />}
                        <span className="min-w-0 truncate">
                            {memberCaption(member)}
                        </span>
                    </span>
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
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
                <a
                    href={member.phone ? whatsappHref(member.phone) ?? undefined : undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    aria-disabled={!member.phone}
                    className={cn(
                        "flex size-10 items-center justify-center rounded-full border border-ras-outline-variant text-ras-primary transition-all",
                        member.phone
                            ? "hover:bg-ras-primary-container hover:text-ras-on-primary-container"
                            : "pointer-events-none opacity-40"
                    )}
                >
                    <MessageCircle className="size-5" />
                </a>
            </div>
        </div>
    );
}

export default function Members() {
    const navigate = useNavigate();
    const members = useDataStore((s) => s.members);
    const admins = useDataStore((s) => s.admins);
    const assignments = useDataStore((s) => s.assignments);
    const [search, setSearch] = useState("");
    const [filterOpen, setFilterOpen] = useState(false);
    const [groupByClass, setGroupByClass] = useState(true);
    const [filters, setFilters] = useState<MemberFilters>({
        groups: [],
        status: "active",
        sort: "name-az",
        unassignedOnly: false,
    });

    // member_id → current admin (null when unassigned or the admin isn't in the directory).
    const adminByMember = useMemo(() => {
        const adminsById = new Map(admins.map((a) => [a.id, a]));
        const map = new Map<string, Admin | null>();
        for (const [memberId, a] of currentAssignmentsByMember(assignments)) {
            map.set(memberId, adminsById.get(a.admin_id) ?? null);
        }
        return map;
    }, [admins, assignments]);

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
            .filter((m) => !filters.unassignedOnly || (m.active && !adminByMember.get(m.id)))
            .filter((m) => !query || m.full_name.toLowerCase().includes(query) || m.id.includes(query))
            .sort((a, b) => a.full_name.localeCompare(b.full_name));
    }, [members, search, filters, adminByMember]);

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

    const activeFilterCount =
        filters.groups.length + (filters.status === "inactive" ? 1 : 0) + (filters.unassignedOnly ? 1 : 0);

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
                        <FilterChip
                            onClick={() => setGroupByClass((v) => !v)}
                            title={groupByClass ? "Show all members" : "Group by class"}
                            aria-pressed={undefined}
                        >
                            {groupByClass ? <Layers /> : <Rows3 />}
                            {groupByClass ? "Grouped" : "All"}
                        </FilterChip>
                        <FilterChip
                            active={filters.unassignedOnly}
                            onClick={() => setFilters((f) => ({ ...f, unassignedOnly: !f.unassignedOnly }))}
                        >
                            <UserX />
                            Unassigned
                        </FilterChip>
                        {allGroups.map((group) => {
                            const checked = filters.groups.includes(group);
                            return (
                                <FilterChip
                                    key={group}
                                    active={checked}
                                    onClick={() =>
                                        setFilters((f) => ({
                                            ...f,
                                            groups: checked
                                                ? f.groups.filter((g) => g !== group)
                                                : [...f.groups, group],
                                        }))
                                    }
                                >
                                    {group}
                                </FilterChip>
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
                              <div className="sticky top-0 z-30 flex items-center justify-between bg-ras-surface-container-low px-ras-edge py-2">
                                  <span className="text-ras-label-caps text-ras-secondary">
                                      {group.toUpperCase()}
                                  </span>
                                  <span className="text-ras-label-caps text-ras-on-surface-variant">
                                      {groupMembers.length}
                                  </span>
                              </div>
                              {groupMembers.map((m) => (
                                  <MemberRow key={m.id} member={m} admin={adminByMember.get(m.id) ?? null} />
                              ))}
                          </div>
                      ))
                    : filtered.map((m) => (
                          <MemberRow key={m.id} member={m} admin={adminByMember.get(m.id) ?? null} />
                      ))}
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
