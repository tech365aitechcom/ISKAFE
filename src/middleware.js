import { NextResponse } from 'next/server'

export function middleware(request) {
  const response = NextResponse.next()

  // Set Content Security Policy headers to allow Stripe and Google Fonts
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data: https://fonts.gstatic.com https://js.stripe.com",
      "connect-src 'self' https://api.stripe.com https://iskabe.onrender.com http://localhost:5000",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    ].join('; ')
  )

  return response
}

export const config = {
  matcher: '/:path*',
}
