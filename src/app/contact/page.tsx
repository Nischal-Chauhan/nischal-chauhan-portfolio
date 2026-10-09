"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CreativeButton from "@/components/CreativeButton";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// --- Web3Forms direct browser submission (Free plan) -----------------------
// Web3Forms' API is designed to be called from the browser for spam
// prevention; server-side proxying requires a paid plan and can return 403
// (docs.web3forms.com/getting-started/troubleshooting). The access key is a
// public key safe for client-side use — it is not a server secret.
const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";
const ACCESS_KEY_PLACEHOLDER = "your_web3forms_access_key";

const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY?.trim();
// Reject missing values and the .env.example placeholder: never POST with an
// empty or obviously unconfigured key.
const accessKeyConfigured = Boolean(accessKey) && accessKey !== ACCESS_KEY_PLACEHOLDER;

// Client-side validation mirrors the limits the form previously enforced in
// its API route (name 1–100, email ≤254 with format check, message 10–2000,
// all measured on trimmed values). NOTE: client-side validation and the
// honeypot are convenience spam deterrents that can be bypassed; direct
// submissions have no trusted server-side validation or rate limiting.
const NAME_MIN = 1;
const NAME_MAX = 100;
const EMAIL_MAX = 254;
const EMAIL_LOCAL_MAX = 64;
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;

/** Same pragmatic email check the API route used (single @, non-empty parts,
 * no consecutive dots, empty labels, or 1-char/non-alphabetic TLD). */
function isValidEmail(email: string): boolean {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!pattern.test(email)) return false;

    const at = email.indexOf("@");
    const local = email.slice(0, at);
    const domain = email.slice(at + 1);

    if (local.length > EMAIL_LOCAL_MAX) return false;
    if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) {
        return false;
    }

    if (domain.includes("..")) return false;
    const labels = domain.split(".");
    if (labels.some((label) => label.length === 0)) return false;
    const tld = labels[labels.length - 1];
    if (!/^[A-Za-z]{2,}$/.test(tld)) return false;

    return true;
}

function validateContactFields(fields: {
    name: string;
    email: string;
    message: string;
}): string | null {
    if (fields.name.length < NAME_MIN || fields.name.length > NAME_MAX) {
        return "Please enter your name (up to 100 characters).";
    }
    if (
        fields.email.length === 0 ||
        fields.email.length > EMAIL_MAX ||
        !isValidEmail(fields.email)
    ) {
        return "Please enter a valid email address (up to 254 characters).";
    }
    if (fields.message.length < MESSAGE_MIN || fields.message.length > MESSAGE_MAX) {
        return "Message must be between 10 and 2000 characters.";
    }
    return null;
}

export default function Contact() {
    const container = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
    const [errorMsg, setErrorMsg] = useState("");
    // Guards against accidental duplicate submissions (e.g. an already
    // disabled submit button still triggering via keyboard or racing clicks).
    const submittingRef = useRef(false);
    const router = useRouter();

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (submittingRef.current) return;
        submittingRef.current = true;
        setStatus("sending");
        setErrorMsg("");

        try {
            // Uncontrolled inputs: the real submitted values are read from the
            // form elements, since bots that autofill the DOM do not fire
            // React onChange.
            const form = e.currentTarget;

            const honeypotEl = form.elements.namedItem("honeypot");
            const honeypotValue = honeypotEl instanceof HTMLInputElement ? honeypotEl.value : "";

            // Honeypot filled → automated submission. Do not contact
            // Web3Forms; silently show a success-shaped outcome so bots learn
            // nothing. Humans never see this field, so real visitors are
            // unaffected.
            if (honeypotValue.trim().length > 0) {
                setStatus("success");
                router.push("/thank-you");
                return;
            }

            // Web3Forms' own spam protection: a hidden checkbox that
            // documentation requires to exist with display:none. Bots that
            // check every input get rejected by Web3Forms.
            const botcheckEl = form.elements.namedItem("botcheck");
            const botcheckChecked = botcheckEl instanceof HTMLInputElement && botcheckEl.checked;

            // Validate BEFORE any network request.
            const validationError = validateContactFields({
                name: formData.name.trim(),
                email: formData.email.trim(),
                message: formData.message.trim(),
            });
            if (validationError) {
                setStatus("error");
                setErrorMsg(validationError);
                return;
            }

            // Missing public access key: fail fast with a clear message
            // instead of sending an unusable request.
            if (!accessKeyConfigured) {
                setStatus("error");
                setErrorMsg(
                    "The contact form is not configured correctly. Please email me directly instead."
                );
                return;
            }

            const res = await fetch(WEB3FORMS_ENDPOINT, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    access_key: accessKey,
                    subject: `New inquiry from ${formData.name.trim()} — Nischal Chauhan portfolio`,
                    from_name: formData.name.trim(),
                    email: formData.email.trim(),
                    replyto: formData.email.trim(),
                    message: formData.message.trim(),
                    botcheck: botcheckChecked,
                }),
            });

            // Only a confirmed success:true response counts. Never navigate to
            // /thank-you on an HTTP error, a success:false payload, invalid
            // JSON, or a network failure.
            const data = await res.json().catch(() => null);

            if (res.ok && data && typeof data === "object" && (data as { success?: unknown }).success === true) {
                setStatus("success");
                router.push("/thank-you");
            } else {
                setStatus("error");
                const providerMessage =
                    data &&
                    typeof data === "object" &&
                    typeof (data as { body?: { message?: unknown } }).body?.message === "string"
                        ? (data as { body: { message: string } }).body.message
                        : typeof (data as { message?: unknown } | null)?.message === "string"
                          ? (data as { message: string }).message
                          : "";
                setErrorMsg(
                    providerMessage ||
                        "Sorry, the message could not be sent. Please try again or email me directly."
                );
            }
        } catch {
            setStatus("error");
            setErrorMsg("Network error. Please check your connection and try again.");
        } finally {
            submittingRef.current = false;
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
                                {/* Honeypot: visually hidden from human visitors and removed
                                    from the accessibility tree; bots that autofill every
                                    field will reveal themselves here. */}
                                <div className="hidden" aria-hidden="true">
                                    <label htmlFor="contact-honeypot">Company website</label>
                                    <input
                                        id="contact-honeypot"
                                        name="honeypot"
                                        type="text"
                                        tabIndex={-1}
                                        autoComplete="off"
                                        defaultValue=""
                                    />
                                    {/* Web3Forms' documented spam protection: a
                                        display:none checkbox; bots that check
                                        every input are rejected upstream. */}
                                    <input
                                        type="checkbox"
                                        name="botcheck"
                                        tabIndex={-1}
                                        autoComplete="off"
                                        style={{ display: "none" }}
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="group relative">
                                    <label htmlFor="contact-name" className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2">
                                        01/ Name
                                    </label>
                                    <input
                                        className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-slate-300 py-4 px-0 text-xl focus:ring-0 placeholder:text-slate-300 focus:border-primary focus:outline-none"
                                        placeholder="Your name"
                                        name="name"
                                        type="text"
                                        id="contact-name"
                                        required
                                        maxLength={100}
                                        autoComplete="name"
                                        aria-invalid={status === "error"}
                                        aria-describedby="contact-form-status"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="group relative">
                                    <label htmlFor="contact-email" className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2">
                                        02/ Email Address
                                    </label>
                                    <input
                                        className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-slate-300 py-4 px-0 text-xl focus:ring-0 placeholder:text-slate-300 focus:border-primary focus:outline-none"
                                        placeholder="email@example.com"
                                        name="email"
                                        type="email"
                                        id="contact-email"
                                        required
                                        maxLength={254}
                                        autoComplete="email"
                                        aria-invalid={status === "error"}
                                        aria-describedby="contact-form-status"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="group relative">
                                    <label htmlFor="contact-message" className="block text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2">
                                        03/ Message
                                    </label>
                                    <textarea
                                        className="w-full bg-transparent border-t-0 border-l-0 border-r-0 border-b border-slate-300 py-4 px-0 text-xl focus:ring-0 placeholder:text-slate-300 resize-none focus:border-primary focus:outline-none"
                                        placeholder="Tell me about your project"
                                        name="message"
                                        rows={4}
                                        id="contact-message"
                                        required
                                        maxLength={2000}
                                        aria-invalid={status === "error"}
                                        aria-describedby="contact-form-status"
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    ></textarea>
                                </div>

                                {/* Accessible status region: screen readers announce
                                    errors and the sending state as they change. */}
                                <div id="contact-form-status" role="status" aria-live="polite">
                                    {status === "error" && (
                                        <p className="text-red-500 text-sm" role="alert">
                                            {errorMsg}
                                        </p>
                                    )}
                                    <p className={status === "sending" ? "text-slate-500 text-sm" : "sr-only"}>
                                        {status === "sending" ? "Sending your message…" : ""}
                                    </p>
                                </div>

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
