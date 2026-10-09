"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CreativeButton from "@/components/CreativeButton";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function ThankYou() {
    const container = useRef<HTMLDivElement>(null);

    // Matches the entrance animation idiom of the other pages (contact),
    // scoped to this page only.
    useGSAP(
        () => {
            window.scrollTo(0, 0);
            ScrollTrigger.refresh();

            gsap.to(".thankyou-content", {
                y: 0,
                opacity: 1,
                ease: "power4.out",
                duration: 1.5,
            });
        },
        { scope: container, revertOnUpdate: true }
    );

    return (
        <div ref={container} className="relative flex min-h-screen flex-col">
            <main className="flex-1 flex flex-col items-center justify-center px-6 pt-40 pb-20 max-w-[1440px] mx-auto w-full text-center">
                <div className="thankyou-content opacity-0 translate-y-20 py-16">
                    <div className="text-6xl md:text-7xl mb-10" aria-hidden="true">
                        ✓
                    </div>
                    <h1 className="text-[16vw] md:text-[9vw] lg:text-[7.5vw] font-display font-medium leading-[0.85] tracking-tighter uppercase mb-10">
                        Thank <br /> You
                    </h1>
                    <p className="font-sans text-lg md:text-xl max-w-xl text-slate-700 leading-relaxed mx-auto mb-12">
                        Your message has been sent. I&apos;ll get back to you as soon as I can.
                    </p>
                    <CreativeButton href="/" tone="dark" className="px-10 py-5">
                        Back to Portfolio
                        <span className="material-symbols-outlined text-lg transition-transform group-hover/cbtn:translate-x-2">
                            arrow_forward
                        </span>
                    </CreativeButton>
                </div>
            </main>
        </div>
    );
}