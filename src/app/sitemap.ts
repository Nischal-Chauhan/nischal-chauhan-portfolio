import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const staticPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 1.0,
            images: [`${baseUrl}/images/profile-placeholder.svg`],
        },
        {
            url: `${baseUrl}/work`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.8,
            images: [`${baseUrl}/images/profile-placeholder.svg`],
        },
        {
            url: `${baseUrl}/services`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: 0.8,
        },
        {
            url: `${baseUrl}/journal`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: "yearly" as const,
            priority: 0.6,
        },
    ];

    const projectSlugs = [
        "face-recognition-attendance-system",
        "safety-hazard-detection",
    ];

    const projectPages = projectSlugs.map((slug) => ({
        url: `${baseUrl}/work/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.8,
    }));

    const articleSlugs: string[] = [];

    const articlePages = articleSlugs.map((slug) => ({
        url: `${baseUrl}/journal/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    return [...staticPages, ...projectPages, ...articlePages];
}

