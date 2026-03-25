import * as Sentry from '@sentry/nextjs'

// Only initialize on the client side
if (typeof window !== 'undefined') {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // In production, we reduce this to 0.1 (10%) to save costs and improve performance
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    // Only enable debug mode in development
    debug: process.env.NODE_ENV === 'development',

    // Capture Replay for 10% of all sessions,
    // plus for 100% of sessions with an error
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,

    integrations: [
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // You can remove this option if you're not planning to use the Sentry Session Replay feature:
    beforeSend(event) {
      // Filter out any events you don't want to send to Sentry
      // For example, you might want to filter out errors from specific domains

      // Example: Ignore errors from browser extensions
      // if (event.exception?.values?.[0]?.value?.includes('chrome-extension://')) {
      //   return null
      // }

      return event
    },

    // This sets the environment
    environment: process.env.NODE_ENV || 'development',
  })
}
