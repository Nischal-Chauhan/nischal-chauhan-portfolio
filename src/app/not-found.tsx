import type { Metadata } from "next";
import CreativeButton from "@/components/CreativeButton";

export const metadata: Metadata = {
    title: "Page Not Found (404)",
    description:
        "The page you are looking for does not exist. Return to the homepage or explore Nischal Chauhan's work and services.",
};

export default function NotFound() {
    return (
        <div className="relative flex min-h-dvh flex-col">
            <main className="flex-1 px-6 md:px-16 pt-40 pb-20 max-w-[1440px] mx-auto w-full">
                <div className="mb-16">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-8 font-bold">
                        Error 404
                    </p>
                    <h1 className="text-[24vw] md:text-[16vw] font-display font-medium leading-[0.85] tracking-tighter uppercase mb-12">
                        Page <br />
                        Not Found
                    </h1>
                    <p className="font-sans text-lg md:text-xl max-w-xl text-slate-700 leading-relaxed">
                        The page you are looking for does not exist or may have moved.
                    </p>
                </div>
                <div className="flex flex-wrap gap-6">
                    <CreativeButton href="/" tone="dark" className="px-10 py-5">
                        Back to Homepage
                        <span className="material-symbols-outlined text-lg transition-transform group-hover/cbtn:translate-x-1">
                            arrow_forward
                        </span>
                    </CreativeButton>
                    <CreativeButton href="/work" tone="dark" className="px-10 py-5">
                        View Projects
                        <span className="material-symbols-outlined text-lg transition-transform group-hover/cbtn:translate-x-1">
                            arrow_forward
                        </span>
                    </CreativeButton>
                </div>
            </main>
        </div>
    );
}