import { projectOgImage, PROJECT_OG_SIZE, PROJECT_OG_CONTENT_TYPE } from "./og-image";

// File-based conventions override the layout's explicit images, so project
// pages share their own crawler-compatible 1200x630 PNG card.

export const size = PROJECT_OG_SIZE;
export const contentType = PROJECT_OG_CONTENT_TYPE;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const generated = projectOgImage(slug);

    if (!generated) return null;

    return generated.image;
}

export async function generateImageMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const generated = projectOgImage(slug);

    if (!generated) return [];

    return [{ id: "default", alt: generated.alt, size: PROJECT_OG_SIZE, contentType: PROJECT_OG_CONTENT_TYPE }];
}