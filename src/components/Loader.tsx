"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useProgress } from "@react-three/drei";

/**
 * Loading screen that actually waits for the home hero's 3D assets (the EXR sky +
 * GLB pillars, tracked via THREE.DefaultLoadingManager through drei's useProgress)
 * before revealing the page. On pages with no 3D scene it shows a brief branded
 * intro instead. Driven by setInterval (not rAF) so it stays correct even when the
 * tab throttles animation frames.
 */
export default function Loader() {
    const [show, setShow] = useState(true);
    const root = useRef<HTMLDivElement>(null);
    const countRef = useRef<HTMLSpanElement>(null);
    const barRef = useRef<HTMLDivElement>(null);

    // real asset-loading state (works outside the Canvas)
    const { active, progress } = useProgress();
    const sync = useRef({ active, progress, started: false });
    useEffect(() => {
        sync.current.active = active;
        sync.current.progress = progress;
        if (active) sync.current.started = true;
    }, [active, progress]);

    useEffect(() => {
        const expectsScene = window.location.pathname === "/"; // only the home hero loads 3D assets

        let seen = false;
        try {
            seen = !!sessionStorage.getItem("pt-loaded");
            sessionStorage.setItem("pt-loaded", "1");
        } catch {
            /* ignore */
        }
        document.body.style.overflow = "hidden";

        const start = performance.now();
        const minTime = seen ? 350 : 1000; // keep it on screen at least this long
        const maxTime = 12000; // hard safety — never block longer than this
        let disp = 0;
        let lastActive = start;
        let exiting = false;
        let finished = false;

        const finish = () => {
            if (finished) return;
            finished = true;
            document.body.style.overflow = "";
            setShow(false);
        };

        const exit = () => {
            if (exiting) return;
            exiting = true;
            clearInterval(timer);
            if (countRef.current) countRef.current.textContent = "100";
            if (barRef.current) barRef.current.style.transform = "scaleX(1)";
            gsap.timeline()
                .to(".loader-inner", { opacity: 0, y: -10, duration: 0.45, ease: "power2.in" })
                .to(root.current, { yPercent: -100, duration: 0.85, ease: "power4.inOut" }, "-=0.1")
                .add(finish);
            setTimeout(finish, 1600); // dismiss even if rAF is throttled
        };

        const timer = setInterval(() => {
            const { started, active: a, progress: p } = sync.current;
            const elapsed = performance.now() - start;
            if (a) lastActive = performance.now();

            // counter target: real asset progress once loading begins; gentle creep otherwise
            const target = expectsScene
                ? started
                    ? p
                    : Math.min(90, (elapsed / 3000) * 90)
                : Math.min(100, (elapsed / 1300) * 100);
            disp += (Math.max(disp, target) - disp) * 0.14;

            if (countRef.current) countRef.current.textContent = String(Math.min(100, Math.round(disp))).padStart(2, "0");
            if (barRef.current) barRef.current.style.transform = `scaleX(${Math.min(1, disp / 100)})`;

            const ready = expectsScene
                ? started && !a && performance.now() - lastActive > 300 && p >= 100 // assets done + settled
                : elapsed > 1300;

            if ((ready && elapsed > minTime && disp > 93) || elapsed > maxTime) exit();
        }, 40);

        return () => {
            clearInterval(timer);
            document.body.style.overflow = "";
        };
    }, []);

    if (!show) return null;

    return (
        <div
            ref={root}
            className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-background-light text-neutral-black"
        >
            <div className="loader-inner flex flex-col items-center gap-9">
                <div className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-500">Nischal Chauhan</div>
                <div className="font-display text-7xl md:text-8xl font-medium leading-none tracking-tight tabular-nums">
                    <span ref={countRef}>00</span>
                    <span className="ml-1 align-top text-2xl text-slate-400">%</span>
                </div>
                <div className="h-px w-48 overflow-hidden bg-black/10">
                    <div ref={barRef} className="h-full w-full origin-left bg-neutral-black" style={{ transform: "scaleX(0)" }} />
                </div>
            </div>
        </div>
    );
}
