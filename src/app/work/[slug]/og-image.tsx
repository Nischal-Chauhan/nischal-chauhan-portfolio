import { ImageResponse } from "next/og";
import { projectsData } from "@/data/projects";

export const PROJECT_OG_SIZE = { width: 1200, height: 630 } as const;
export const PROJECT_OG_CONTENT_TYPE = "image/png";

/**
 * Per-project share card, rendered by Next's bundled satori at build/request
 * time with its default font — deterministic, no network access.
 * Uses only existing project data: title, role, and tools. Nothing invented.
 */
export function projectOgImage(slug: string) {
    const project = projectsData.find((p) => p.slug === slug);

    if (!project) {
        return null;
    }

    return {
        alt: project.title,
        image: new ImageResponse(
            (
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#EFECE4",
                        color: "#241A10",
                    }}
                >
                    <div
                        style={{
                            width: 1104,
                            height: 554,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px dashed rgba(36, 26, 16, 0.25)",
                            gap: 24,
                            padding: 48,
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                fontSize: 24,
                                letterSpacing: 8,
                                color: "rgba(36, 26, 16, 0.6)",
                            }}
                        >
                            {project.role.toUpperCase()}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                fontSize: 72,
                                letterSpacing: -2,
                                maxWidth: 960,
                                textAlign: "center",
                            }}
                        >
                            {project.title}
                        </div>
                        <div
                            style={{
                                display: "flex",
                                width: 88,
                                height: 4,
                                backgroundColor: "#BB693A",
                            }}
                        />
                        <div
                            style={{
                                display: "flex",
                                fontSize: 26,
                                letterSpacing: 6,
                                color: "rgba(36, 26, 16, 0.6)",
                                maxWidth: 900,
                                textAlign: "center",
                            }}
                        >
                            {project.tools.toUpperCase()}
                        </div>
                    </div>
                </div>
            ),
            { ...PROJECT_OG_SIZE }
        ),
    };
}