import type { Metadata } from "next";

// Not listed on search engines or sitemaps: this page only exists as the
// post-submission destination for /contact.
export const metadata: Metadata = {
    title: "Thank You",
    description: "Thanks for reaching out — your message is on its way.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function ThankYouLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}