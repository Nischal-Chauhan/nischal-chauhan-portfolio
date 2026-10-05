"use client";

import { useEffect, useRef, useState } from "react";

interface SmartImageProps {
    src: string;
    alt: string;
    /** Intrinsic dimensions — when provided, the box reserves the exact aspect ratio (no layout shift) and the skeleton sizes correctly. */
    width?: number;
    height?: number;
    /** Classes applied to the <img> (e.g. hover transforms). */
    className?: string;
    /** Classes applied to the wrapper box. */
    wrapperClassName?: string;
    /** Eager-load above-the-fold images. */
    priority?: boolean;
}

/**
 * Image with a shimmer skeleton + lazy loading + fade-in.
 * With width/height it reserves the aspect ratio (zero CLS); without, it falls
 * back to natural height. Use for all content imagery across the site.
 */
export default function SmartImage({
    src,
    alt,
    width,
    height,
    className = "",
    wrapperClassName = "",
    priority = false,
}: SmartImageProps) {
    const [loaded, setLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const hasRatio = !!(width && height);

    // Images cached / loaded before hydration fire onLoad before the handler attaches.
    useEffect(() => {
        if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) {
            setLoaded(true);
        }
    }, []);

    return (
        <span
            className={`relative block overflow-hidden ${wrapperClassName}`}
            style={hasRatio ? { aspectRatio: `${width} / ${height}` } : undefined}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 bg-slate-200 transition-opacity duration-500 ${loaded ? "opacity-0" : "animate-pulse opacity-100"}`}
            />
            <img
                ref={imgRef}
                src={src}
                alt={alt}
                width={width}
                height={height}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                onLoad={() => setLoaded(true)}
                onError={() => setLoaded(true)}
                className={`${hasRatio ? "absolute inset-0 h-full w-full object-cover" : "block h-auto w-full"} transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
            />
        </span>
    );
}
