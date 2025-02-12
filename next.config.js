/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/search/:path*',
        destination: 'http://localhost:8000/search/:path*',
      },
    ]
  },
  // 忽略 ESLint 错误
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 忽略 TypeScript 错误
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 