import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Nischal Chauhan — AI & Python Developer",
    description:
        "Contact Nischal Chauhan for professional enquiries and technical opportunities. Based in Ahmedabad, Gujarat, India. Email: chauhannischal311@gmail.com",
    alternates: {
        canonical: "/contact",
    },
    openGraph: {
        title: "Contact Nischal Chauhan",
        description:
            "Contact Nischal Chauhan, AI & Python Developer. Email: chauhannischal311@gmail.com",
        url: "/contact",
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

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
