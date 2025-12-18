import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ToastProvider } from "@/components/ui/toast-provider";
import { Providers } from "./providers";
import { ConditionalLayout } from "./conditional-layout";
import { SWRProvider } from "@/lib/swr-config";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap', // Show text immediately, swap font when loaded (faster perceived load)
  preload: true,
});

export const metadata: Metadata = {
  title: "LumoCart - Fast E-Commerce",
  description: "Lightning-fast mobile shopping experience",
  manifest: "/manifest.json",
  themeColor: "#dc2626",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LumoCart",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* PWA Meta Tags for Mobile */}
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.variable + " font-sans antialiased"}>
        <SWRProvider>
          <Providers>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
            <ToastProvider />
          </Providers>
        </SWRProvider>
      </body>
    </html>
  );
}