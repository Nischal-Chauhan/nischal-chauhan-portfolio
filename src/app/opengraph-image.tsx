import { ImageResponse } from "next/og";

export const alt = "Nischal Chauhan — AI & Python Developer portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Rendered at build time by Next's bundled satori + default font — fully
// deterministic, no network access required. Styling mirrors the site's
// existing og-image.svg design (cream background, dashed frame, terracotta
// accent) using the same color tokens.
export default function OpengraphImage() {
    return new ImageResponse(
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
                        gap: 28,
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            fontSize: 84,
                            letterSpacing: -2,
                        }}
                    >
                        Nischal Chauhan
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
                            fontSize: 30,
                            letterSpacing: 12,
                            color: "rgba(36, 26, 16, 0.6)",
                        }}
                    >
                        AI &amp; PYTHON DEVELOPER
                    </div>
                </div>
            </div>
        ),
        { ...size }
    );
}