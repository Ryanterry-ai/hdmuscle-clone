import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import FloatingCTA from "@/components/FloatingCTA";

export const metadata: Metadata = {
  title: {
    default: "DigiAgency - Digital Solutions for Business Growth",
    template: "%s | DigiAgency",
  },
  description: "Premium yet affordable digital solutions helping local businesses grow online with websites, apps, and lead generation systems. Get your free consultation today!",
  keywords: ["web development", "mobile app development", "SEO", "digital marketing", "business automation", "UI/UX design", "digital agency"],
  authors: [{ name: "DigiAgency" }],
  openGraph: {
    title: "DigiAgency - Digital Solutions for Business Growth",
    description: "Premium yet affordable digital solutions helping local businesses grow online.",
    url: "https://diagency.com",
    siteName: "DigiAgency",
    locale: "en_IN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-full flex flex-col bg-white">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
        <FloatingCTA />
      </body>
    </html>
  );
}
