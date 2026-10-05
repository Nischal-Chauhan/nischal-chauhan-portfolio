"use client";

import { useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projectsData } from "@/data/projects";
import CreativeButton from "@/components/CreativeButton";
import SmartImage from "@/components/SmartImage";

const HeroScene = dynamic(() => import("@/components/HeroScene"), { ssr: false });

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Home() {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      window.scrollTo(0, 0);
      ScrollTrigger.refresh();

      const tl = gsap.timeline();

      tl.from(".hero-text", {
        y: 150,
        opacity: 0,
        duration: 1.5,
        stagger: 0.15,
        ease: "power4.out",
      }).from(
        ".hero-sub",
        {
          opacity: 0,
          y: 30,
          duration: 1.2,
          stagger: 0.1,
          ease: "power2.out",
        },
        "-=0.8"
      );

      const projects = gsap.utils.toArray<HTMLElement>(".featured-project");
      projects.forEach((proj) => {
        gsap.from(proj, {
          y: 100,
          opacity: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: proj,
            start: "top bottom-=10%",
          },
        });
      });

      const images = gsap.utils.toArray<HTMLElement>(".parallax-img");
      images.forEach((img) => {
        gsap.to(img, {
          yPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: img.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    },
    { scope: container, revertOnUpdate: true }
  );

  const featuredProjects = projectsData
    .filter((p) => p.heroImage || (p.images && p.images.length > 0))
    .slice(0, 4);

  return (
    <main ref={container} className="pb-0 bg-background-light">
      {/* Hero Section */}
      <section data-cursor="none" className="px-6 md:px-12 lg:px-24 mb-20 md:mb-32 lg:mb-48 min-h-svh flex flex-col items-center justify-center relative z-10 text-center overflow-hidden">
        <HeroScene />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-40 bg-gradient-to-b from-transparent to-background-light" />
        {/* soft warm scrim behind the name for readability over the busy scene */}
        <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center">
          <div className="h-[58vh] w-[88vw] max-w-[1100px] bg-[radial-gradient(ellipse_at_center,rgba(255,250,242,0.42)_0%,rgba(255,250,242,0)_68%)]" />
        </div>

        <div className="relative z-10 w-full max-w-[1440px] mx-auto flex flex-col items-center">
          {/* Headline — the name; generous leading keeps the y/g descenders clear of the reveal masks */}
          <div className="overflow-hidden">
            <h1 className="hero-text font-display italic font-light text-[14.5vw] md:text-[11.5vw] lg:text-[min(10.5vw,24vh,10.5rem)] leading-[1.32] tracking-[-0.01em] text-[#241a10] [text-shadow:0_2px_26px_rgba(255,249,240,0.85)]">
              Nischal
            </h1>
          </div>
          <div className="overflow-hidden -mt-[0.36em]">
            <h1 className="hero-text font-display italic font-light text-[14.5vw] md:text-[11.5vw] lg:text-[min(10.5vw,24vh,10.5rem)] leading-[1.32] tracking-[-0.01em] text-[#241a10] [text-shadow:0_2px_26px_rgba(255,249,240,0.85)]">
              Chauhan
            </h1>
          </div>

          <p className="hero-sub mt-5 md:mt-7 max-w-xl text-balance text-base md:text-lg font-medium leading-relaxed text-[#2a1d11]">
            AI & Python Developer building practical AI solutions and reliable applications.
          </p>

          {/* Glass CTA — hero only (rest of site uses CreativeButton) */}
          <Link
            href="/work"
            className="hero-sub liquid-glass group mt-6 md:mt-7 inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-[11px] md:text-xs font-bold uppercase tracking-[0.16em] text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.5),0_1px_12px_rgba(0,0,0,0.32)]"
          >
            View My Work
            <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-1">
              arrow_forward
            </span>
          </Link>
        </div>

        <div className="hero-sub absolute bottom-6 md:bottom-8 lg:bottom-10 inset-x-6 md:inset-x-12 lg:inset-x-24 z-20 flex items-center justify-between text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#473829]">
          <span className="group/avail flex items-center gap-2 text-[#241a10] cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 inline-flex rounded-full bg-green-500 animate-pulse-ring"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500 animate-pulse-dot"></span>
            </span>
            <span>AI &amp; Python Developer</span>
          </span>
          <span>Ahmedabad, Gujarat, India</span>
        </div>
      </section>

      {/* Featured Work */}
      <section className="px-6 md:px-12 lg:px-24 pb-20 md:pb-32 border-t border-black pt-12 md:pt-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12 md:mb-20 fade-up">
          <h2 className="text-sm font-bold uppercase tracking-widest opacity-50">(Selected Work)</h2>
          <Link
            href="/work"
            className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors border-b border-black pb-1"
          >
            View All
          </Link>
        </div>

        <div className="flex flex-col gap-16 md:gap-32 lg:gap-48">
          {featuredProjects.map((project, idx) => (
            <Link
              href={`/work/${project.slug}`}
              key={project.slug}
              className={`featured-project group grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center transition-transform duration-500 hover:scale-[1.02] cursor-none`}
              data-cursor="large"
            >
              <div
                className={`${idx % 2 === 0 ? "lg:col-span-8" : "lg:col-span-8 lg:order-last"} w-full relative overflow-hidden bg-zinc-200`}
              >
                <SmartImage
                  src={project.heroImage || project.images?.[0] || ""}
                  alt={project.title || project.slug}
                  width={project.thumbW}
                  height={project.thumbH}
                  className="group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
              </div>

              <div
                className={`${idx % 2 === 0 ? "lg:col-span-4" : "lg:col-span-4 lg:order-first"} flex flex-col`}
              >
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-4 text-primary">
                  0{idx + 1}
                  {project.role ? ` / ${project.role}` : ""}
                </span>
                <h3 className="text-2xl md:text-4xl lg:text-6xl font-display font-medium uppercase tracking-tighter leading-[0.9] mb-4 md:mb-6 transition-all duration-500">
                  {project.title || project.slug.replace(/-/g, " ")}
                </h3>
                {project.concept && (
                  <p className="text-sm md:text-base text-slate-600 mb-6 md:mb-10 max-w-sm leading-relaxed">
                    {project.concept}
                  </p>
                )}
                {!project.concept && <div className="mb-4"></div>}
                <CreativeButton tone="dark" className="w-fit px-7 py-4">
                  View Case
                </CreativeButton>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-32 w-full flex justify-center">
          <Link
            href="/work"
            className="group inline-flex items-center gap-4 font-bold uppercase tracking-widest text-sm hover:text-primary transition-colors"
          >
            Explore Full Gallery
            <span className="material-symbols-outlined transform group-hover:translate-x-2 transition-transform">
              arrow_forward
            </span>
          </Link>
        </div>
      </section>

      {/* Mission / Call to action */}
      <section className="py-32 md:py-48 px-6 md:px-12 lg:px-24 bg-black text-white selection:bg-primary selection:text-white">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          <span className="material-symbols-outlined text-primary mb-8 text-5xl">language</span>
          <h2 className="text-3xl md:text-5xl lg:text-7xl font-display font-bold tracking-tighter leading-[1.1] mb-12 uppercase">
            Building useful software with Python, AI, and dependable deployment workflows.
          </h2>
          <CreativeButton href="/contact" tone="light" className="px-10 py-5">
            Get in Touch
          </CreativeButton>
        </div>
      </section>
    </main>
  );
}
