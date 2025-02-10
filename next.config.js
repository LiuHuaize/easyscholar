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
}

module.exports = nextConfig 