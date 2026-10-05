import type { Metadata } from "next";
import { articlesData } from "@/data/articles";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const article = articlesData.find((a) => a.slug === slug);
    if (!article) return { title: "Article Not Found" };

    const description = article.metaDescription || article.excerpt;
    return {
        title: article.metaTitle || article.title,
        description,
        alternates: { canonical: `/journal/${slug}` },
        openGraph: {
            title: article.title,
            description,
            url: `/journal/${slug}`,
            type: "article",
            images: article.heroImage ? [{ url: article.heroImage, alt: article.title }] : undefined,
        },
        twitter: {
            card: "summary_large_image",
            title: article.title,
            description,
            images: article.heroImage ? [article.heroImage] : undefined,
        },
    };
}

// "Mar 2025" -> "2025-03-01"
function toISO(d: string): string | undefined {
    const months: Record<string, string> = {
        jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
        jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
    };
    const m = d.trim().toLowerCase().match(/([a-z]{3})[a-z]*\s+(\d{4})/);
    if (!m) return undefined;
    const mm = months[m[1]];
    return mm ? `${m[2]}-${mm}-01` : undefined;
}

export default async function ArticleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const article = articlesData.find((a) => a.slug === slug);

    const articleJsonLd = article
        ? {
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: article.title,
              description: article.metaDescription || article.excerpt,
              image: article.heroImage ? `${siteUrl}${article.heroImage}` : undefined,
              datePublished: toISO(article.date),
              articleSection: article.category,
              mainEntityOfPage: `${siteUrl}/journal/${slug}`,
              author: {
                  "@type": "Person",
                  "@id": `${siteUrl}/#person`,
                  name: "Nischal Chauhan",
                  url: siteUrl,
              },
              publisher: { "@id": `${siteUrl}/#person` },
          }
        : null;

    return (
        <>
            {articleJsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
                />
            )}
            {children}
        </>
    );
}
