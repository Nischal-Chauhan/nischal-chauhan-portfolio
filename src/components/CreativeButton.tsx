"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

type Tone = "dark" | "light";

interface CreativeButtonProps {
    children: React.ReactNode;
    /** Internal route or external (http...) url. Omit for a plain button/span. */
    href?: string;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    /** "dark" = for light backgrounds (black strokes). "light" = for dark backgrounds (white strokes). */
    tone?: Tone;
    className?: string;
    target?: string;
    rel?: string;
    ariaLabel?: string;
    dataCursor?: string;
}

/**
 * Creative CTA button: corner-bracket strokes (not full edges) + a circular
 * fill that grows from wherever the cursor enters and retracts toward the exit.
 */
export default function CreativeButton({
    children,
    href,
    onClick,
    type,
    disabled,
    tone = "dark",
    className = "",
    target,
    rel,
    ariaLabel,
    dataCursor,
}: CreativeButtonProps) {
    const ref = useRef<HTMLElement | null>(null);
    const [fill, setFill] = useState({ x: 0, y: 0, size: 0, active: false });

    const pointFrom = (e: React.MouseEvent<HTMLElement>) => {
        const el = ref.current;
        if (!el) return { x: 0, y: 0, size: 0 };
        const r = el.getBoundingClientRect();
        return {
            x: e.clientX - r.left,
            y: e.clientY - r.top,
            // 2x the diagonal guarantees full coverage from any entry point
            size: Math.hypot(r.width, r.height) * 2,
        };
    };

    const handleEnter = (e: React.MouseEvent<HTMLElement>) => {
        setFill({ ...pointFrom(e), active: true });
    };
    const handleLeave = (e: React.MouseEvent<HTMLElement>) => {
        const p = pointFrom(e);
        setFill((prev) => ({ ...prev, x: p.x, y: p.y, active: false }));
    };

    const isLight = tone === "light";
    const contentColor = fill.active ? "text-white" : isLight ? "text-white" : "text-neutral-black";
    const strokeColor = fill.active ? "border-white" : isLight ? "border-white" : "border-neutral-black";

    const base =
        "group/cbtn relative inline-flex items-center justify-center overflow-hidden px-8 py-4 text-xs font-bold uppercase tracking-widest transition-colors duration-500 cursor-none select-none";
    const cls = twMerge(
        clsx(base, contentColor, disabled && "opacity-40 pointer-events-none"),
        className
    );

    const stroke = (pos: string) =>
        clsx(
            "pointer-events-none absolute z-10 h-3 w-3 transition-colors duration-500",
            strokeColor,
            pos
        );

    const inner = (
        <>
            {/* directional circle fill */}
            <span
                aria-hidden="true"
                className="pointer-events-none absolute z-0 rounded-full bg-primary"
                style={{
                    left: fill.x,
                    top: fill.y,
                    width: fill.size,
                    height: fill.size,
                    transform: `translate(-50%, -50%) scale(${fill.active ? 1 : 0})`,
                    transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
            />
            {/* corner strokes */}
            <span aria-hidden="true" className={stroke("left-0 top-0 border-l border-t")} />
            <span aria-hidden="true" className={stroke("right-0 top-0 border-r border-t")} />
            <span aria-hidden="true" className={stroke("left-0 bottom-0 border-l border-b")} />
            <span aria-hidden="true" className={stroke("right-0 bottom-0 border-r border-b")} />
            {/* label */}
            <span className="relative z-10 inline-flex items-center gap-3">{children}</span>
        </>
    );

    const handlers = { onMouseEnter: handleEnter, onMouseLeave: handleLeave };

    if (href) {
        if (/^https?:/.test(href)) {
            return (
                <a
                    ref={(el) => { ref.current = el; }}
                    href={href}
                    target={target}
                    rel={rel}
                    aria-label={ariaLabel}
                    data-cursor={dataCursor}
                    className={cls}
                    {...handlers}
                >
                    {inner}
                </a>
            );
        }
        return (
            <Link
                ref={(el) => { ref.current = el; }}
                href={href}
                aria-label={ariaLabel}
                data-cursor={dataCursor}
                className={cls}
                {...handlers}
            >
                {inner}
            </Link>
        );
    }

    if (type || onClick) {
        return (
            <button
                ref={(el) => { ref.current = el; }}
                type={type || "button"}
                onClick={onClick}
                disabled={disabled}
                aria-label={ariaLabel}
                data-cursor={dataCursor}
                className={cls}
                {...handlers}
            >
                {inner}
            </button>
        );
    }

    return (
        <span
            ref={(el) => { ref.current = el; }}
            aria-label={ariaLabel}
            data-cursor={dataCursor}
            className={cls}
            {...handlers}
        >
            {inner}
        </span>
    );
}
