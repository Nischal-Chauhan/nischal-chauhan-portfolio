"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

function cx(...args: (string | boolean | undefined | null)[]) {
    return twMerge(clsx(args));
}

/**
 * Floating background-music toggle. The visitor starts the track
 * (public/music/portfolio-ambient.mp3) themselves — music is never autoplayed,
 * so a recognizable Play icon shows before playback and stays until they click.
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

    // Set the playback volume up front without starting playback.
    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = 0.25;
    }, []);

    // Keep `playing` true to reality even when playback changes outside the
    // button (media keys, notification-center pause).
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    const toggle = () => {
        const a = audioRef.current;
        if (!a) return;
        if (a.paused) {
            a.volume = 0.25;
            a.play().then(onPlay).catch(() => setPlaying(false));
        } else {
            a.pause();
            setPlaying(false);
        }
    };

    return (
        <>
            <audio
                ref={audioRef}
                src="/music/portfolio-ambient.mp3"
                loop
                preload="auto"
                onPlay={onPlay}
                onPause={onPause}
            />
            <button
                type="button"
                onClick={toggle}
                aria-label={playing ? "Pause background music" : "Play background music"}
                title={playing ? "Pause background music" : "Play background music"}
                className={cx(
                    "group fixed right-5 md:right-7 z-[900] flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white/55 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition hover:bg-white/80",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    isHome ? "bottom-24 md:bottom-28" : "bottom-5 md:bottom-7",
                    menuOpen && "opacity-0 pointer-events-none"
                )}
            >
                {playing ? (
                    <span
                        className="material-symbols-outlined text-primary text-2xl leading-none"
                        aria-hidden="true"
                    >
                        pause
                    </span>
                ) : (
                    <span
                        className="material-symbols-outlined text-primary/70 group-hover:text-primary text-2xl leading-none transition-colors"
                        aria-hidden="true"
                    >
                        play_arrow
                    </span>
                )}
            </button>
        </>
    );
}