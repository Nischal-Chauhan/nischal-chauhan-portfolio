import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Work — 3D Website Portfolio & Case Studies",
    description:
        "Explore Nischal Chauhan’s AI/ML and software projects, including a face-recognition attendance system and safety hazard detection.",
    alternates: {
        canonical: "/work",
    },
    openGraph: {
        title: "Work — AI & Python Projects | Nischal Chauhan",
        description:
            "Selected AI, computer vision, and software projects by Nischal Chauhan.",
        url: "/work",
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

export default function WorkLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
