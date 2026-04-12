import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { DonationButton } from "@/components/donation-button";
import { PWAUpdater } from "@/components/pwa-updater";
import { Toaster } from "@/components/ui/sonner";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const VERSION = "?v=1";

export const metadata: Metadata = {
  title: "NeuroFlow - Hábitos para mentes neurodivergentes",
  description: "App de acompanhamento de hábitos projetado para TDAH.",
  manifest: `/manifest.json${VERSION}`,
  icons: {
    icon: [
      {
        url: `/icon-light-32x32.png${VERSION}`,
        media: "(prefers-color-scheme: light)",
      },
      {
        url: `/icon-dark-32x32.png${VERSION}`,
        media: "(prefers-color-scheme: dark)",
      },
      { url: `/favicon.ico${VERSION}`, type: "image/x-icon" },
    ],
    apple: `/apple-icon.png${VERSION}`,
  },
  appleWebApp: {
    capable: true,
    title: "NeuroFlow",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <PWAUpdater />
          {children}
          {/* Toaster do Sonner para capturar as notificações do Push Manager */}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
        <DonationButton />
      </body>
    </html>
  );
}
