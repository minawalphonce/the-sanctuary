import { useOutletContext } from "react-router";
import { toast } from "sonner";
import { Phone, MessageSquareText, Eye, Camera } from "lucide-react";
import type { Member } from "@/lib/sheets";
import { whatsappHref } from "@/lib/member";

async function copyToClipboard(value: string, label: string) {
    try {
        await navigator.clipboard.writeText(value);
        toast.success(`${label} copied`);
    } catch {
        toast.error(`Could not copy ${label.toLowerCase()}`);
    }
}

export default function MemberContact() {
    const { member } = useOutletContext<{ member: Member }>();

    const rows: { label: string; value: string; action: React.ReactNode }[] = [];

    if (member.email) {
        rows.push({
            label: "Email Address",
            value: member.email,
            action: (
                <button
                    type="button"
                    onClick={() => copyToClipboard(member.email, "Email")}
                    className="rounded-ras-lg border border-ras-outline-variant bg-ras-surface-container-high px-4 py-2 text-ras-label-caps transition-colors hover:bg-ras-surface-container-highest"
                >
                    Copy Email
                </button>
            ),
        });
    }

    if (member.whatsapp) {
        const href = whatsappHref(member.whatsapp);
        rows.push({
            label: "WhatsApp",
            value: member.whatsapp,
            action: href ? (
                <a
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-ras-lg border border-ras-outline-variant bg-ras-surface-container-high px-4 py-2 text-ras-label-caps transition-colors hover:bg-ras-surface-container-highest"
                >
                    <MessageSquareText className="size-[18px]" />
                    Chat
                </a>
            ) : null,
        });
    }

    if (member.tiktok) {
        rows.push({
            label: "TikTok",
            value: member.tiktok,
            action: (
                <a
                    href={`https://www.tiktok.com/@${member.tiktok.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-ras-lg border border-ras-outline-variant bg-ras-surface-container-high px-4 py-2 text-ras-label-caps transition-colors hover:bg-ras-surface-container-highest"
                >
                    <Eye className="size-[18px]" />
                    View
                </a>
            ),
        });
    }

    if (member.instagram) {
        rows.push({
            label: "Instagram",
            value: member.instagram,
            action: (
                <a
                    href={`https://www.instagram.com/${member.instagram.replace(/^@/, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 rounded-ras-lg border border-ras-outline-variant bg-ras-surface-container-high px-4 py-2 text-ras-label-caps transition-colors hover:bg-ras-surface-container-highest"
                >
                    <Camera className="size-[18px]" />
                    View
                </a>
            ),
        });
    }

    if (member.address) {
        rows.push({
            label: "Home Address",
            value: member.address,
            action: (
                <button
                    type="button"
                    onClick={() => copyToClipboard(member.address, "Address")}
                    className="rounded-ras-lg border border-ras-outline-variant bg-ras-surface-container-high px-4 py-2 text-ras-label-caps transition-colors hover:bg-ras-surface-container-highest"
                >
                    Copy Address
                </button>
            ),
        });
    }

    return (
        <section className="space-y-4">
            <h3 className="px-1 text-ras-title-sm text-ras-primary">Contact Details</h3>

            <div className="space-y-4">
                {member.phone && (
                    <div className="rounded-ras-2xl bg-ras-primary-container p-5 text-ras-on-primary-container">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="mb-1 text-ras-label-caps opacity-70">Mobile Number</p>
                                <p className="text-ras-headline-md">{member.phone}</p>
                            </div>
                            <div className="flex gap-2">
                                <a
                                    href={`tel:${member.phone}`}
                                    className="flex size-12 items-center justify-center rounded-full bg-ras-on-primary-container text-ras-primary-container transition-opacity hover:opacity-90"
                                >
                                    <Phone className="size-5" />
                                </a>
                                <a
                                    href={`sms:${member.phone}`}
                                    className="flex size-12 items-center justify-center rounded-full bg-ras-on-primary-container text-ras-primary-container transition-opacity hover:opacity-90"
                                >
                                    <MessageSquareText className="size-5" />
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {rows.length > 0 && (
                    <div className="divide-y divide-ras-outline-variant/30 rounded-ras-2xl border border-ras-outline-variant/30 bg-ras-surface-container-low/50">
                        {rows.map((row) => (
                            <div key={row.label} className="flex items-center justify-between p-4">
                                <div>
                                    <p className="mb-1 text-ras-label-caps text-ras-on-surface-variant">{row.label}</p>
                                    <p className="text-ras-body-md">{row.value}</p>
                                </div>
                                {row.action}
                            </div>
                        ))}
                    </div>
                )}

                {member.parent_phone && (
                    <div className="space-y-3 rounded-ras-xl border border-ras-outline-variant/30 bg-ras-surface-container-low p-4">
                        <h4 className="text-ras-label-caps text-ras-on-surface-variant">Emergency Contact</h4>
                        <div className="flex items-center justify-between">
                            <p className="text-ras-body-md text-ras-on-surface-variant">{member.parent_phone}</p>
                            <a
                                href={`tel:${member.parent_phone}`}
                                className="flex size-10 items-center justify-center rounded-full border border-ras-outline-variant text-ras-on-surface-variant transition-colors hover:bg-ras-surface-container-highest"
                            >
                                <Phone className="size-4" />
                            </a>
                        </div>
                    </div>
                )}

                {rows.length === 0 && !member.phone && !member.parent_phone && (
                    <p className="px-1 text-ras-body-md text-ras-on-surface-variant">No contact details on file.</p>
                )}
            </div>
        </section>
    );
}
