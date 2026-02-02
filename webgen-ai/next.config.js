/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['placehold.co'],
  },
  // Indispensable pour éviter les erreurs de parsing avec OpenAI/Undici
  experimental: {
    serverComponentsExternalPackages: ['undici', 'openai'],
  },
  // Force Webpack à ignorer ces modules pour éviter l'erreur "Unexpected token"
  webpack: (config) => {
    config.externals.push('undici');
    return config;
  },
};

module.exports = nextConfig;