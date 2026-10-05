"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projectsData } from "@/data/projects";
import SmartImage from "@/components/SmartImage";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Work() {
    const container = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            window.scrollTo(0, 0);
            ScrollTrigger.refresh();

            gsap.to(".hero-title-word", {
                y: 0,
                opacity: 1,
                duration: 1.2,
                ease: "power4.out",
                stagger: 0.1,
            });

            gsap.to(".hero-sub-content", {
                opacity: 1,
                duration: 1.5,
                delay: 0.5,
                ease: "power2.out",
            });

            const cards = gsap.utils.toArray<HTMLElement>(".project-card");
            cards.forEach((card) => {
                gsap.from(card, {
                    y: 80,
                    opacity: 0,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: card,
                        start: "top bottom-=10%",
                    },
                });
            });
        },
        { scope: container, revertOnUpdate: true }
    );

    return (
        <main ref={container} className="pt-24 md:pt-32 pb-0">
            <section className="px-6 md:px-8 mb-16 md:mb-24">
                <div className="flex flex-col items-start hero-title-container">
                    <h1 className="text-[14vw] md:text-[12vw] lg:text-[10vw] leading-[0.85] font-display font-medium tracking-tighter uppercase mb-4">
                        <span className="inline-block transform translate-y-20 opacity-0 hero-title-word">
                            Select
                        </span>{" "}
                        <br />
                        <span className="inline-block transform translate-y-20 opacity-0 hero-title-word">
                            Cases
                        </span>
                    </h1>
                    <div className="flex items-center gap-4 mt-4 hero-sub-content opacity-0">
                        <span className="text-[6vw] font-light leading-none opacity-30 tracking-tighter">
                            ({projectsData.length})
                        </span>
                        <p className="max-w-xs text-xs md:text-sm uppercase leading-relaxed tracking-wider opacity-60">
                            Selected AI, computer vision, and software projects listed on my resume.
                        </p>
                    </div>
                </div>
            </section>

            <section className="px-6 md:px-8 pb-20 md:pb-40">
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 md:gap-8">
                    {projectsData.map((project) => (
                        <Link
                            href={`/work/${project.slug}`}
                            key={project.slug}
                            className="project-card group flex flex-col transition-transform duration-500 hover:scale-[1.02] cursor-none break-inside-avoid"
                            data-cursor="large"
                        >
                            <div className="relative w-full overflow-hidden">
                                <SmartImage
                                    src={project.heroImage || project.images?.[0] || ""}
                                    alt={project.title}
                                    width={project.thumbW}
                                    height={project.thumbH}
                                    className="transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/20 transition-colors duration-500" />
                            </div>
                            <div className="pt-4 pb-8">
                                <div className="flex justify-between items-start gap-4">
                                    <h3 className="text-base font-display font-bold uppercase leading-tight">
                                        {project.title}
                                    </h3>
                                    <span className="text-[10px] uppercase tracking-widest opacity-50 whitespace-nowrap mt-1">
                                        {project.role}
                                    </span>
                                </div>
                                {project.concept && (
                                    <p className="text-sm text-slate-500 mt-2 leading-relaxed line-clamp-2">
                                        {project.concept}
                                    </p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    );
}
