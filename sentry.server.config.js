import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
  // In production, we reduce this to 0.1 (10%) to save costs and improve performance
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  // Only enable debug mode in development
  debug: process.env.NODE_ENV === 'development',

  // This sets the environment
  environment: process.env.NODE_ENV || 'development',
})
