"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";

/**
 * Minimal cursor: a small, subtle dot that tracks the pointer precisely, with a
 * soft ring trailing just behind it. The ring gently expands (and the dot shrinks)
 * over interactive elements. mix-blend-difference keeps both visible on any
 * background. Shown only on devices with a fine pointer (mouse/trackpad) — hidden
 * on touch via CSS, so there's no SSR/hydration state to manage.
 */
export default function CustomCursor() {
    const dotRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    useEffect(() => {
        // Mirror the CSS gate exactly so hybrid devices (touchscreen laptops, iPad +
        // trackpad) bind the handlers whenever the dots are actually shown.
        if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

        const dot = dotRef.current;
        const ring = ringRef.current;
        if (!dot || !ring) return;

        // gsap-native centering so quickTo's x/y don't clobber it
        gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

        // dot follows tightly; ring trails with a soft lag
        const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power3" });
        const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power3" });
        const ringX = gsap.quickTo(ring, "x", { duration: 0.34, ease: "power3" });
        const ringY = gsap.quickTo(ring, "y", { duration: 0.34, ease: "power3" });

        const move = (e: MouseEvent) => {
            dotX(e.clientX);
            dotY(e.clientY);
            ringX(e.clientX);
            ringY(e.clientY);
        };

        let lastInteractive: boolean | null = null;
        let lastSolid: boolean | null = null;
        // the hero ([data-cursor="none"]) renders over WebGL, where mix-blend-difference
        // flickers — switch to a clean solid cursor there, keep the blend everywhere else
        const setSolid = (solid: boolean) => {
            dot.style.mixBlendMode = solid ? "normal" : "difference";
            ring.style.mixBlendMode = solid ? "normal" : "difference";
            dot.style.backgroundColor = solid ? "#241a10" : "";
            ring.style.borderColor = solid ? "#241a10" : "";
            dot.style.filter = solid ? "drop-shadow(0 0 3px rgba(255,250,240,0.75))" : "";
            ring.style.filter = solid ? "drop-shadow(0 0 3px rgba(255,250,240,0.6))" : "";
        };
        const over = (e: MouseEvent) => {
            const t = e.target as HTMLElement;
            const solid = !!t.closest('[data-cursor="none"]');
            if (solid !== lastSolid) {
                lastSolid = solid;
                setSolid(solid);
            }
            const interactive =
                !!t.closest(
                    'a, button, [role="button"], input, textarea, select, [data-cursor="large"], [data-cursor="explore"], [data-cursor="scroll"]'
                ) || window.getComputedStyle(t).cursor === "pointer";
            if (interactive === lastInteractive) return;
            lastInteractive = interactive;
            gsap.to(ring, {
                scale: interactive ? 1.9 : 1,
                opacity: interactive ? 0.85 : 0.4,
                duration: 0.3,
                ease: "power3",
            });
            gsap.to(dot, { scale: interactive ? 0.5 : 1, duration: 0.3, ease: "power3" });
        };

        // fade out when the pointer leaves the window
        const leave = () => gsap.to([dot, ring], { opacity: 0, duration: 0.25 });
        const enter = () =>
            gsap.to([dot, ring], { opacity: (i: number) => (i === 0 ? 1 : 0.4), duration: 0.25 });

        window.addEventListener("mousemove", move);
        window.addEventListener("mouseover", over);
        document.documentElement.addEventListener("mouseleave", leave);
        document.documentElement.addEventListener("mouseenter", enter);

        return () => {
            window.removeEventListener("mousemove", move);
            window.removeEventListener("mouseover", over);
            document.documentElement.removeEventListener("mouseleave", leave);
            document.documentElement.removeEventListener("mouseenter", enter);
        };
    }, [pathname]);

    return (
        <>
            <style
                dangerouslySetInnerHTML={{
                    __html: `@media (hover: hover) and (pointer: fine) {
                        * { cursor: none !important; }
                        .pt-cursor { display: block !important; }
                    }`,
                }}
            />
            {/* soft trailing ring */}
            <div
                ref={ringRef}
                className="pt-cursor hidden fixed top-0 left-0 z-[10001] h-7 w-7 rounded-full border border-white mix-blend-difference pointer-events-none will-change-transform"
                style={{ opacity: 0.4 }}
            />
            {/* small precise dot */}
            <div
                ref={dotRef}
                className="pt-cursor hidden fixed top-0 left-0 z-[10002] h-1.5 w-1.5 rounded-full bg-white mix-blend-difference pointer-events-none will-change-transform"
            />
        </>
    );
}
