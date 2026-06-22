import logo from "@/assets/logo.png";

export default function Splash() {
    return (
        <div className="h-dvh flex flex-col items-center justify-center p-ras-edge overflow-hidden bg-ras-primary-container">
            <main className="flex-1 flex flex-col items-center justify-center gap-ras-stack">
                <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                    <div className="absolute inset-0 bg-ras-secondary/10 blur-3xl rounded-full" />
                    <div className="relative flex items-center justify-center w-full h-full rounded-full p-2 bg-linear-to-br from-ras-primary-container/60 to-ras-primary-container/20 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-sm">
                        <img
                            src={logo}
                            alt="The Sanctuary Logo"
                            className="w-full h-full object-contain drop-shadow-2xl"
                        />
                    </div>
                </div>

                <div className="text-center">
                    <h1 className="text-ras-display-lg text-ras-on-primary tracking-tight">
                        The Sanctuary
                    </h1>
                    <div className="w-12 h-1 bg-ras-secondary mx-auto mt-4 rounded-full" />
                </div>
            </main>

            <footer className="pb-12 text-center">
                <p className="text-ras-label-caps text-ras-on-primary-container tracking-[0.2em] opacity-80">
                    Empowering Youth, Strengthening Community
                </p>
            </footer>
        </div>
    );
}
