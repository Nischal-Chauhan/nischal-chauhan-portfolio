"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function About() {
    const container = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            window.scrollTo(0, 0);
            ScrollTrigger.refresh();

            const tl = gsap.timeline({ defaults: { ease: "power4.out", duration: 1.5 } });

            tl.to(".story-title", {
                y: 0,
                opacity: 1,
            }).from(
                ".hero-image",
                {
                    scale: 1.2,
                    opacity: 0,
                    duration: 2,
                },
                "-=1"
            );

            const sections = gsap.utils.toArray<HTMLElement>(".fade-up-section");
            sections.forEach((section) => {
                gsap.from(section, {
                    y: 50,
                    opacity: 0,
                    duration: 1.2,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: section,
                        start: "top bottom-=10%",
                    },
                });
            });
        },
        { scope: container, revertOnUpdate: true }
    );

    return (
        <main ref={container} className="pt-32 pb-0">
            <div className="px-6 md:px-12 lg:px-24">
                {/* Hero Section */}
                <section className="mb-24 md:mb-32 overflow-hidden">
                    <div className="overflow-hidden mb-10 md:mb-14">
                        <h1 className="text-[14vw] md:text-[12vw] lg:text-[10vw] font-display font-medium leading-[0.85] tracking-tighter uppercase translate-y-20 opacity-0 story-title">
                            Story
                        </h1>
                    </div>

                    <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
                        <div className="lg:col-span-5 w-full max-w-sm sm:max-w-md lg:max-w-none mx-auto aspect-[3/4] overflow-hidden grayscale hover:grayscale-0 transition-all duration-700 rounded-lg bg-neutral-200">
                            <Image
                                src="/images/Me.jpeg"
                                alt="Black-and-white portrait of Nischal Chauhan, AI & Python Developer, wearing glasses and a dark suit, standing by a window"
                                width={853}
                                height={1280}
                                className="hero-image w-full h-full object-cover object-top"
                            />
                        </div>

                        <div className="lg:col-span-7 fade-up-section">
                            <span className="text-xs font-bold tracking-[0.2em] uppercase opacity-40">(Profile)</span>
                            <p className="font-sans mt-6 text-xl sm:text-2xl lg:text-3xl font-light leading-snug text-slate-800 tracking-tight">
                                Nischal Chauhan is an AI & Python Developer based in Ahmedabad, Gujarat, India, with a background in Machine Learning and Artificial Intelligence.
                            </p>
                            <p className="font-sans mt-6 text-base md:text-lg leading-relaxed text-slate-600">
                                His work and experience span Python, machine learning, deep learning, computer vision, Linux server administration, Docker, Nginx, Apache, application deployment, monitoring, and CI/CD workflows. He has worked as an AI & Python Developer at Swaraa Tech Solutions since July 2025.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Experience & Skills List */}
                <section className="py-20">
                    <div className="fade-up-section group border-t border-slate-900 py-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-start hover:bg-slate-900 hover:text-white transition-colors duration-300 px-4 -mx-4 cursor-default">
                        <div className="md:col-span-4">
                            <span className="text-sm font-bold tracking-widest">(01) EXPERIENCE</span>
                        </div>
                        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-bold uppercase text-xs mb-4 opacity-60">Currently</h4>
                                <p className="font-sans text-xl">
                                    AI & Python Developer
                                    <br />
                                    <span className="text-base opacity-70">Swaraa Tech Solutions · July 2025–Present</span>
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold uppercase text-xs mb-4 opacity-60">Focus Areas</h4>
                                <p className="font-sans text-xl">
                                    AI/ML & Application Deployment
                                    <br />
                                    <span className="text-base opacity-70">Python · Computer Vision · Linux · Docker</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="fade-up-section group border-t border-slate-900 py-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-start hover:bg-slate-900 hover:text-white transition-colors duration-300 px-4 -mx-4 cursor-default">
                        <div className="md:col-span-4">
                            <span className="text-sm font-bold tracking-widest">(02) TOOLS</span>
                        </div>
                        <div className="md:col-span-8 flex flex-wrap gap-x-12 gap-y-4">
                            <p className="font-sans text-xl">Python</p>
                            <p className="font-sans text-xl">Machine Learning</p>
                            <p className="font-sans text-xl">Deep Learning</p>
                            <p className="font-sans text-xl">Computer Vision</p>
                            <p className="font-sans text-xl">FastAPI / Flask</p>
                            <p className="font-sans text-xl">Docker</p>
                            <p className="font-sans text-xl">AWS</p>
                            <p className="font-sans text-xl">Linux / Nginx / Apache</p>
                            <p className="font-sans text-xl">SQL / Git / GitHub</p>
                        </div>
                    </div>

                    <div className="fade-up-section group border-t border-b border-slate-900 py-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-start hover:bg-slate-900 hover:text-white transition-colors duration-300 px-4 -mx-4 cursor-default">
                        <div className="md:col-span-4">
                            <span className="text-sm font-bold tracking-widest">(03) TECHNICAL FOCUS</span>
                        </div>
                        <div className="md:col-span-8 flex flex-wrap gap-x-12 gap-y-4">
                            <p className="font-sans text-xl">REST API Development</p>
                            <p className="font-sans text-xl">CI/CD Pipelines</p>
                            <p className="font-sans text-xl">Server Administration</p>
                            <p className="font-sans text-xl">Application Monitoring</p>
                            <p className="font-sans text-xl">SSL & SMTP Setup</p>
                            <p className="font-sans text-xl">WordPress Deployment</p>
                        </div>
                    </div>
                </section>

                {/* Education */}
                <section className="fade-up-section py-24 border-t border-slate-900">
                    <span className="text-sm font-bold tracking-widest">(04) EDUCATION</span>
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div>
                            <h3 className="text-xl md:text-2xl font-display font-bold">B.Tech — Machine Learning & Artificial Intelligence</h3>
                            <p className="mt-3 text-slate-600">Silver Oak University · 2024–2025</p>
                            <p className="mt-1 text-sm uppercase tracking-widest opacity-60">CGPA: 7.67</p>
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-display font-bold">Diploma in Engineering</h3>
                            <p className="mt-3 text-slate-600">Khyati School of Engineering · GTU Board · 2021</p>
                            <p className="mt-1 text-sm uppercase tracking-widest opacity-60">CGPA: 8.24</p>
                        </div>
                    </div>
                </section>

                {/* Certifications & Workshops */}
                <section className="fade-up-section py-24 border-t border-slate-900">
                    <span className="text-sm font-bold tracking-widest">(05) CERTIFICATIONS & WORKSHOPS</span>
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-x-12">
                        <div className="border-b border-slate-300 py-5">
                            <h3 className="font-bold">AI/ML for Geodata Analysis</h3>
                            <p className="mt-1 text-sm text-slate-600">ISRO · 19–23 August 2024</p>
                        </div>
                        <div className="border-b border-slate-300 py-5">
                            <h3 className="font-bold">Neural Network Uncovered: Hands-on Workshop</h3>
                            <p className="mt-1 text-sm text-slate-600">MNIT Jaipur · 1 July–31 December 2024</p>
                        </div>
                        <div className="border-b border-slate-300 py-5">
                            <h3 className="font-bold">Deep Learning Workshop</h3>
                            <p className="mt-1 text-sm text-slate-600">MNIT Jaipur · 25 June–2 July 2025</p>
                        </div>
                        <div className="border-b border-slate-300 py-5">
                            <h3 className="font-bold">Advanced MS-Excel (Government Certified)</h3>
                            <p className="mt-1 text-sm text-slate-600">Digital Multimedia Group · 2024</p>
                        </div>
                        <div className="border-b border-slate-300 py-5">
                            <h3 className="font-bold">Spoken English & Personality Development</h3>
                            <p className="mt-1 text-sm text-slate-600">7 November 2022</p>
                        </div>
                        <div className="border-b border-slate-300 py-5">
                            <h3 className="font-bold">Computer Concept (C.C.C.)</h3>
                            <p className="mt-1 text-sm text-slate-600">9 August 2018</p>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
