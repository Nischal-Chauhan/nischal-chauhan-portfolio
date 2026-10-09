export default function PrivacyPolicy() {
    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1 px-6 md:px-16 pt-40 pb-20 max-w-[1440px] mx-auto w-full">
                <h1 className="text-[12vw] md:text-[7vw] lg:text-[5.5vw] font-display font-medium leading-[0.85] tracking-tighter uppercase mb-16">
                    Privacy <br /> Policy
                </h1>

                <div className="max-w-3xl font-sans text-slate-700 leading-relaxed space-y-12">
                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-4 font-bold">
                            Overview
                        </h2>
                        <p>
                            This page explains what data this portfolio website collects and what
                            happens to it when you use it. It reflects how the site actually works —
                            nothing here describes collection that does not take place.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-4 font-bold">
                            Contact form
                        </h2>
                        <p className="mb-4">
                            The contact form collects three fields:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Your name</li>
                            <li>Your email address</li>
                            <li>Your message</li>
                        </ul>
                        <p className="mt-4">
                            These fields are used for one purpose only: to respond to your contact
                            request. You supply them voluntarily — if you prefer, you can reach me
                            directly by email instead of using the form.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-4 font-bold">
                            Where form submissions go
                        </h2>
                        <p>
                            Your name, email address, and message are transmitted directly from
                            your browser to Web3Forms, an email-delivery service, which delivers
                            your message to my email inbox: chauhannischal311@gmail.com. The
                            submission is not sent through a server route on this website first.
                            Web3Forms processes the form data solely for the purpose of
                            completing that delivery. A copy of your name, email address, and
                            message therefore sits in my email inbox once delivered.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-4 font-bold">
                            Hosting
                        </h2>
                        <p>
                            This website is hosted by Vercel. Serving the site automatically involves
                            Vercel processing standard technical request data generated when your
                            browser requests pages, such as your IP address and request details. The
                            scope of that processing is managed by Vercel under their own terms and
                            privacy policies, available on vercel.com.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-4 font-bold">
                            Analytics
                        </h2>
                        <p>
                            This website does not use analytics services. No Google Analytics or
                            other analytics or advertising tracking is loaded, and no
                            analytics consent banner is shown. This site does not set its own
                            tracking cookies; note that the hosting platform described above
                            may set cookies of its own under its own policies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-4 font-bold">
                            Browser storage
                        </h2>
                        <p>
                            This site does not use cookies of its own and does not store form
                            data in your browser. The only browser storage it creates is a
                            short-lived flag in your browser&apos;s session storage when the
                            opening animation plays, used so the intro does not replay on
                            every page of the same visit. It contains no personal information
                            and is not sent anywhere.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-4 font-bold">
                            What this policy does not cover
                        </h2>
                        <p>
                            Specific retention periods for the data described above are not
                            specified here. If you need to know how long something is stored, or if
                            you would like your contact details removed from my inbox, get in touch
                            and I will handle your request directly.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-4 font-bold">
                            Policy changes
                        </h2>
                        <p>
                            This page describes the site as currently built. If how this site
                            handles data changes, this policy will be updated to match.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-4 font-bold">
                            Contact
                        </h2>
                        <p>
                            For any privacy questions or requests regarding this site, contact:
                        </p>
                        <p className="mt-4">
                            Nischal Chauhan
                            <br />
                            <a
                                className="text-neutral-black font-bold underline decoration-1 underline-offset-4 hover:text-primary transition-colors"
                                href="mailto:chauhannischal311@gmail.com"
                            >
                                chauhannischal311@gmail.com
                            </a>
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}