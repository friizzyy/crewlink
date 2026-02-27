/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.mapbox.com', 'images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  async redirects() {
    return [
      // Redirect legacy /app routes to /hiring (default for backward compatibility)
      {
        source: '/app',
        destination: '/hiring',
        permanent: true,
      },
      {
        source: '/app/map',
        destination: '/hiring/map',
        permanent: true,
      },
      {
        source: '/app/hire/:path*',
        destination: '/hiring/:path*',
        permanent: true,
      },
      {
        source: '/app/messages',
        destination: '/hiring/messages',
        permanent: true,
      },
      {
        source: '/app/notifications',
        destination: '/hiring/notifications',
        permanent: true,
      },
      {
        source: '/app/settings',
        destination: '/hiring/settings',
        permanent: true,
      },
      {
        source: '/app/profile',
        destination: '/hiring/profile',
        permanent: true,
      },
      {
        source: '/app/job/:id',
        destination: '/hiring/job/:id',
        permanent: true,
      },
      // Work-related /app routes redirect to /work
      {
        source: '/app/work/:path*',
        destination: '/work/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
