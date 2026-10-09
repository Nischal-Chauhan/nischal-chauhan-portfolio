import { NextRequest, NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Server-side contact form handler.
//
// Security notes:
// - The Web3Forms access key is read from WEB3FORMS_KEY (server-only env var).
//   It is never sent to the client, logged, or embedded in responses.
// - All validation happens here; client-side validation is convenience only.
// - Error responses are deliberately generic so provider internals, request
//   details, and secrets are never reflected to the caller.
// ---------------------------------------------------------------------------

// Request body cap. The validated form fields are at most ~2.5 KB of text;
// this leaves generous headroom for JSON encoding of Unicode text while still
// rejecting oversized payloads. The body is read incrementally and truncated
// (rejected) the moment the cap is exceeded — Content-Length alone is not
// trusted, since a client can omit or lie about that header.
const MAX_BODY_BYTES = 16 * 1024;

// Field limits.
const NAME_MIN = 1;
const NAME_MAX = 100;
const EMAIL_MAX = 254;
const EMAIL_LOCAL_MAX = 64;
const MESSAGE_MIN = 10;
const MESSAGE_MAX = 2000;

// Recipient the form is delivered to.
const CONTACT_EMAIL = "chauhannischal311@gmail.com";

// Provider call timeout — Web3Forms must answer within this window or we fail.
const PROVIDER_TIMEOUT_MS = 10_000;

// Basic in-memory rate limiting: at most RATE_LIMIT_MAX submissions per IP per
// window. IMPORTANT LIMITATION: this state lives in the module scope of a
// single serverless instance. On serverless infrastructure each warm instance
// has its own copy, and instances are recycled, so this is a best-effort
// deterrent against abusive bursts — NOT a distributed, globally reliable
// rate limiter. Do not treat it as production-grade abuse protection.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 5;

// In-memory submission timestamps, keyed by client IP.
const submissions = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
    const now = Date.now();
    const recent = (submissions.get(key) ?? []).filter(
        (t) => now - t < RATE_LIMIT_WINDOW_MS
    );
    if (recent.length >= RATE_LIMIT_MAX) {
        submissions.set(key, recent); // refresh pruning while keeping the block
        return true;
    }
    recent.push(now);
    submissions.set(key, recent);

    // Opportunistic cleanup so the map cannot grow without bound on a
    // long-lived instance.
    if (submissions.size > 500) {
        for (const [ip, times] of submissions) {
            if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) {
                submissions.delete(ip);
            }
        }
    }
    return false;
}

/**
 * Extract a client IP from the request.
 *
 * Header priority:
 * 1. `x-real-ip` — set by Vercel's edge from the actual connection and not
 *    normally client-controllable, so it is preferred when present.
 * 2. `x-forwarded-for` leftmost entry — widely set, but with no trusted
 *    proxy in front of us a client can send arbitrary values here; treated
 *    as best-effort only.
 *
 * If neither header yields a plausible value we return null and skip rate
 * limiting entirely: we would otherwise end up rate limiting all headerless
 * clients against one shared bucket.
 *
 * Note (unchanged): the limiter itself stays in-memory per serverless
 * instance — best-effort burst deterrent, not distributed or tamper-proof.
 */
function getClientIp(req: NextRequest): string | null {
    for (const header of ["x-real-ip", "x-forwarded-for"]) {
        const value = req.headers.get(header);
        if (!value) continue;
        const candidate = value.split(",")[0]?.trim();
        // Basic sanity check — reject obviously malformed values. A normal
        // IPv4/IPv6 address contains only hex digits, dots and colons, but we
        // deliberately accept any short opaque token so proxy-specific
        // formats (e.g. IPv6 zone suffixes like %eth0) still rate-limit.
        if (
            candidate &&
            candidate.length <= 45 &&
            !/[\s\u0000-\u001F\u007F]/.test(candidate) &&
            /^[A-Za-z0-9:%.\-]+$/.test(candidate)
        ) {
            return candidate;
        }
    }
    return null;
}

/**
 * Read the request body incrementally, bailing out as soon as more than
 * `maxBytes` arrive. Returns null when the body is oversized or unreadable.
 */
async function readBodyWithLimit(
    req: NextRequest,
    maxBytes: number
): Promise<string | null> {
    // Cheap early-exit when a client declares an oversized body up front.
    const declared = Number(req.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > maxBytes) {
        return null;
    }
    if (!req.body) return null;

    const reader = req.body.getReader();
    const decoder = new TextDecoder();
    let total = 0;
    let text = "";
    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            total += value.byteLength;
            if (total > maxBytes) {
                reader.cancel().catch(() => undefined);
                return null;
            }
            text += decoder.decode(value, { stream: true });
        }
        text += decoder.decode();
        return text;
    } catch {
        return null;
    }
}

/** Reject C0 control characters (except \t, \n, \r) and DEL. */
function hasForbiddenControlChars(value: string): boolean {
    return /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value);
}

/**
 * Reasonable-format email check. Deliberately pragmatic, not RFC 5322-complete:
 * - exactly one @, non-empty local part and domain;
 * - no whitespace or control characters anywhere;
 * - domain has at least one dot, every dot-separated label is non-empty (so
 *   consecutive dots and leading/trailing dots in the domain fail);
 * - TLD is at least 2 characters (letters only);
 * - local part ≤ EMAIL_LOCAL_MAX, whole address ≤ EMAIL_MAX (checked upstream).
 *
 * Permissive by design in ways that cannot misdeliver mail: quoted local
 * parts, unusual-but-valid characters, and IDN/punycode domains all pass.
 */
function isValidEmail(email: string): boolean {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!pattern.test(email)) return false;

    const at = email.indexOf("@");
    const local = email.slice(0, at);
    const domain = email.slice(at + 1);

    if (local.length > EMAIL_LOCAL_MAX) return false;
    // Local part must not be empty, start/end with a dot, or contain
    // consecutive dots. (Allowing a leading/trailing dot is not an unquoted
    // local-part form in practice and is rejected by providers anyway.)
    if (local.startsWith(".") || local.endsWith(".") || local.includes("..")) {
        return false;
    }

    // Every domain label must be non-empty (rejects consecutive dots,
    // leading/trailing dot) and the TLD must be alphabetic and ≥2 chars.
    if (domain.includes("..")) return false;
    const labels = domain.split(".");
    if (labels.some((label) => label.length === 0)) return false;
    const tld = labels[labels.length - 1];
    if (!/^[A-Za-z]{2,}$/.test(tld)) return false;

    return true;
}

interface ContactPayload {
    name: string;
    email: string;
    message: string;
}

/**
 * Validate and normalise the parsed JSON body.
 * Returns { ok: true, fields... }, { ok: true, honeypot: true }, or { ok: false }.
 */
function validatePayload(
    parsed: unknown
): { ok: true; honeypot: false; fields: ContactPayload } | { ok: true; honeypot: true } | { ok: false } {
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        return { ok: false };
    }
    const body = parsed as Record<string, unknown>;

    // Honeypot field: bots that blindly fill every input will populate this.
    // Humans never see it, so anything non-empty means an automated submit.
    const honeypot = body.honeypot;
    if (typeof honeypot === "string" && honeypot.trim().length > 0) {
        return { ok: true, honeypot: true };
    }

    const { name, email, message } = body;
    if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
        return { ok: false };
    }

    // Normal user text (including Unicode accents, emoji, CJK, etc.) passes
    // through normally — lengths are measured in UTF-16 code units, which is
    // the natural JS string length and consistent with the client maxLength caps.
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (
        trimmedName.length < NAME_MIN ||
        trimmedName.length > NAME_MAX ||
        hasForbiddenControlChars(trimmedName)
    ) {
        return { ok: false };
    }
    if (
        trimmedEmail.length === 0 ||
        trimmedEmail.length > EMAIL_MAX ||
        hasForbiddenControlChars(trimmedEmail) ||
        !isValidEmail(trimmedEmail)
    ) {
        return { ok: false };
    }
    if (
        trimmedMessage.length < MESSAGE_MIN ||
        trimmedMessage.length > MESSAGE_MAX ||
        hasForbiddenControlChars(trimmedMessage)
    ) {
        return { ok: false };
    }

    return {
        ok: true,
        honeypot: false,
        fields: { name: trimmedName, email: trimmedEmail, message: trimmedMessage },
    };
}

function jsonError(status: number, message: string) {
    return NextResponse.json({ success: false, error: message }, { status });
}

export async function POST(req: NextRequest) {
    try {
        // --- Content type -----------------------------------------------
        const contentType = req.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
        if (contentType !== "application/json") {
            return jsonError(415, "Unsupported content type.");
        }

        // --- Body size + parse ------------------------------------------
        const rawBody = await readBodyWithLimit(req, MAX_BODY_BYTES);
        if (rawBody === null) {
            return jsonError(413, "Request body too large.");
        }

        let parsed: unknown;
        try {
            parsed = JSON.parse(rawBody);
        } catch {
            return jsonError(400, "Malformed request.");
        }

        const result = validatePayload(parsed);
        if (!result.ok) {
            return jsonError(400, "Please check your details and try again. Name up to 100 characters, a valid email, and a message of 10–2000 characters are required.");
        }

        // --- Honeypot -----------------------------------------------------
        // Silently discard with a success-shaped response so the bot learns
        // nothing (including whether honeypot detection exists) and the
        // message is never forwarded to Web3Forms.
        if (result.honeypot) {
            return NextResponse.json({ success: true }, { status: 200 });
        }

        // --- Rate limit ---------------------------------------------------
        const clientIp = getClientIp(req);
        if (clientIp !== null && isRateLimited(clientIp)) {
            return jsonError(429, "Too many requests. Please try again later.");
        }

        // --- Provider key -------------------------------------------------
        const accessKey = process.env.WEB3FORMS_KEY;
        if (!accessKey) {
            // Safe failure: no key value or config details are exposed.
            console.error(
                "Contact route: WEB3FORMS_KEY is not configured. Contact submissions are disabled until it is set on this environment."
            );
            return jsonError(
                503,
                "The contact service is temporarily unavailable. Please email me directly instead."
            );
        }

        // --- Provider call -------------------------------------------------
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), PROVIDER_TIMEOUT_MS);

        let response: Response;
        try {
            response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    access_key: accessKey,
                    subject: `New inquiry from ${result.fields.name} — Nischal Chauhan portfolio`,
                    from_name: result.fields.name,
                    email: result.fields.email,
                    replyto: result.fields.email,
                    message: result.fields.message,
                    to: CONTACT_EMAIL,
                }),
                signal: controller.signal,
            });
        } catch (error) {
            // Timeout/abort or network failure — reported generically.
            console.error(
                "Contact route: provider request failed.",
                error instanceof Error ? error.name : "unknown"
            );
            return jsonError(502, "The message could not be sent. Please try again shortly.");
        } finally {
            clearTimeout(timeoutId);
        }

        // Validate the provider HTTP status AND response body before
        // reporting success. Provider error payloads are never forwarded.
        let providerData: unknown;
        try {
            providerData = await response.json();
        } catch {
            providerData = null;
        }

        if (response.ok && providerData && typeof providerData === "object" && (providerData as { success?: unknown }).success === true) {
            return NextResponse.json({ success: true }, { status: 200 });
        }

        // Non-success from the provider: log only the status code (no provider
        // message body, which could echo request details), return a generic error.
        console.error("Contact route: provider returned a non-success response.", { status: response.status });
        return jsonError(502, "The message could not be sent. Please try again shortly.");
    } catch {
        return jsonError(500, "Something went wrong. Please try again.");
    }
}
