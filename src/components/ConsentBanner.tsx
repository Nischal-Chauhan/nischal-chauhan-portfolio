"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";

// ---------------------------------------------------------------------------
// Analytics consent + GA4 loader.
//
// Rules this component enforces:
// - No GA script is loaded, no analytics requests are sent and no analytics
//   cookies are initialised before the visitor explicitly accepts.
// - Seeing the banner and continuing to browse is NOT consent.
// - Accept and Reject are equally prominent, independent choices.
// - The choice is persisted (localStorage, this browser only) and can be
//   changed or withdrawn at any time via the footer "Cookie Settings" control
//   (which fires the SETTINGS_EVENT dispatched below).
// - On withdrawal the GA scripts are unmounted, the official GA disable flag
//   is set (window["ga-disable-MEASUREMENT_ID"]), and previously set _ga*
//   cookies are cleared on a best-effort basis.
//
// Limitations (documented, not hidden):
// - The choice is per browser/device; it cannot be synced across devices.
// - Analytics cookies already set before withdrawal are removed from JS where
//   browsers permit; anything the browser holds back remains until cleared.
// - A consent banner is a technical control, not a guarantee of legal
//   compliance.
// ---------------------------------------------------------------------------

const STORAGE_KEY = "nischal-analytics-consent";
const GRANTED = "granted";
const DENIED = "denied";

// Fired by the footer "Cookie Settings" control to reopen the banner.
export const CONSENT_SETTINGS_EVENT = "nischal-consent-settings";

const MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{4,}$/i;

/** The measurement id must come from NEXT_PUBLIC_GA_MEASUREMENT_ID. Obvious
 * placeholders (all Xs) and empty values mean GA4 is never loaded. This is
 * exported so other components (Footer) can match the banner's behaviour
 * without duplicating the check. */
export function isAnalyticsConfigured(id: string | undefined): id is string {
    if (!id) return false;
    if (!MEASUREMENT_ID_PATTERN.test(id)) return false;
    return !/^G-?X+$/i.test(id);
}

type Consent = typeof GRANTED | typeof DENIED | null;

function readConsent(): Consent {
    try {
        const value = window.localStorage.getItem(STORAGE_KEY);
        return value === GRANTED || value === DENIED ? value : null;
    } catch {
        return null; // storage unavailable (private mode, blocked) → ask again
    }
}

function writeConsent(choice: Consent) {
    try {
        if (choice === null) {
            window.localStorage.removeItem(STORAGE_KEY);
        } else {
            window.localStorage.setItem(STORAGE_KEY, choice);
        }
    } catch {
        // If storage is unavailable the choice cannot persist; the banner
        // re-appears on the next visit, which errs on the safe side.
    }
}

/** Best-effort removal of cookies Google Analytics set in this browser. */
function clearAnalyticsCookies() {
    try {
        const host = window.location.hostname.replace(/^www\./, "");
        const expired = "; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax";
        for (const entry of document.cookie.split(/;\s*/)) {
            const name = entry.split("=")[0];
            if (name && /^_ga/.test(name)) {
                document.cookie = `${name}=${expired}`;
                // The same cookie may exist scoped to the parent domain.
                document.cookie = `${name}=${expired}; domain=.${host}`;
            }
        }
    } catch {
        // Non-essential: future collection is already prevented by the
        // ga-disable flag and script unmount.
    }
}

export default function ConsentBanner() {
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    const gaEnabled = isAnalyticsConfigured(gaId);

    const [consent, setConsent] = useState<Consent>(null);
    // False until the stored choice has been read, so the banner never
    // flashes for visitors who already chose.
    const [ready, setReady] = useState(false);
    // True while the visitor is explicitly using Cookie Settings to change
    // their decision. Banner visibility is derived: settings open, or no
    // decision made yet. It must not depend on an effect.
    const [settingsOpen, setSettingsOpen] = useState(false);
    // True once GA scripts have actually loaded in this page session; lets
    // withdrawal trigger cookie cleanup. A ref so changes do not re-render.
    const gaWasLoadedRef = useRef(false);

    useEffect(() => {
        // Reading localStorage is only possible after hydration, so the
        // stored choice is applied synchronously on mount. (Same pattern as
        // SmartImage; the lint rule flags every such read.)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setConsent(readConsent());
        setReady(true);

        const openSettings = () => setSettingsOpen(true);
        window.addEventListener(CONSENT_SETTINGS_EVENT, openSettings);
        return () => window.removeEventListener(CONSENT_SETTINGS_EVENT, openSettings);
    }, []);

    const choose = useCallback(
        (choice: typeof GRANTED | typeof DENIED) => {
            if (choice === DENIED) {
                const w = window as unknown as Record<string, unknown>;
                if (gaEnabled && gaId) w[`ga-disable-${gaId}`] = true;
                if (gaWasLoadedRef.current) clearAnalyticsCookies();
            } else {
                // Re-granting after a withdrawal must undo the disable flag set
                // above, or the re-mounted GA scripts would never collect again
                // in this session (consent silently ignored until reload).
                const w = window as unknown as Record<string, unknown>;
                if (gaEnabled && gaId) w[`ga-disable-${gaId}`] = false;
            }
            writeConsent(choice);
            // For DENIED, setting consent to DENIED unmounts the GA scripts
            // above; the disable flag set beforehand stops collection regardless.
            setConsent(choice);
            setSettingsOpen(false);
        },
        [gaEnabled, gaId]
    );

    // Derived, not set in an effect: the banner shows for undecided visitors
    // and while Cookie Settings is being used. Never for a decided visitor
    // who has not reopened settings.
    const bannerOpen = ready && gaEnabled && (settingsOpen || consent === null);

    return (
        <>
            {/* --- GA4 runtime, mounted only after explicit consent --- */}
            {gaEnabled && consent === GRANTED && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                        strategy="afterInteractive"
                        onLoad={() => {
                            gaWasLoadedRef.current = true;
                        }}
                    />
                    <Script id="ga-init" strategy="afterInteractive">
                        {`
                            window.dataLayer = window.dataLayer || [];
                            window.gtag = function gtag() { window.dataLayer.push(arguments); };
                            gtag('js', new Date());
                            gtag('config', '${gaId}');
                        `}
                    </Script>
                </>
            )}

            {/* --- Consent banner --- */}
            {gaEnabled && bannerOpen && (
                <div
                    role="dialog"
                    aria-label="Analytics cookies consent"
                    className="fixed inset-x-0 bottom-0 z-[100] bg-black text-white shadow-2xl"
                >
                    <div className="max-w-[1440px] mx-auto px-6 py-6 md:px-16 flex flex-col md:flex-row md:items-center gap-6">
                        <p className="font-sans text-sm text-white/70 leading-relaxed md:flex-1">
                            <span className="block text-[10px] uppercase tracking-[0.3em] text-white/40 mb-1 font-bold">
                                Analytics cookies
                            </span>
                            I&apos;d like to understand how visitors use this site with Google
                            Analytics. Nothing is measured while you are choosing. Accept to
                            allow analytics, or reject to browse without it. You can change
                            your decision anytime via &quot;Cookie Settings&quot; in the footer.
                        </p>
                        <div className="flex gap-4 flex-shrink-0">
                            <button
                                type="button"
                                onClick={() => choose(GRANTED)}
                                className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-black bg-white hover:bg-primary hover:text-white transition-colors cursor-none"
                            >
                                Accept
                            </button>
                            <button
                                type="button"
                                onClick={() => choose(DENIED)}
                                className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-white border border-white/40 hover:border-white hover:text-white transition-colors cursor-none"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}