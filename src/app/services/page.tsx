"use client";

import { useRef } from "react";
import CreativeButton from "@/components/CreativeButton";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Services() {
    const container = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            window.scrollTo(0, 0);
            ScrollTrigger.refresh();

            const tl = gsap.timeline({ defaults: { ease: "power4.out", duration: 1.5 } });

            tl.to(".services-title", {
                y: 0,
                opacity: 1,
            });

            const triggers = gsap.utils.toArray<HTMLElement>(".service-item");
            triggers.forEach((item) => {
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
            <div className="px-6 md:px-10 pb-20">
                <div className="overflow-hidden mb-20">
                    <h1 className="text-[14vw] md:text-[12vw] lg:text-[10vw] font-display font-medium leading-[0.85] tracking-tighter uppercase text-neutral-black opacity-0 translate-y-20 services-title">
                        Services
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-20 mb-32">
                    <div className="space-y-12">
                        <div className="service-item border-t border-black pt-8">
                            <span className="text-xs font-bold uppercase tracking-widest opacity-40">
                                01/ AI & MACHINE LEARNING
                            </span>
                            <h3 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-tighter mt-4 mb-3">
                                AI & Machine Learning Development
                            </h3>
                            <p className="font-sans text-lg mt-2 leading-relaxed text-slate-600">
                                Development work across machine learning, deep learning, computer vision, and generative AI, grounded in the skills listed on my resume. Project scope and model choices depend on the requirements.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-6">
                                <span className="text-[10px] uppercase tracking-widest bg-slate-100 px-3 py-1 font-bold">Python</span>
                                <span className="text-[10px] uppercase tracking-widest bg-slate-100 px-3 py-1 font-bold">FastAPI</span>
                                <span className="text-[10px] uppercase tracking-widest bg-slate-100 px-3 py-1 font-bold">Flask</span>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-12">
                        <div className="service-item border-t border-black pt-8">
                            <span className="text-xs font-bold uppercase tracking-widest opacity-40">
                                02/ BACKEND & REST APIs
                            </span>
                            <h3 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-tighter mt-4 mb-3">
                                Python Backend Development
                            </h3>
                            <p className="font-sans text-lg mt-2 leading-relaxed text-slate-600">
                                Python application and REST API development using frameworks and tools listed on my resume, including FastAPI and Flask. Implementation details are agreed for each project.
                            </p>
                            <div className="flex flex-wrap gap-2 mt-6">
                                <span className="text-[10px] uppercase tracking-widest bg-slate-100 px-3 py-1 font-bold">Python</span>
                                <span className="text-[10px] uppercase tracking-widest bg-slate-100 px-3 py-1 font-bold">FastAPI</span>
                                <span className="text-[10px] uppercase tracking-widest bg-slate-100 px-3 py-1 font-bold">Flask</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="service-item border-t border-black pt-8 mb-32 max-w-3xl">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-40">
                        03/ DEVOPS & DEPLOYMENT
                    </span>
                    <h3 className="text-2xl md:text-3xl font-display font-bold uppercase tracking-tighter mt-4 mb-3">
                        Application Deployment & Operations
                    </h3>
                    <p className="text-lg mt-2 leading-relaxed text-slate-600">
                        Deployment and operations experience covering Linux server administration, Docker, Nginx, Apache, PM2, SSL certificates, SMTP services, application monitoring, and CI/CD workflows.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-6">
                        <span className="text-[10px] uppercase tracking-widest bg-slate-100 px-3 py-1 font-bold">Docker</span>
                        <span className="text-[10px] uppercase tracking-widest bg-slate-100 px-3 py-1 font-bold">Linux</span>
                        <span className="text-[10px] uppercase tracking-widest bg-slate-100 px-3 py-1 font-bold">Nginx / Apache</span>
                        <span className="text-[10px] uppercase tracking-widest bg-slate-100 px-3 py-1 font-bold">CI/CD</span>
                    </div>
                </div>

                <div className="service-item border-t border-black pt-12 text-center">
                    <p className="text-lg text-slate-500 mb-6">Have a technical project or opportunity in mind?</p>
                    <CreativeButton href="/contact" tone="dark" className="px-10 py-5">
                        Get in Touch
                    </CreativeButton>
                </div>
            </div>
        </main>
    );
}
