"use client";

import { useRef } from "react";
import { useParams, redirect } from "next/navigation";
import Link from "next/link";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { articlesData, ArticleSection } from "@/data/articles";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function renderSection(section: ArticleSection, idx: number) {
    switch (section.type) {
        case "paragraph":
            return (
                <p
                    key={idx}
                    className="font-sans text-lg md:text-xl leading-relaxed text-slate-700 mb-8"
                >
                    {section.content}
                </p>
            );
        case "heading":
            return (
                <h2
                    key={idx}
                    className="text-3xl md:text-4xl font-display font-bold uppercase tracking-tighter leading-[0.95] mt-16 mb-8"
                >
                    {section.content}
                </h2>
            );
        case "subheading":
            return (
                <h3
                    key={idx}
                    className="text-2xl font-display font-bold uppercase tracking-tight mt-12 mb-6"
                >
                    {section.content}
                </h3>
            );
        case "image":
            return (
                <figure key={idx} className="my-12 md:my-16 -mx-4 md:-mx-8 lg:-mx-16">
                    <div className="aspect-video bg-zinc-200 overflow-hidden">
                        <img
                            src={section.src}
                            alt={section.alt || ""}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </div>
                    {section.caption && (
                        <figcaption className="px-4 md:px-8 lg:px-16 mt-4 text-sm text-slate-500 italic font-sans">
                            {section.caption}
                        </figcaption>
                    )}
                </figure>
            );
        case "quote":
            return (
                <blockquote
                    key={idx}
                    className="my-12 md:my-16 border-l-4 border-primary pl-8 md:pl-12"
                >
                    <p className="text-2xl md:text-3xl font-display font-medium italic leading-snug tracking-tight text-slate-800">
                        &quot;{section.content}&quot;
                    </p>
                    {section.author && (
                        <cite className="block mt-6 text-sm font-sans font-bold uppercase tracking-widest not-italic text-primary">
                            — {section.author}
                        </cite>
                    )}
                </blockquote>
            );
        case "list":
            return (
                <ul key={idx} className="my-8 space-y-4 pl-0">
                    {section.items?.map((item, i) => (
                        <li
                            key={i}
                            className="font-sans text-lg text-slate-700 leading-relaxed flex items-start gap-4"
                        >
                            <span className="text-primary font-bold mt-1 text-sm">●</span>
                            {item}
                        </li>
                    ))}
                </ul>
            );
        default:
            return null;
    }
}

export default function ArticleDetail() {
    const params = useParams();
    const slug = params.slug as string;
    const article = articlesData.find((a) => a.slug === slug);
    const container = useRef<HTMLElement>(null);

    const currentIndex = articlesData.findIndex((a) => a.slug === slug);
    const nextArticle = articlesData[(currentIndex + 1) % articlesData.length];

    useGSAP(
        () => {
            if (!article) return;

            window.scrollTo(0, 0);
            ScrollTrigger.refresh();

            gsap.from(".article-title", {
                y: 120,
                opacity: 0,
                duration: 1.5,
                ease: "power4.out",
            });

            gsap.from(".article-meta", {
                y: 30,
                opacity: 0,
                duration: 1,
                ease: "power3.out",
                delay: 0.3,
                stagger: 0.1,
            });

            gsap.from(".article-hero", {
                y: 60,
                opacity: 0,
                duration: 1.2,
                ease: "power3.out",
                delay: 0.5,
            });

            gsap.from(".article-content > *", {
                scrollTrigger: {
                    trigger: ".article-content",
                    start: "top bottom-=20%",
                },
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.05,
                ease: "power3.out",
            });
        },
        { scope: container, revertOnUpdate: true }
    );

    if (!article) {
        redirect("/journal");
    }

    return (
        <main ref={container} className="pt-32 pb-0">
            {/* Article Header */}
            <div className="px-6 md:px-10 max-w-4xl mx-auto">
                <div className="mb-8 flex items-center gap-4 article-meta">
                    <Link
                        href="/journal"
                        className="text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                    >
                        ← Journal
                    </Link>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-8 article-meta">
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
                <div className="overflow-hidden mb-12">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-medium leading-[0.9] tracking-tighter uppercase article-title">
                        {article.title}
                    </h1>
                </div>
                <p className="font-sans text-xl md:text-2xl text-slate-600 leading-relaxed max-w-3xl mb-16 article-meta">
                    {article.excerpt}
                </p>
            </div>

            {/* Hero Image */}
            <div className="article-hero px-6 md:px-10 max-w-6xl mx-auto mb-16 md:mb-24">
                <div className="aspect-video bg-zinc-200 overflow-hidden">
                    <img
                        src={article.heroImage}
                        alt={article.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* Article Content */}
            <div className="px-6 md:px-10 max-w-4xl mx-auto article-content">
                {article.content.map((section, idx) => renderSection(section, idx))}
            </div>

            {/* Author Box */}
            <div className="px-6 md:px-10 max-w-4xl mx-auto mt-20 mb-20 border-t border-black pt-12">
                <div className="flex items-start gap-8">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 block mb-2">
                            Written by
                        </span>
                        <h3 className="text-2xl font-display font-bold uppercase tracking-tight">
                            Nischal Chauhan
                        </h3>
                        <p className="font-sans text-base text-slate-600 mt-2 max-w-md leading-relaxed">
                            AI & Python Developer based in Ahmedabad, Gujarat, India.
                        </p>
                        <div className="flex gap-6 mt-4">
                            <a
                                href="https://www.linkedin.com/in/nischal-chauhan"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors"
                            >
                                Hire Me
                            </a>
                            <a
                                href="https://www.linkedin.com/in/nischal-chauhan"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors"
                            >
                                LinkedIn
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Next Article CTA */}
            {nextArticle && (
                <Link
                    href={`/journal/${nextArticle.slug}`}
                    className="group block bg-neutral-black text-white py-24 md:py-32 px-6 md:px-10"
                >
                    <div className="max-w-4xl mx-auto">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 block mb-8">
                            Next Article
                        </span>
                        <h2 className="text-3xl md:text-5xl lg:text-7xl font-display font-bold uppercase tracking-tighter leading-[0.9] flex items-end gap-4 transition-all group-hover:gap-10">
                            {nextArticle.title}
                            <span className="material-symbols-outlined shrink-0 text-3xl md:text-5xl group-hover:translate-x-4 transition-transform">
                                arrow_forward
                            </span>
                        </h2>
                    </div>
                </Link>
            )}
        </main>
    );
}
