"use client";

import { useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { articlesData } from "@/data/articles";
import SmartImage from "@/components/SmartImage";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Journal() {
    const container = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            window.scrollTo(0, 0);
            ScrollTrigger.refresh();

            const tl = gsap.timeline({ defaults: { ease: "power4.out", duration: 1.5 } });

            tl.to(".journal-title", {
                y: 0,
                opacity: 1,
            });

            gsap.utils.toArray<HTMLElement>("article").forEach((item) => {
                gsap.from(item, {
                    scrollTrigger: {
                        trigger: item,
                        start: "top bottom-=10%",
                    },
                    y: 50,
                    opacity: 0,
                    duration: 1.2,
                    ease: "power3.out",
                });
            });
        },
        { scope: container, revertOnUpdate: true }
    );

    return (
        <main ref={container} className="pt-32 pb-0">
            <div className="px-6 md:px-10 pb-20 max-w-5xl mx-auto">
                <div className="overflow-hidden mb-20">
                    <h1 className="text-[14vw] md:text-[12vw] lg:text-[10vw] font-display font-medium leading-[0.85] tracking-tighter uppercase text-neutral-black opacity-0 translate-y-20 journal-title">
                        Journal
                    </h1>
                </div>

                <div className="space-y-0">
                    {articlesData.length === 0 ? (
                        <div className="border-t border-black py-16 max-w-2xl">
                            <p className="text-xl md:text-2xl font-display">Technical notes coming soon.</p>
                            <p className="mt-4 text-slate-600 leading-relaxed">This space will feature practical notes on Python, AI/ML, computer vision, deployment, and server operations once articles are ready to publish.</p>
                        </div>
                    ) : articlesData.map((article, idx) => (
                        <article
                            key={article.slug}
                            className={`group ${idx > 0 ? "border-t border-black" : ""} py-16`}
                        >
                            <Link href={`/journal/${article.slug}`} className="block md:grid md:grid-cols-12 md:gap-10 md:items-start">
                                <div className="md:col-span-4 mb-6 md:mb-0">
                                    <SmartImage
                                        src={article.heroImage}
                                        alt={article.title}
                                        width={640}
                                        height={640}
                                        className="group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>
                                <div className="md:col-span-8 space-y-4 md:space-y-6">
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                        <span className="text-xs font-bold uppercase tracking-widest opacity-40">
                                            {article.date}
                                        </span>
                                        <span className="text-xs font-bold uppercase tracking-widest text-primary">
                                            {article.category}
                                        </span>
                                        <span className="text-xs font-bold uppercase tracking-widest opacity-40">
                                            {article.readTime}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-medium uppercase tracking-tighter leading-[0.9] transition-all">
                                        {article.title}
                                    </h2>
                                    <p className="font-sans text-base md:text-lg max-w-2xl text-slate-600 leading-relaxed">
                                        {article.excerpt}
                                    </p>
                                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest group-hover:text-primary transition-colors">
                                        Read Article
                                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                                            arrow_forward
                                        </span>
                                    </span>
                                </div>
                            </Link>
                        </article>
                    ))}
                </div>
            </div>
        </main>
    );
}
