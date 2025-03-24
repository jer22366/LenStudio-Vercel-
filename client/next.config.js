/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  eslint: {
    // ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'loremflickr.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    unoptimized: true,
    domains: ['localhost'],
  },
  // output: 'export', // don't use with `next start` or api route
  // distDir: 'dist',
  // avoid cors with proxy
  async rewrites() {
    return [
      {
        // 所有 API 請求轉發到後端
        source: '/api/:path*',
        destination: 'https://lenstudio.onrender.com/api/:path*',
        // 移除 has 條件限制
      },
      {
        // 如果需要專門處理 froala-upload
        source: '/api/froala-upload/:path*',
        destination: '/api/froala-upload/:path*',  // 保持在前端處理
      }
    ]
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
      use: [
        {
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'static/media/[name].[hash:8].[ext]',
          },
        },
      ],
    });

    return config;
  },
}

module.exports = nextConfig
