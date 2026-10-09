import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description:
        "How this portfolio collects, uses, and forwards contact-form data, and how analytics consent is handled.",
    alternates: {
        canonical: "/privacy",
    },
};

export default function PrivacyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}