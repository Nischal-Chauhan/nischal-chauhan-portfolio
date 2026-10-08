import type { MetadataRoute } from "next";

// Crawlers explicitly welcomed — AI assistants surface sites they're allowed to read.
const AI_CRAWLERS = [
    "GPTBot",             // OpenAI (training)
    "OAI-SearchBot",      // OpenAI / ChatGPT search
    "ChatGPT-User",       // ChatGPT browsing on user request
    "ClaudeBot",          // Anthropic (training)
    "anthropic-ai",       // Anthropic
    "Claude-Web",         // Claude browsing
    "Claude-User",        // Claude on user request
    "PerplexityBot",      // Perplexity index
    "Perplexity-User",    // Perplexity on user request
    "Google-Extended",    // Google Gemini / Vertex
    "Applebot",           // Apple / Siri
    "Applebot-Extended",  // Apple Intelligence
    "Amazonbot",          // Amazon / Alexa
    "Bytespider",         // ByteDance / TikTok AI
    "CCBot",              // Common Crawl (feeds many LLMs)
    "Meta-ExternalAgent", // Meta AI
    "cohere-ai",          // Cohere
    "DuckAssistBot",      // DuckDuckGo AI
    "YouBot",             // You.com
    "Diffbot",
    "Timpibot",
];

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                // /_next/ is deliberately NOT disallowed: Googlebot needs /_next/static
                // CSS/JS to render pages. /api/ serves no crawlable content.
                disallow: ["/api/"],
            },
            {
                userAgent: AI_CRAWLERS,
                allow: "/",
                disallow: ["/api/"],
            },
        ],
        sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/sitemap.xml`,
        host: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    };
}
