"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

function cx(...args: (string | boolean | undefined | null)[]) {
    return twMerge(clsx(args));
}

const navLinks = [
    { path: "/", num: "01", label: "Home" },
    { path: "/work", num: "02", label: "Work" },
    { path: "/about", num: "03", label: "About" },
    { path: "/services", num: "04", label: "Services" },
    { path: "/journal", num: "05", label: "Journal" },
    { path: "/contact", num: "06", label: "Contact" },
];

const socials = [
    { label: "LinkedIn", href: "https://www.linkedin.com/in/nischal-chauhan" },
    { label: "GitHub", href: "https://github.com/Nischal-Chauhan" },
];

export default function Navigation() {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        // let the global music toggle know to get out of the way while the menu is open
        window.dispatchEvent(new CustomEvent("menu-toggle", { detail: menuOpen }));
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMenuOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    return (
        <>
            {/* Top bar — logo + creative hamburger (desktop AND mobile) */}
            <header className="fixed top-0 left-0 w-full z-[1100] px-6 md:px-10 py-6 md:py-8 flex justify-between items-center pointer-events-none mix-blend-difference">
                <Link
                    href="/"
                    className="flex items-center gap-4 text-white pointer-events-auto"
                    onClick={() => setMenuOpen(false)}
                >
                    <div className="size-8">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z"
                                fill="currentColor"
                            />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-medium leading-tight tracking-tighter">NC</h2>
                </Link>

                <button
                    onClick={() => setMenuOpen((o) => !o)}
                    aria-label={menuOpen ? "Close menu" : "Open menu"}
                    className="pointer-events-auto flex items-center gap-3 p-3 -m-3 text-white"
                >
                    <span className="hidden sm:block text-[11px] font-bold uppercase tracking-[0.28em]">
                        {menuOpen ? "Close" : "Menu"}
                    </span>
                    <span className="relative flex h-5 w-8 flex-col justify-center gap-[7px]">
                        <span
                            className={cx(
                                "block h-[2px] w-8 bg-white transition-all duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] origin-center",
                                menuOpen && "translate-y-[4.5px] rotate-45"
                            )}
                        />
                        <span
                            className={cx(
                                "block h-[2px] w-8 bg-white transition-all duration-500 ease-[cubic-bezier(0.7,0,0.2,1)] origin-center",
                                menuOpen && "-translate-y-[4.5px] -rotate-45"
                            )}
                        />
                    </span>
                </button>
            </header>

            {/* Fullscreen creative menu — clip-wipes down, items slide up in a stagger */}
            <div
                className={cx(
                    "fixed inset-0 z-[1000] bg-[#15110d] flex flex-col transition-[clip-path,opacity] duration-[800ms] ease-[cubic-bezier(0.76,0,0.24,1)]",
                    menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                style={{ clipPath: menuOpen ? "inset(0 0 0 0)" : "inset(0 0 100% 0)" }}
            >
                <nav className="flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-24">
                    {navLinks.map((link, i) => {
                        const isActive =
                            pathname === link.path || (link.path !== "/" && pathname.startsWith(link.path));
                        return (
                            <div key={link.path} className="overflow-hidden pb-[0.18em]">
                                <Link
                                    href={link.path}
                                    onClick={() => setMenuOpen(false)}
                                    className={cx(
                                        "group/item flex items-baseline gap-5 md:gap-10 py-0.5 md:py-1 transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.5,0,0.1,1)]",
                                        menuOpen ? "translate-y-0 opacity-100" : "translate-y-[115%] opacity-0"
                                    )}
                                    style={{ transitionDelay: menuOpen ? `${0.2 + i * 0.06}s` : "0s" }}
                                >
                                    <span className="font-sans text-[10px] md:text-xs font-semibold tracking-[0.2em] text-[#bb693a] w-6 md:w-9 shrink-0 translate-y-[-0.4em]">
                                        {link.num}
                                    </span>
                                    <span
                                        className={cx(
                                            "font-display italic font-light text-[14vw] md:text-[9vw] lg:text-[7.5vw] leading-[1.02] tracking-tight transition-colors duration-300",
                                            isActive
                                                ? "text-[#bb693a]"
                                                : "text-[#efece4] group-hover/item:text-[#bb693a]"
                                        )}
                                    >
                                        {link.label}
                                    </span>
                                    <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-white/0 group-hover/item:text-white/40 transition-colors duration-300 self-center hidden md:inline">
                                        →
                                    </span>
                                </Link>
                            </div>
                        );
                    })}
                </nav>

                <div
                    className={cx(
                        "px-6 md:px-12 lg:px-24 pb-8 md:pb-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-4 transition-opacity duration-700",
                        menuOpen ? "opacity-100" : "opacity-0"
                    )}
                    style={{ transitionDelay: menuOpen ? "0.55s" : "0s" }}
                >
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/40">
                        Nischal Chauhan — Ahmedabad, Gujarat, India
                    </span>
                    <div className="flex flex-wrap gap-5">
                        {socials.map((s) => (
                            <a
                                key={s.label}
                                href={s.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] uppercase tracking-[0.2em] text-white/50 hover:text-[#bb693a] transition-colors"
                            >
                                {s.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
