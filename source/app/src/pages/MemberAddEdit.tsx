import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { X, IdCard, Contact, Share2, ShieldAlert, Save, Camera, User, Check, ChevronDown, Plus } from "lucide-react";
import { uploadMemberPhoto } from "@/lib/firebase";
import { useDataStore } from "@/store/data";
import type { Member } from "@/lib/sheets";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

function isoToDdMmYyyy(iso: string): string {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
}

const inputClass =
    "w-full rounded-ras-lg border border-ras-outline-variant bg-ras-surface-container-low p-3 text-ras-body-md text-ras-on-surface outline-none transition-colors focus:border-ras-secondary focus:ring-1 focus:ring-ras-secondary";

const labelClass = "px-1 text-ras-label-caps text-ras-on-surface-variant";

const errorInputClass = "border-ras-error focus:border-ras-error focus:ring-ras-error";

// Accepts digits with optional leading +, spaces, dashes, parens; requires at least 7 digits.
const PHONE_PATTERN = /^\+?[0-9\s\-()]{7,20}$/;

function isValidPhone(value: string): boolean {
    const digitCount = value.replace(/\D/g, "").length;
    return PHONE_PATTERN.test(value) && digitCount >= 7;
}

interface FormErrors {
    fullName?: string;
    phone?: string;
    whatsapp?: string;
}

function ClassCombobox({
    value,
    onChange,
    classes,
}: {
    value: string;
    onChange: (value: string) => void;
    classes: string[];
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const trimmedSearch = search.trim();
    const exactMatch = classes.some((c) => c.toLowerCase() === trimmedSearch.toLowerCase());
    const showCreateOption = trimmedSearch.length > 0 && !exactMatch;

    const select = (next: string) => {
        onChange(next);
        setSearch("");
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(inputClass, "flex items-center justify-between text-left")}
                >
                    <span className={value ? "" : "text-ras-on-surface-variant"}>
                        {value || "Select or add a class"}
                    </span>
                    <ChevronDown className="size-4 shrink-0 text-ras-on-surface-variant" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Search or add a class..."
                    />
                    <CommandList>
                        <CommandGroup>
                            {classes
                                .filter((c) => c.toLowerCase().includes(trimmedSearch.toLowerCase()))
                                .map((c) => (
                                    <CommandItem key={c} value={c} onSelect={() => select(c)}>
                                        <Check className={cn("size-4", c === value ? "opacity-100" : "opacity-0")} />
                                        {c}
                                    </CommandItem>
                                ))}
                        </CommandGroup>
                        {showCreateOption && (
                            <CommandGroup>
                                <CommandItem value={`__create__${trimmedSearch}`} onSelect={() => select(trimmedSearch)}>
                                    <Plus className="size-4" />
                                    Add "{trimmedSearch}"
                                </CommandItem>
                            </CommandGroup>
                        )}
                        {classes.length === 0 && !showCreateOption && (
                            <CommandEmpty>Type a name to add a class.</CommandEmpty>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export default function MemberAddEdit() {
    const navigate = useNavigate();
    const members = useDataStore((s) => s.members);
    const appendMember = useDataStore((s) => s.appendMember);

    const allGroups = useMemo(
        () => Array.from(new Set(members.map((m) => m.group).filter(Boolean))).sort(),
        [members]
    );

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [fullName, setFullName] = useState("");
    const [group, setGroup] = useState(allGroups[0] ?? "");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [whatsapp, setWhatsapp] = useState("");
    const [instagram, setInstagram] = useState("");
    const [tiktok, setTiktok] = useState("");
    const [parentPhone, setParentPhone] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

    const close = () => navigate("/members");

    const onPhotoSelected = (file: File | null) => {
        setPhotoFile(file);
        setPhotoPreview(file ? URL.createObjectURL(file) : null);
    };

    const validate = (): FormErrors => {
        const errors: FormErrors = {};
        if (!fullName.trim()) {
            errors.fullName = "Full name is required.";
        }
        if (!phone.trim()) {
            errors.phone = "Mobile number is required.";
        } else if (!isValidPhone(phone.trim())) {
            errors.phone = "Enter a valid mobile number (at least 7 digits).";
        }
        if (!whatsapp.trim()) {
            errors.whatsapp = "WhatsApp number is required.";
        } else if (!isValidPhone(whatsapp.trim())) {
            errors.whatsapp = "Enter a valid WhatsApp number (at least 7 digits).";
        }
        return errors;
    };

    const onSave = async () => {
        const errors = validate();
        setFieldErrors(errors);
        if (Object.keys(errors).length > 0) {
            setError("Please fix the highlighted fields.");
            return;
        }
        setError(null);
        setSaving(true);
        try {
            const id = crypto.randomUUID();
            const photoUrl = photoFile ? await uploadMemberPhoto(id, photoFile) : "";
            const member: Member = {
                id,
                full_name: fullName.trim(),
                date_of_birth: isoToDdMmYyyy(dateOfBirth),
                phone,
                parent_phone: parentPhone,
                group,
                active: true,
                notes: "",
                email,
                address,
                whatsapp,
                instagram,
                tiktok,
                photo_url: photoUrl,
            };
            await appendMember(member);
            navigate("/members");
        } catch {
            setError("Could not save member. Check your connection and try again.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex h-full flex-col bg-ras-surface">
            {/* Header */}
            <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b border-ras-outline-variant bg-ras-surface px-ras-edge">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={close}
                        className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-ras-surface-container-high active:opacity-80"
                    >
                        <X className="size-5 text-ras-primary" />
                    </button>
                    <h1 className="text-ras-headline-md font-extrabold text-ras-primary">Add Member</h1>
                </div>
                <span className="rounded-full bg-ras-surface-container-high px-3 py-1 text-ras-label-caps text-ras-on-surface-variant">
                    New Entry
                </span>
            </header>

            <main className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-ras-edge pb-32 pt-ras-section">
                {/* Photo */}
                <section className="mb-10 flex flex-col items-center">
                    <div className="relative">
                        <div className="flex size-32 items-center justify-center overflow-hidden rounded-full border-4 border-ras-surface-container-highest bg-ras-surface-container-low">
                            {photoPreview ? (
                                <img src={photoPreview} alt="" className="size-full object-cover" />
                            ) : (
                                <User className="size-12 text-ras-outline" />
                            )}
                        </div>
                        <label className="absolute bottom-0 right-0 flex size-10 cursor-pointer items-center justify-center rounded-full border-2 border-ras-surface bg-ras-primary text-ras-on-primary shadow-lg transition-transform active:scale-95">
                            <Camera className="size-5" />
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => onPhotoSelected(e.target.files?.[0] ?? null)}
                            />
                        </label>
                    </div>
                    <p className="mt-4 text-ras-label-caps text-ras-on-surface-variant">Upload Member Photo</p>
                </section>

                <div className="space-y-8">
                    {/* Identity Details */}
                    <div className="space-y-4">
                        <h3 className="flex items-center gap-2 border-b border-ras-outline-variant pb-2 text-ras-title-sm text-ras-secondary">
                            <IdCard className="size-4.5" />
                            Identity Details
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="flex flex-col gap-1">
                                <label className={labelClass}>Full Name</label>
                                <input
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="e.g. Samuel Markos"
                                    className={cn(inputClass, fieldErrors.fullName && errorInputClass)}
                                    type="text"
                                />
                                {fieldErrors.fullName && (
                                    <p className="px-1 text-ras-label-caps text-ras-error">{fieldErrors.fullName}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className={labelClass}>Class</label>
                                <ClassCombobox value={group} onChange={setGroup} classes={allGroups} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className={labelClass}>Birthday</label>
                                <input
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                    className={inputClass}
                                    type="date"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Communication */}
                    <div className="space-y-4">
                        <h3 className="flex items-center gap-2 border-b border-ras-outline-variant pb-2 text-ras-title-sm text-ras-secondary">
                            <Contact className="size-4.5" />
                            Communication
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="flex flex-col gap-1">
                                <label className={labelClass}>Mobile Number</label>
                                <input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className={cn(inputClass, fieldErrors.phone && errorInputClass)}
                                    type="tel"
                                />
                                {fieldErrors.phone && (
                                    <p className="px-1 text-ras-label-caps text-ras-error">{fieldErrors.phone}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className={labelClass}>Email Address</label>
                                <input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className={inputClass}
                                    type="email"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className={labelClass}>Home Address</label>
                            <textarea
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="123 Church Way, St. Mary City"
                                rows={2}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    {/* Social Presence */}
                    <div className="space-y-4">
                        <h3 className="flex items-center gap-2 border-b border-ras-outline-variant pb-2 text-ras-title-sm text-ras-secondary">
                            <Share2 className="size-4.5" />
                            Social Presence
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="flex flex-col gap-1">
                                <label className={labelClass}>WhatsApp</label>
                                <input
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                    placeholder="+1 (555) 000-0000"
                                    className={cn(inputClass, fieldErrors.whatsapp && errorInputClass)}
                                    type="tel"
                                />
                                {fieldErrors.whatsapp && (
                                    <p className="px-1 text-ras-label-caps text-ras-error">{fieldErrors.whatsapp}</p>
                                )}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className={labelClass}>Instagram</label>
                                <input
                                    value={instagram}
                                    onChange={(e) => setInstagram(e.target.value)}
                                    placeholder="@handle"
                                    className={inputClass}
                                    type="text"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className={labelClass}>TikTok</label>
                                <input
                                    value={tiktok}
                                    onChange={(e) => setTiktok(e.target.value)}
                                    placeholder="@handle"
                                    className={inputClass}
                                    type="text"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="space-y-4 rounded-ras-xl border border-ras-outline-variant bg-ras-surface-container p-6">
                        <h3 className="flex items-center gap-2 text-ras-title-sm text-ras-primary">
                            <ShieldAlert className="size-4.5" />
                            Emergency Contact
                        </h3>
                        <div className="flex flex-col gap-1">
                            <label className={labelClass}>Emergency Contact Number</label>
                            <input
                                value={parentPhone}
                                onChange={(e) => setParentPhone(e.target.value)}
                                placeholder="+1 (555) 000-0000"
                                className={cn(inputClass, "bg-ras-surface-container-lowest")}
                                type="tel"
                            />
                        </div>
                    </div>
                </div>

                {error && <p className="mt-6 text-ras-body-md text-ras-error">{error}</p>}
            </main>

            {/* Fixed Footer */}
            <div className="fixed bottom-0 left-0 z-50 flex w-full justify-center border-t border-ras-outline-variant bg-ras-surface-container-lowest p-4 shadow-[0px_-4px_20px_rgba(27,43,72,0.08)]">
                <button
                    type="button"
                    disabled={saving}
                    onClick={onSave}
                    className="flex w-full max-w-lg items-center justify-center gap-2 rounded-ras-full bg-ras-primary py-4 text-ras-title-sm text-ras-on-primary transition-all hover:bg-ras-primary-container hover:text-ras-on-primary-container active:scale-[0.98] disabled:opacity-60"
                >
                    <Save className="size-5" />
                    {saving ? "Saving..." : "Save Member"}
                </button>
            </div>
        </div>
    );
}
