import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Journal — Technical Notes by Nischal Chauhan",
    description:
        "Technical notes and articles by Nischal Chauhan. Articles will be published here when available.",
    alternates: {
        canonical: "/journal",
    },
    openGraph: {
        title: "Journal — Technical Notes | Nischal Chauhan",
        description:
            "Technical articles and notes by Nischal Chauhan, AI & Python Developer.",
        url: "/journal",
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

export default function JournalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
