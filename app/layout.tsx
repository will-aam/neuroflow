import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import { DonationButton } from "@/components/donation-button";
import { PWAUpdater } from "@/components/pwa-updater"; // <-- Importado o nosso monitor de atualização

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

// Variável de versão para facilitar o "Cache Busting" no futuro.
// Quando trocar as imagens ou precisar forçar a troca, mude para "?v=2", "?v=3", etc.
const VERSION = "?v=1";

export const metadata: Metadata = {
  title: "NeuroFlow - Hábitos para mentes neurodivergentes",
  description:
    "App de acompanhamento de hábitos projetado para TDAH. Mini-hábitos, modos de energia e design de baixa carga cognitiva.",

  manifest: `/manifest.json${VERSION}`, // <-- Cache busting no manifesto
  icons: {
    icon: [
      {
        url: `/icon-light-32x32.png${VERSION}`, // <-- Cache busting nos ícones
        media: "(prefers-color-scheme: light)",
      },
      {
        url: `/icon-dark-32x32.png${VERSION}`,
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: `/favicon.ico${VERSION}`,
        type: "image/x-icon",
      },
    ],
    apple: `/apple-icon.png${VERSION}`,
  },
  // Configurações específicas para PWA no iOS (Safari)
  appleWebApp: {
    capable: true,
    title: "NeuroFlow",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
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
          {/* Adicionamos o PWAUpdater invisível aqui no topo da árvore */}
          <PWAUpdater />
          {children}
          <Toaster /> {/* <-- ADICIONE ISSO AQUI */}
        </ThemeProvider>
        <Analytics />
        <DonationButton />
      </body>
    </html>
  );
}
