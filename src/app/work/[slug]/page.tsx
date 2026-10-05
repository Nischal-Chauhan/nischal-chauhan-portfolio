"use client";

import { useRef, useState, useEffect } from "react";
import { useParams, redirect } from "next/navigation";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projectsData, type Project } from "@/data/projects";
import CreativeButton from "@/components/CreativeButton";
import SmartImage from "@/components/SmartImage";

type LightboxMedia = {
    url: string;
    type: "image" | "video";
} | null;

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function ProjectDetail() {
    const params = useParams();
    const slug = params.slug as string;
    const project: Project | undefined = projectsData.find((p) => p.slug === slug);
    const container = useRef<HTMLElement>(null);
    const [lightbox, setLightbox] = useState<LightboxMedia>(null);
    const [isLiveLoaded, setIsLiveLoaded] = useState(false);
    const lightboxRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!project) return;

            window.scrollTo(0, 0);
            ScrollTrigger.refresh();

            gsap.from(".title-anim", {
                y: 150,
                opacity: 0,
                duration: 1.5,
                ease: "power4.out",
                stagger: 0.1,
            });

            gsap.from(".meta-item", {
                y: 30,
                opacity: 0,
                duration: 1,
                stagger: 0.1,
                ease: "power3.out",
                delay: 0.5,
            });

            const heroEl = document.querySelector(".hero-container");
            if (heroEl) {
                gsap.to(".hero-parallax", {
                    yPercent: 30,
                    ease: "none",
                    scrollTrigger: {
                        trigger: ".hero-container",
                        start: "top top",
                        end: "bottom top",
                        scrub: 1, // Added slight smoothing, changed from true
                    },
                });
            }

            const fadeUpSections = gsap.utils.toArray<HTMLElement>(".fade-up");
            fadeUpSections.forEach((section) => {
                gsap.from(section, {
                    y: 60,
                    opacity: 0,
                    duration: 1.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top bottom-=10%",
                    },
                });
            });

            const galleryImages = gsap.utils.toArray<HTMLElement>(".gallery-img");
            if (galleryImages.length > 0) {
                gsap.from(galleryImages, {
                    y: 100,
                    opacity: 0,
                    duration: 1.2,
                    stagger: 0.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: ".gallery-container",
                        start: "top bottom-=15%",
                    },
                });
            }
        },
        { dependencies: [slug, project], scope: container, revertOnUpdate: true }
    );

    useGSAP(() => {
        if (lightbox) {
            gsap.fromTo(lightboxRef.current,
                { opacity: 0, scale: 0.95 },
                { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }
            );
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, { dependencies: [lightbox], scope: container });

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setLightbox(null);
        };
        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, []);

    if (!project) {
        redirect("/work");
    }

    const hasMetadata = project.role || project.tools || project.concept;
    const hasHeroImage = project.heroImage && project.heroImage.length > 0;
    const hasNarrative = project.narrative && project.narrative.length > 0;
    const hasChallenge = project.challenge?.text && project.challenge.text.length > 0;
    const hasSolution = project.solution?.text && project.solution.text.length > 0;
    const hasHeroVideo = project.heroVideo && project.heroVideo.length > 0;
    const hasImages = project.images && project.images.length > 0;
    const firstImage = hasImages ? project.images[0] : null;
    const heroSrc = hasHeroVideo ? project.heroVideo : (hasHeroImage ? project.heroImage : firstImage);

    return (
        <main ref={container} className="flex-1 pt-32 px-6 lg:px-12 max-w-[1440px] mx-auto w-full pb-0">
            <section className="mb-20">
                <div className="overflow-hidden mb-12">
                    <h1 className="title-anim text-[12vw] lg:text-[10vw] font-display font-bold leading-[0.9] tracking-tighter uppercase">
                        {project.title || project.slug.replace(/-/g, " ")}
                    </h1>
                </div>

                {hasMetadata && (
                    <div className="grid grid-cols-1 md:grid-cols-3 border-t border-slate-900 py-4 gap-8">
                        {project.role && (
                            <div className="meta-item flex flex-col gap-1">
                                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
                                    (01) ROLE
                                </span>
                                <p className="text-sm font-medium uppercase">{project.role}</p>
                            </div>
                        )}
                        {project.tools && (
                            <div className="meta-item flex flex-col gap-1 border-t md:border-t-0 md:border-l border-slate-900 pt-4 md:pt-0 md:pl-8">
                                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
                                    (02) TOOLS
                                </span>
                                <p className="text-sm font-medium uppercase">{project.tools}</p>
                            </div>
                        )}
                        {project.concept && (
                            <div className="meta-item flex flex-col gap-1 border-t md:border-t-0 md:border-l border-slate-900 pt-4 md:pt-0 md:pl-8">
                                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
                                    (03) CONCEPT
                                </span>
                                <p className="text-sm font-medium uppercase">{project.concept}</p>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {heroSrc && (
                <section className="mb-32">
                    <div
                        className="hero-container aspect-[16/9] w-full bg-slate-200 overflow-hidden relative group cursor-pointer"
                        onClick={() => setLightbox({ url: heroSrc as string, type: hasHeroVideo ? "video" : "image" })}
                    >
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 z-20 transition-opacity duration-300">
                            <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 text-white text-xs font-bold tracking-widest uppercase">
                                View Fullscreen
                            </div>
                        </div>
                        {/* Parallax Wrapper: GSAP animates this, NO CSS transitions here */}
                        <div className="hero-parallax absolute inset-x-0 -top-[15%] h-[130%] w-full will-change-transform">
                            {hasHeroVideo ? (
                                <video
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    src={heroSrc as string}
                                    poster={project.images?.[0]}
                                    preload="metadata"
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                />
                            ) : (
                                <div
                                    className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                    style={{ backgroundImage: `url('${heroSrc}')` }}
                                ></div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {hasNarrative && (
                <section className="mb-32">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 fade-up">
                        <div className="lg:col-span-4">
                            <h2 className="text-sm font-display font-bold tracking-widest uppercase border-b border-slate-900 pb-2">
                                Project Narrative
                            </h2>
                        </div>
                        <div className="lg:col-span-8">
                            <p className="text-2xl lg:text-3xl font-normal leading-tight text-slate-800">
                                {project.narrative}
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {(hasChallenge || hasSolution) && (
                <section className="mb-32 space-y-24">
                    {hasChallenge && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-slate-900 pt-8 fade-up">
                            <div className="lg:col-span-4">
                                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
                                    (01) CHALLENGE
                                </span>
                            </div>
                            <div className="lg:col-span-8">
                                {project.challenge!.title && (
                                    <h3 className="text-xl font-display font-bold uppercase mb-4">{project.challenge!.title}</h3>
                                )}
                                <p className="text-lg leading-relaxed text-slate-700 max-w-2xl">
                                    {project.challenge!.text}
                                </p>
                            </div>
                        </div>
                    )}

                    {hasSolution && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 border-t border-slate-900 pt-8 fade-up">
                            <div className="lg:col-span-4">
                                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">
                                    (02) SOLUTION
                                </span>
                            </div>
                            <div className="lg:col-span-8">
                                {project.solution!.title && (
                                    <h3 className="text-xl font-display font-bold uppercase mb-4">{project.solution!.title}</h3>
                                )}
                                <p className="text-lg leading-relaxed text-slate-700 max-w-2xl">
                                    {project.solution!.text}
                                </p>
                            </div>
                        </div>
                    )}
                </section>
            )}

            {project.liveUrl && (
                <section className="mb-32 fade-up">
                    <div className="flex items-center justify-between mb-8 border-b border-slate-900 pb-2">
                        <h2 className="text-sm font-display font-bold tracking-widest uppercase">
                            Live Experience
                        </h2>
                        <a
                            href={project.liveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-bold tracking-widest uppercase text-slate-500 hover:text-primary transition-colors flex items-center gap-2"
                        >
                            Launch Full Site
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
                            </svg>
                        </a>
                    </div>

                    <div className="relative group overflow-hidden rounded-2xl border border-slate-200 shadow-2xl bg-white">
                        {/* Browser Header */}
                        <div className="h-10 border-b border-slate-100 flex items-center px-4 gap-2 bg-slate-50/50 justify-between">
                            <div className="flex gap-1.5 w-16">
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                                <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                            </div>

                            <div className="bg-white border border-slate-100 rounded-md px-3 py-1 flex items-center gap-2 max-w-sm w-full mx-auto justify-center">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
                                <span className="text-[9px] font-medium text-slate-400 truncate tracking-wide text-center">
                                    {project.liveUrl}
                                </span>
                            </div>

                            <div className="w-16 flex justify-end">
                                {isLiveLoaded && (
                                    <button
                                        onClick={() => setIsLiveLoaded(false)}
                                        className="text-[9px] font-bold tracking-widest uppercase text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 group/close"
                                    >
                                        Exit
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover/close:rotate-90 transition-transform">
                                            <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Embed Content */}
                        <div className="aspect-video w-full bg-slate-50 relative">
                            {isLiveLoaded ? (
                                <iframe
                                    src={project.liveUrl}
                                    className="w-full h-full border-none"
                                    loading="lazy"
                                    title={`Live preview of ${project.title}`}
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-100/50 backdrop-blur-sm">
                                    <div className="mb-6 space-y-2">
                                        <h3 className="text-2xl font-display font-bold uppercase tracking-tight">Interactive 3D Experience</h3>
                                        <p className="text-sm text-slate-500 max-w-sm">Click the button below to load the live immersive environment. This helps optimize performance.</p>
                                    </div>
                                    <CreativeButton onClick={() => setIsLiveLoaded(true)} tone="dark" className="px-10 py-4 tracking-[0.2em]">
                                        Experience This
                                    </CreativeButton>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

            {hasImages && (
                <section className="mb-32 gallery-container">
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
                        {project.images.map((img, i) => {
                            const caption = project.imageCaptions?.[i];
                            return (
                                <div key={i} className="gallery-img break-inside-avoid mb-6">
                                    <div
                                        className="bg-slate-200 overflow-hidden relative group cursor-pointer"
                                        onClick={() => setLightbox({ url: img, type: "image" })}
                                    >
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 z-20 transition-opacity duration-300 bg-black/5">
                                            <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-white text-[10px] font-bold tracking-widest uppercase">
                                                Preview
                                            </div>
                                        </div>
                                        <SmartImage
                                            src={img}
                                            alt={caption || ""}
                                            className="hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                    {caption && (
                                        <p className="mt-3 text-[10px] font-bold tracking-widest uppercase text-slate-400">
                                            {caption}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>
            )}

            {project.disclaimer && (
                <section className="mb-24 fade-up">
                    <p className="text-xs tracking-wide text-slate-400 italic max-w-2xl">
                        {project.disclaimer}
                    </p>
                </section>
            )}

            {project.nextCase?.slug && project.nextCase.slug !== "../index" && (
                <section className="py-40 border-t border-slate-900 fade-up">
                    <Link href={`/work/${project.nextCase.slug}`} className="group block text-center">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 block mb-6">
                            Up Next
                        </span>
                        <h2 className="text-2xl sm:text-4xl lg:text-7xl font-display font-bold uppercase flex flex-wrap items-center justify-center gap-4 transition-all group-hover:gap-10 break-words max-w-full">
                            Next Case: {project.nextCase.title}
                        </h2>
                    </Link>
                </section>
            )}

            {/* Lightbox Modal */}
            {lightbox && (
                <div
                    ref={lightboxRef}
                    className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 lg:p-12"
                    onClick={() => setLightbox(null)}
                >
                    <button
                        className="absolute top-10 right-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white transition-all duration-300 z-[1110] group"
                        onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
                        aria-label="Close preview"
                    >
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="group-hover:rotate-90 transition-transform duration-300"
                        >
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>

                    <div
                        className="relative max-w-full max-h-full w-full h-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {lightbox.type === "image" ? (
                            <img
                                src={lightbox.url}
                                alt=""
                                className="max-w-full max-h-full object-contain shadow-2xl"
                            />
                        ) : (
                            <video
                                src={lightbox.url}
                                controls
                                autoPlay
                                className="max-w-full max-h-full shadow-2xl"
                            />
                        )}
                    </div>
                </div>
            )}
        </main>
    );
}
