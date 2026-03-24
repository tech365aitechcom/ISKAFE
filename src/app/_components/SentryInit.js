'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function SentryInit() {
  useEffect(() => {
    // Initialize Sentry on the client side
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

      // Use tunnel to avoid ad-blockers and CORS issues
      tunnel: '/api/sentry-tunnel',

      // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
      // In production, we reduce this to 0.1 (10%) to save costs and improve performance
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

      // Setting this option to true will print useful information to the console while you're setting up Sentry.
      // Only enable debug mode in development
      debug: process.env.NODE_ENV === 'development',

      // Session Replay disabled for now (can cause CSP issues)
      // Uncomment below to enable Session Replay
      // replaysOnErrorSampleRate: 1.0,
      // replaysSessionSampleRate: 0.1,

      // integrations: [
      //   Sentry.replayIntegration({
      //     maskAllText: true,
      //     blockAllMedia: true,
      //   }),
      // ],

      // Filter events before sending
      beforeSend(event) {
        // Example: Ignore errors from browser extensions
        // if (event.exception?.values?.[0]?.value?.includes('chrome-extension://')) {
        //   return null
        // }

        return event
      },

      // This sets the environment
      environment: process.env.NODE_ENV || 'development',
    })

    console.log('✓ Sentry initialized from SentryInit component')
  }, [])

  return null
}
