import type { Metadata } from "next";
import { TabNav } from "@/components/TabNav";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { Footer } from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://nishthaarora.duckdns.org"),
  title: {
    default: "Nishtha Arora — Senior Software Engineer",
    template: "%s · Nishtha Arora",
  },
  description: "Portfolio, resume, and projects for Nishtha Arora, Senior Software Engineer.",
  openGraph: {
    title: "Nishtha Arora — Senior Software Engineer",
    description: "Portfolio, resume, and projects for Nishtha Arora, Senior Software Engineer.",
    images: ["/og-image.png"],
    url: "https://nishthaarora.duckdns.org",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nishtha Arora — Senior Software Engineer",
    description: "Portfolio, resume, and projects for Nishtha Arora, Senior Software Engineer.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GoogleAnalytics />
        <header>
          <TabNav />
        </header>
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
