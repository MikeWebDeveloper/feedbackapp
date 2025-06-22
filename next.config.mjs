/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cloud.appwrite.io',
        port: '',
        pathname: '/v1/storage/buckets/*/files/*/preview**',
      }
    ]
  },
  experimental: {
    serverComponentsExternalPackages: ['node-appwrite']
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('node-appwrite')
    }
    return config
  }
}

export default nextConfig
