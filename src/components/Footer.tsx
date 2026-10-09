"use client";

import Link from "next/link";
import { isAnalyticsConfigured } from "@/components/ConsentBanner";

// The "Cookie Settings" button reopens the analytics consent banner
// (ConsentBanner listens for this event), letting visitors change or
// withdraw their analytics decision at any time.
const CONSENT_SETTINGS_EVENT = "nischal-consent-settings";

export default function Footer() {
    // Shown only when analytics is actually configured: without a real GA4
    // measurement id the banner never opens, so the control would appear
    // broken. NEXT_PUBLIC_ vars are inlined at build time, identically on the
    // server and the client — no hydration mismatch.
    const analyticsConfigured = isAnalyticsConfigured(
        process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
    );

    return (
        <footer className="w-full p-0 bg-black overflow-hidden relative">
            <div className="w-full flex flex-col justify-between h-full py-10 md:py-16 px-6 md:px-20">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 text-white/30 uppercase text-[10px] md:text-[12px] font-medium tracking-[0.3em] md:tracking-[0.5em]">
                    <span>Based in Ahmedabad, Gujarat, India</span>
                    <a
                        href="mailto:chauhannischal311@gmail.com"
                        className="hover:text-white transition-colors"
                    >
                        Contact Me →
                    </a>
                </div>

                <div className="marquee-container w-full overflow-hidden py-4 border-y border-white/5 my-6 md:my-8">
                    <div className="flex animate-marquee whitespace-nowrap">
                        <span className="text-[10vw] md:text-[8vw] font-medium text-white leading-none tracking-tighter uppercase mr-16 md:mr-32 flex-shrink-0">
                            Let&apos;s Work Together
                        </span>
                        <span className="text-[10vw] md:text-[8vw] font-medium text-white leading-none tracking-tighter uppercase mr-16 md:mr-32 flex-shrink-0">
                            Let&apos;s Work Together
                        </span>
                        <span className="text-[10vw] md:text-[8vw] font-medium text-white leading-none tracking-tighter uppercase mr-16 md:mr-32 flex-shrink-0">
                            Let&apos;s Work Together
                        </span>
                        <span className="text-[10vw] md:text-[8vw] font-medium text-white leading-none tracking-tighter uppercase mr-16 md:mr-32 flex-shrink-0">
                            Let&apos;s Work Together
                        </span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-white/30 pb-4">
                    <div className="flex flex-wrap gap-4 md:gap-16 pointer-events-auto">
                        <a
                            className="hover:text-white transition-colors uppercase text-xs md:text-sm font-medium tracking-widest"
                            href="https://www.linkedin.com/in/nischal-chauhan"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            LinkedIn
                        </a>
                        <a className="hover:text-white transition-colors uppercase text-xs md:text-sm font-medium tracking-widest" href="https://github.com/Nischal-Chauhan" target="_blank" rel="noopener noreferrer">GitHub</a>
                        <Link
                            className="hover:text-white transition-colors uppercase text-xs md:text-sm font-medium tracking-widest"
                            href="/privacy"
                        >
                            Privacy Policy
                        </Link>
                        {analyticsConfigured && (
                            <button
                                type="button"
                                onClick={() =>
                                    window.dispatchEvent(new Event(CONSENT_SETTINGS_EVENT))
                                }
                                className="uppercase text-xs md:text-sm font-medium tracking-widest hover:text-white transition-colors cursor-none"
                            >
                                Cookie Settings
                            </button>
                        )}
                    </div>
                    <div className="text-right">
                        {/* Copyright removed */}
                    </div>
                </div>
            </div>
        </footer>
    );
}
