/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'sandbox.sslcommerz.com', 'securepay.sslcommerz.com'],
    },
  },
};

export default nextConfig;
