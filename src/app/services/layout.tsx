import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Technical Skills & Services — Nischal Chauhan",
    description:
        "Explore Nischal Chauhan’s technical focus areas: AI/ML, Python backend development, deployment, and server operations.",
    alternates: {
        canonical: "/services",
    },
    openGraph: {
        title: "Technical Skills & Services | Nischal Chauhan",
        description:
            "Technical capabilities across AI/ML, Python APIs, Docker, Linux, web servers, and CI/CD workflows.",
        url: "/services",
    },
};

export default function ServicesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
