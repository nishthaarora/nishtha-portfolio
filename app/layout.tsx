import type { Metadata } from "next";
import { TabNav } from "@/components/TabNav";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nishtha Arora",
  description: "Portfolio, resume, and projects.",
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
      </body>
    </html>
  );
}
