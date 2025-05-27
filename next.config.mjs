/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images: {
    domains: ['images.pexels.com', 'res.cloudinary.com', 'images.unsplash.com'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  httpTimeout: 60000, // Increase timeout to 60 seconds
  experimental: {
    largePageDataBytes: 128 * 100000, // Increase limit for large pages
  }
};

export default nextConfig;
