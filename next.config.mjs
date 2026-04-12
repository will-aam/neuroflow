import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  cleanupOutdatedCaches: true,
  // Mantemos como false para garantir que funcione tanto em dev quanto em produção
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
  // Suporte para o novo motor Turbopack do Next.js 16
  turbopack: {},
};

export default withPWA(nextConfig);
