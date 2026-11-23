import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "AirAware - AI-Powered Urban Air Quality Assistant",
  description:
    "Protect your family and make informed daily decisions with AI-driven air quality monitoring, intelligent health recommendations, and gamified clean-air habits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
