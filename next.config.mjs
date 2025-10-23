/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      's3-alpha-sig.figma.com',
      'ikf.onrender.com',
      'localhost',
      'example.com',
      'res.cloudinary.com',
      'ikf-assets.s3.amazonaws.com',
      'ikfgames.s3.ap-south-1.amazonaws.com',
      'flagcdn.com',
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data: https://fonts.gstatic.com https://js.stripe.com",
              "connect-src 'self' https://api.stripe.com https://iskabe.onrender.com http://localhost:5000",
              "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
            ].join('; '),
          },
        ],
      },
    ]
  },
}

export default nextConfig
