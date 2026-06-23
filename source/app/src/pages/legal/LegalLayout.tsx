import type { ReactNode } from "react";
import logo from "@/assets/logo.png";

export default function LegalLayout({
    title,
    lastUpdated,
    children,
}: {
    title: string;
    lastUpdated: string;
    children: ReactNode;
}) {
    return (
        <div className="min-h-dvh bg-ras-surface">
            <header className="bg-ras-primary px-ras-edge py-6">
                <div className="mx-auto max-w-2xl flex items-center gap-3">
                    <img src={logo} alt="The Sanctuary" className="w-10 h-10 rounded-full" />
                    <div>
                        <p className="text-ras-label-caps text-ras-on-primary-container tracking-[0.1em]">
                            The Sanctuary
                        </p>
                        <h1 className="text-ras-headline-md text-ras-on-primary">{title}</h1>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-2xl px-ras-edge py-ras-section">
                <p className="text-ras-caption text-ras-on-surface-variant mb-ras-section">
                    Last updated: {lastUpdated}
                </p>
                <div className="space-y-ras-section text-ras-body-md text-ras-on-surface [&_h2]:text-ras-title-sm [&_h2]:text-ras-on-surface [&_h2]:mb-ras-stack [&_p]:mb-ras-stack [&_li]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-ras-secondary [&_a]:underline">
                    {children}
                </div>
            </main>

            <footer className="px-ras-edge py-ras-section text-center">
                <p className="text-ras-caption text-ras-on-surface-variant">
                    &copy; {new Date().getFullYear()} Koptisk Ortodoxa Kyrkan S:t Mina Församling
                </p>
            </footer>
        </div>
    );
}
