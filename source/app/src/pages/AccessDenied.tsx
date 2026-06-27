import { ShieldX } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";

export default function AccessDenied() {
    return (
        <div className="min-h-dvh flex flex-col bg-ras-primary-container text-white font-ras-grotesk antialiased">
            <main className="flex-1 flex items-center justify-center px-ras-edge py-ras-section">
                <div className="w-full max-w-md">
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="size-24 mb-6 rounded-ras-xl overflow-hidden bg-ras-primary border border-ras-on-primary-container/30 flex items-center justify-center">
                            <ShieldX className="size-12 text-ras-error" />
                        </div>
                        <h1 className="text-ras-display-lg text-ras-primary-fixed mb-2">
                            Access Denied
                        </h1>
                        <p className="text-ras-body-md text-ras-inverse-primary max-w-xs">
                            Your Google account doesn't have access to The Sanctuary's records. Ask an admin to share the sheet with this account, then try again.
                        </p>
                    </div>

                    <div className="bg-ras-primary rounded-ras-lg border border-ras-on-primary-container/30 shadow-[0px_8px_32px_rgba(0,0,0,0.3)] p-8">
                        <Button
                            type="button"
                            onClick={() => signOut(auth)}
                            className="w-full h-14 text-ras-title-sm bg-ras-on-primary-container/20 hover:bg-ras-on-primary-container/30 border border-ras-on-primary-container/30 text-white rounded-ras"
                        >
                            Sign in with a different account
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}