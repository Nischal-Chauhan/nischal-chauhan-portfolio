"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CreativeButton from "@/components/CreativeButton";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Contact() {
    const container = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");

    useGSAP(
        () => {
            window.scrollTo(0, 0);
            ScrollTrigger.refresh();

            const tl = gsap.timeline({ defaults: { ease: "power4.out", duration: 1.5 } });

            tl.to(".contact-title", {
                y: 0,
                opacity: 1,
            }).from(
                "form > div, .social-links-container > div",
                {
                    y: 30,
                    opacity: 0,
                    stagger: 0.1,
                    duration: 1,
                },
                "-=1"
            );
        },
        { scope: container, revertOnUpdate: true }
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("sending");
        setErrorMsg("");

        try {
            // Replace with your own email — formsubmit.co relays form submissions to it.
            const res = await fetch("https://formsubmit.co/ajax/chauhannischal311@gmail.com", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    message: formData.message,
                    _subject: `New inquiry from ${formData.name} — Nischal Chauhan portfolio`,
                    _template: "table",
                }),
            });

            const data = await res.json();

            if (data.success === "true" || data.success === true) {
                setStatus("success");
                setFormData({ name: "", email: "", message: "" });
            } else {
                setStatus("error");
                setErrorMsg(data.message || "Something went wrong. Please try again.");
            }
        } catch {
            setStatus("error");
            setErrorMsg("Network error. Please try again.");
        }
    };

    return (
        <div ref={container} className="relative flex min-h-screen flex-col">
            <main className="flex-1 px-6 md:px-16 pt-40 pb-20 max-w-[1440px] mx-auto w-full">
                <div className="mb-24">
                    <h1 className="text-[14vw] md:text-[12vw] lg:text-[10vw] font-display font-medium leading-[0.85] tracking-tighter uppercase mb-12 opacity-0 translate-y-20 contact-title">
                        Get in <br />
                        Touch
                    </h1>
                    <p className="font-sans text-lg md:text-xl max-w-xl text-slate-700 leading-relaxed">
                        For professional enquiries, collaboration opportunities, or technical discussions, feel free to get in touch.
                    </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 md:gap-24">
                    <div className="lg:col-span-7">
                        {status === "success" ? (
                            <div className="py-20 text-center">
                                <div className="text-6xl mb-6">✓</div>
                                <h2 className="text-3xl font-display font-bold mb-4">Message Sent!</h2>
                                <p className="font-sans text-lg text-slate-600 mb-8">
                                    Thanks for reaching out. I&apos;ll get back to you within 24 hours.
                                </p>
                                <CreativeButton onClick={() => setStatus("idle")} tone="dark" className="px-8 py-4">
                                    Send Another
                                    <span className="material-symbols-outlined text-lg transition-transform group-hover/cbtn:translate-x-1">
                                        arrow_forward
                                    </span>
                                </CreativeButton>
                            </div>
                        ) : (
                            <form className="flex flex-col gap-12" onSubmit={handleSubmit}>
                                <div className="group relative">
                                    <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2">
                                        01/ Name
                                    </label>
                                    <input
                                        className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-slate-300 py-4 px-0 text-xl focus:ring-0 placeholder:text-slate-300 focus:border-primary focus:outline-none"
                                        placeholder="Your name"
                                        name="name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="group relative">
                                    <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2">
                                        02/ Email Address
                                    </label>
                                    <input
                                        className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-slate-300 py-4 px-0 text-xl focus:ring-0 placeholder:text-slate-300 focus:border-primary focus:outline-none"
                                        placeholder="email@example.com"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="group relative">
                                    <label className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2">
                                        03/ Message
                                    </label>
                                    <textarea
                                        className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-slate-300 py-4 px-0 text-xl focus:ring-0 placeholder:text-slate-300 resize-none focus:border-primary focus:outline-none"
                                        placeholder="Tell me about your project"
                                        name="message"
                                        rows={4}
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    ></textarea>
                                </div>

                                {status === "error" && (
                                    <p className="text-red-500 text-sm">{errorMsg}</p>
                                )}

                                <div className="pt-4">
                                    <CreativeButton type="submit" disabled={status === "sending"} tone="dark" className="px-10 py-5">
                                        {status === "sending" ? "Sending…" : "Send Message"}
                                        <span className="material-symbols-outlined text-lg transition-transform group-hover/cbtn:translate-x-2">
                                            arrow_forward
                                        </span>
                                    </CreativeButton>
                                </div>
                            </form>
                        )}
                    </div>
                    <div className="lg:col-span-5 flex flex-col justify-between social-links-container">
                        <div className="mb-16">
                            <h2 className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-8 font-bold">
                                Direct
                            </h2>
                            <a
                                className="text-2xl sm:text-3xl md:text-4xl font-bold hover:text-primary transition-colors underline decoration-1 underline-offset-8"
                                href="mailto:chauhannischal311@gmail.com"
                            >
                                chauhannischal311@gmail.com
                            </a>
                        </div>
                        <div>
                            <h2 className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-8 font-bold">
                                Socials
                            </h2>
                            <ul className="flex flex-col gap-4">
                                <li>
                                    <a
                                        className="group flex items-center gap-4 text-lg font-medium hover:text-primary transition-colors"
                                        href="https://www.linkedin.com/in/nischal-chauhan"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <span className="text-[10px] text-slate-400 font-bold group-hover:text-primary transition-colors">
                                            02/
                                        </span>
                                        LinkedIn
                                    </a>
                                    <a href="https://github.com/Nischal-Chauhan" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">GitHub</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
