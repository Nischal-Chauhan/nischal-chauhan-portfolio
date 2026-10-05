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
    },
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
