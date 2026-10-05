export interface Article {
    slug: string;
    date: string;
    category: string;
    title: string;
    excerpt: string;
    heroImage: string;
    readTime: string;
    metaTitle: string;
    metaDescription: string;
    content: ArticleSection[];
}

export interface ArticleSection {
    type: "paragraph" | "heading" | "subheading" | "image" | "quote" | "list";
    content?: string;
    items?: string[];
    src?: string;
    alt?: string;
    caption?: string;
    author?: string;
}

// No articles are listed until real posts are ready to publish.
export const articlesData: Article[] = [];
