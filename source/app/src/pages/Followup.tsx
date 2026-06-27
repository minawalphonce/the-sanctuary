import { MessageCircle } from "lucide-react";

export default function Followup() {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-ras-edge text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-ras-secondary-container text-ras-on-secondary-container">
                <MessageCircle className="size-6" />
            </div>
            <span className="text-ras-headline-md text-ras-primary">Coming soon</span>
            <span className="text-ras-body-md text-ras-on-surface-variant">
                Follow-up reports aren't available yet.
            </span>
        </div>
    );
}
