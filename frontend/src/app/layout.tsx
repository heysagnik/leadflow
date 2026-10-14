import type { Metadata } from "next";
import { Hanken_Grotesk, Sora } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LeadFlow",
  description: "Track leads, log every discussion, and never miss a follow-up.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${hanken.variable} ${sora.variable} h-full`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
