"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

function cx(...args: (string | boolean | undefined | null)[]) {
    return twMerge(clsx(args));
}

/**
 * Floating background-music toggle. Plays the owner's own track from
 * public/music/track.m4a on the first click (browsers block autoplay, so a
 * user gesture is required).
 *
 * On the home page it sits a little higher so it clears the hero status bar.
 */
export default function MusicPlayer() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [playing, setPlaying] = useState(false);
    const pathname = usePathname();
    const isHome = pathname === "/";
    const [menuOpen, setMenuOpen] = useState(false);

    // hide the toggle while the fullscreen nav menu is open (Navigation dispatches this)
    useEffect(() => {
        const onMenu = (e: Event) => setMenuOpen(Boolean((e as CustomEvent).detail));
        window.addEventListener("menu-toggle", onMenu);
        return () => window.removeEventListener("menu-toggle", onMenu);
    }, []);

    // Autoplay the track. Browsers block autoplay-with-sound until the user has
    // interacted with the page, so we attempt immediately and, if that's blocked,
    // start on the very first interaction (pointer / key / touch / scroll).
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.volume = 0.25;
        const events = ["pointerdown", "keydown", "touchstart", "wheel"];
        const start = () => {
            audio.volume = 0.25;
            audio
                .play()
                .then(() => {
                    setPlaying(true);
                    events.forEach((e) => window.removeEventListener(e, start));
                })
                .catch(() => {});
        };
        start(); // works immediately when the browser permits autoplay
        events.forEach((e) => window.addEventListener(e, start, { passive: true }));
        return () => events.forEach((e) => window.removeEventListener(e, start));
    }, []);

    const toggle = () => {
        const a = audioRef.current;
        if (!a) return;
        if (a.paused) {
            a.volume = 0.25;
            a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
        } else {
            a.pause();
            setPlaying(false);
        }
    };

    const restHeights = ["6px", "11px", "7px", "10px"];

    return (
        <>
            <audio ref={audioRef} src="/music/track.m4a" loop preload="auto" />
            <button
                onClick={toggle}
                aria-label={playing ? "Pause music" : "Play music"}
                title={playing ? "Pause music" : "Play music"}
                className={cx(
                    "group fixed right-5 md:right-7 z-[900] flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/55 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition hover:bg-white/80",
                    isHome ? "bottom-24 md:bottom-28" : "bottom-5 md:bottom-7",
                    menuOpen && "opacity-0 pointer-events-none"
                )}
            >
                <span className="flex h-3.5 items-end gap-[3px]">
                    {[0, 1, 2, 3].map((i) => (
                        <span
                            key={i}
                            className={cx(
                                "w-[2.5px] rounded-full transition-colors duration-300",
                                playing ? "bg-[#bb693a] animate-eq" : "bg-neutral-black/40 group-hover:bg-[#bb693a]"
                            )}
                            style={playing ? { animationDelay: `${i * 0.13}s` } : { height: restHeights[i] }}
                        />
                    ))}
                </span>
            </button>
        </>
    );
}
