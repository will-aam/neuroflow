import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public", // Pasta onde os arquivos do Service Worker serão gerados
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development", // Desativa no localhost para não atrapalhar o desenvolvimento
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

// Exporta a sua configuração envelopada com o PWA
export default withPWA(nextConfig);
