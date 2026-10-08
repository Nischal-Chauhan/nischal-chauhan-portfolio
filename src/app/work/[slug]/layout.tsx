import type { Metadata } from "next";
import { projectsData } from "@/data/projects";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const project = projectsData.find((p) => p.slug === slug);

    if (!project) {
        return {
            title: "Project Not Found",
        };
    }

    const title = project.title;
    const description = project.narrative || project.concept || `${title} — A project by Nischal Chauhan, AI & Python Developer.`;
    const heroImage = project.heroImage || project.images?.[0];

    return {
        title: `${title} — Case Study`,
        description: description.slice(0, 160),
        alternates: {
            canonical: `/work/${slug}`,
        },
        openGraph: {
            title: `${title} | Nischal Chauhan — AI & Python Developer`,
            description: description.slice(0, 200),
            url: `/work/${slug}`,
            type: "article",
            images: heroImage
                ? [
                    {
                        url: heroImage,
                        alt: title,
                    },
                ]
                : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title: `${title} | Nischal Chauhan`,
            description: description.slice(0, 200),
            images: heroImage ? [heroImage] : undefined,
        },
    };
}

export default async function ProjectLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const { slug } = await params;
    const project = projectsData.find((p) => p.slug === slug);
    const heroImage = project?.heroImage || project?.images?.[0];

    const workJsonLd = project
        ? {
              "@context": "https://schema.org",
              "@type": "CreativeWork",
              name: project.title,
              description: project.concept || project.narrative || project.title,
              image: heroImage ? `${siteUrl}${heroImage}` : undefined,
              url: `${siteUrl}/work/${slug}`,
              keywords: project.tools,
              creator: {
                  "@type": "Person",
                  "@id": `${siteUrl}/#person`,
                  name: "Nischal Chauhan",
                  url: siteUrl,
              },
          }
        : null;

    return (
        <>
            {workJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(workJsonLd) }}
                />
            )}
            {children}
        </>
    );
}
