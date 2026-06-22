import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { setGoogleAccessToken, getGoogleAccessTokenFromResult } from "@/lib/sheets";
import { Button } from "@/components/ui/button";

export default function Login() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleGoogleSignIn() {
        setError(null);
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const accessToken = getGoogleAccessTokenFromResult(result);
            if (accessToken) setGoogleAccessToken(accessToken);
            // App.tsx's onAuthStateChanged listener picks up the signed-in user and navigates.
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Google sign in failed.";
            setError(friendlyError(msg));
            setLoading(false);
        }
    }

    return (
        <div className="min-h-dvh flex flex-col bg-ras-primary-container text-white font-ras-grotesk antialiased">
            <main className="flex-1 flex items-center justify-center px-ras-edge py-ras-section">
                <div className="w-full max-w-md">

                    {/* Logo + heading */}
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="size-24 mb-6 rounded-ras-xl overflow-hidden bg-ras-primary border border-ras-on-primary-container/30 flex items-center justify-center">
                            <img
                                src="/logo.png"
                                alt="The Sanctuary Logo"
                                className="size-16 object-contain"
                                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                            />
                        </div>
                        <h1 className="text-ras-display-lg text-ras-primary-fixed mb-2">
                            The Sanctuary
                        </h1>
                        <p className="text-ras-body-md text-ras-inverse-primary max-w-xs">
                            Admin access for managing member attendance and spiritual follow-up.
                        </p>
                    </div>

                    {/* Card */}
                    <div className="bg-ras-primary rounded-ras-lg border border-ras-on-primary-container/30 shadow-[0px_8px_32px_rgba(0,0,0,0.3)] p-8">

                        {error && (
                            <div className="mb-6 px-4 py-3 bg-ras-error-container text-ras-on-error-container rounded-ras text-sm leading-5">
                                {error}
                            </div>
                        )}

                        <Button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={loading}
                            className="w-full h-14 text-ras-title-sm bg-ras-on-primary-container/20 hover:bg-ras-on-primary-container/30 border border-ras-on-primary-container/30 text-white rounded-ras"
                        >
                            {loading ? (
                                <span>Signing in…</span>
                            ) : (
                                <>
                                    <GoogleIcon />
                                    <span>Sign in with Google</span>
                                </>
                            )}
                        </Button>
                    </div>

                </div>
            </main>
        </div>
    );
}

function GoogleIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );
}

function friendlyError(msg: string): string {
    if (msg.includes("network-request-failed")) {
        return "Network error. Check your connection and try again.";
    }
    if (msg.includes("unauthorized-domain")) {
        return "This domain isn't authorized for Google sign-in.";
    }
    if (msg.includes("popup-closed-by-user") || msg.includes("cancelled-popup-request")) {
        return "Sign-in popup was closed before completing. Please try again.";
    }
    if (msg.includes("popup-blocked")) {
        return "Your browser blocked the sign-in popup. Please allow popups for this site and try again.";
    }
    return "Sign in failed. Please try again.";
}
