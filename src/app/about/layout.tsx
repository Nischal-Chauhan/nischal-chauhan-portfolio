import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "About Nischal Chauhan — AI & Python Developer",
    description:
        "Nischal Chauhan is an AI & Python Developer based in Ahmedabad, Gujarat, India, experienced in Python, AI/ML, computer vision, Linux, Docker, and application deployment.",
    alternates: {
        canonical: "/about",
    },
    openGraph: {
        title: "About Nischal Chauhan — AI & Python Developer",
        description:
            "AI & Python Developer experienced in Python, AI/ML, computer vision, Linux, Docker, and application deployment.",
        url: "/about",
        // Section-level openGraph replaces the root object (shallow merge), so
        // the generated PNG must be referenced here explicitly.
        images: [
            {
                url: "/opengraph-image",
                width: 1200,
                height: 630,
                alt: "Nischal Chauhan — AI & Python Developer portfolio",
            },
        ],
    },
};

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const profileJsonLd = {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        url: "/about",
        name: "About Nischal Chauhan — AI & Python Developer",
        mainEntity: { "@id": "/#person" },
        about: { "@id": "/#person" },
    };
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(profileJsonLd) }}
            />
            {children}
        </>
    );
}
