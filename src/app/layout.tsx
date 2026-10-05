import type { Metadata } from "next";
import { Noto_Serif_Display, Montserrat } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import Loader from "@/components/Loader";
import MusicPlayer from "@/components/MusicPlayer";

const notoSerifDisplay = Noto_Serif_Display({
  variable: "--font-display-next",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-sans-next",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Nischal Chauhan — AI & Python Developer | Python, AI/ML & Computer Vision",
    template: "%s | Nischal Chauhan — AI & Python Developer",
  },
  description:
    "Nischal Chauhan is an AI & Python Developer based in Ahmedabad, Gujarat, India, with experience in Python, AI/ML, computer vision, Linux server administration, Docker, and application deployment.",
  keywords: [
    "AI developer",
    "Python developer",
    "Machine Learning",
    "Computer Vision",
    "Deep Learning",
    "FastAPI",
    "Docker",
    "Linux",
    "AWS",
    "Nischal Chauhan",
    "CI/CD",
    "Nginx",
  ],
  authors: [{ name: "Nischal Chauhan", url: siteUrl }],
  creator: "Nischal Chauhan",
  publisher: "Nischal Chauhan",
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Nischal Chauhan — AI & Python Developer",
    title: "Nischal Chauhan — AI & Python Developer | Python, AI/ML & Computer Vision",
    description:
      "AI & Python Developer with experience in application deployment, Linux server administration, Docker, and AI/ML projects.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Nischal Chauhan — AI & Python Developer portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nischal Chauhan — AI & Python Developer",
    description:
      "AI & Python Developer focused on Python, machine learning, computer vision, and reliable application deployment.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}/#person`,
    name: "Nischal Chauhan",
    url: siteUrl,
    mainEntityOfPage: `${siteUrl}/about`,
    image: {
      "@type": "ImageObject",
      url: `${siteUrl}/images/profile-placeholder.svg`,
      width: 1086,
      height: 1448,
      caption: "Nischal Chauhan — AI & Python Developer",
    },
    jobTitle: "AI & Python Developer",
    description: "AI & Python Developer with experience in Python, AI/ML, computer vision, Linux, Docker, and application deployment.",
    email: "chauhannischal311@gmail.com",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ahmedabad",
      addressCountry: "India",
    },
    sameAs: [
      "https://www.linkedin.com/in/nischal-chauhan",
      "https://github.com/Nischal-Chauhan",
    ],
    knowsAbout: [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "Computer Vision",
      "Generative AI",
      "FastAPI",
      "Docker",
      "Linux Server Administration",
      "CI/CD Pipelines",
    ],
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: "Nischal Chauhan — AI & Python Developer",
    url: siteUrl,
    description: "Portfolio of Nischal Chauhan, AI & Python Developer.",
    inLanguage: "en",
    publisher: { "@id": `${siteUrl}/#person` },
    author: { "@id": `${siteUrl}/#person` },
  };

  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body
        className={`${notoSerifDisplay.variable} ${montserrat.variable} font-sans antialiased min-h-dvh flex flex-col w-full bg-background-light text-neutral-black`}
      >
        <Loader />
        <MusicPlayer />
        <CustomCursor />
        <Navigation />
        <div className="flex-1 flex flex-col w-full">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
