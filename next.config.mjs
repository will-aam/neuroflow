import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  cleanupOutdatedCaches: true,
  // Alterado para false para permitir testes de notificação no localhost (pnpm dev)
  disable: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Suporte para Turbopack no Next.js 16
  turbopack: {},
};

export default withPWA(nextConfig);
