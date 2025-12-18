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
});

export const metadata: Metadata = {
  title: "Lumo - Modern E-Commerce Platform",
  description: "Next.js migration with TypeScript, Tailwind CSS, and Prisma",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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