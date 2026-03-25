'use client'

import * as Sentry from '@sentry/nextjs'
import { useState, useEffect } from 'react'

export default function TestSentryPage() {
  const [message, setMessage] = useState('')
  const [sentryLoaded, setSentryLoaded] = useState(false)

  useEffect(() => {
    // Check if Sentry is loaded
    console.log('Checking Sentry...')
    console.log('Sentry object:', Sentry)
    console.log('Sentry.captureException:', typeof Sentry.captureException)
    console.log('NEXT_PUBLIC_SENTRY_DSN:', process.env.NEXT_PUBLIC_SENTRY_DSN)

    if (typeof Sentry !== 'undefined' && typeof Sentry.captureException === 'function') {
      setSentryLoaded(true)
      console.log('✓ Sentry is loaded!')
    } else {
      console.error('✗ Sentry is NOT loaded')
    }
  }, [])

  const testError = () => {
    try {
      throw new Error('Test error from Sentry integration!')
    } catch (error) {
      Sentry.captureException(error, {
        tags: {
          test: 'manual-error',
          source: 'test-page',
        },
        extra: {
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        },
      })
      setMessage('Error sent to Sentry! Check your Sentry dashboard.')
    }
  }

  const testMessage = () => {
    Sentry.captureMessage('Test message from Sentry integration', {
      level: 'info',
      tags: {
        test: 'manual-message',
        source: 'test-page',
      },
    })
    setMessage('Message sent to Sentry! Check your Sentry dashboard.')
  }

  const testFatalError = () => {
    // This will cause an actual uncaught error
    throw new Error('Uncaught error - This will be caught by Sentry error boundary!')
  }

  return (
    <div className='min-h-screen bg-gray-900 flex items-center justify-center p-8'>
      <div className='max-w-2xl w-full bg-gray-800 rounded-lg shadow-xl p-8'>
        <h1 className='text-3xl font-bold text-white mb-6'>
          Sentry Integration Test
        </h1>

        <div className={`mb-6 p-4 rounded ${sentryLoaded ? 'bg-green-900 border border-green-500' : 'bg-red-900 border border-red-500'}`}>
          <p className={`font-semibold ${sentryLoaded ? 'text-green-200' : 'text-red-200'}`}>
            {sentryLoaded ? '✓ Sentry is loaded and ready!' : '✗ Sentry is NOT loaded'}
          </p>
          {!sentryLoaded && (
            <p className='text-red-300 text-sm mt-2'>
              Please restart your Next.js dev server: Stop the server (Ctrl+C) and run `npm run dev` again
            </p>
          )}
        </div>

        <div className='space-y-4 mb-6'>
          <div>
            <h2 className='text-xl font-semibold text-purple-400 mb-2'>
              Test 1: Captured Exception
            </h2>
            <p className='text-gray-300 mb-3'>
              Manually capture and send an error to Sentry with custom tags and context.
            </p>
            <button
              onClick={testError}
              className='bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 transition-colors font-medium'
            >
              Send Test Error
            </button>
          </div>

          <div>
            <h2 className='text-xl font-semibold text-purple-400 mb-2'>
              Test 2: Captured Message
            </h2>
            <p className='text-gray-300 mb-3'>
              Send an informational message to Sentry (useful for logging).
            </p>
            <button
              onClick={testMessage}
              className='bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors font-medium'
            >
              Send Test Message
            </button>
          </div>

          <div>
            <h2 className='text-xl font-semibold text-purple-400 mb-2'>
              Test 3: Uncaught Exception
            </h2>
            <p className='text-gray-300 mb-3'>
              Throw an uncaught error that will be automatically captured by Sentry.
            </p>
            <button
              onClick={testFatalError}
              className='bg-orange-600 text-white px-6 py-3 rounded hover:bg-orange-700 transition-colors font-medium'
            >
              Throw Uncaught Error
            </button>
          </div>
        </div>

        {message && (
          <div className='bg-green-900 border border-green-500 text-green-200 px-4 py-3 rounded'>
            <p className='font-medium'>{message}</p>
            <p className='text-sm mt-2'>
              Go to:{' '}
              <a
                href='https://365aitech.sentry.io/issues/'
                target='_blank'
                rel='noopener noreferrer'
                className='underline hover:text-green-100'
              >
                Your Sentry Dashboard
              </a>
            </p>
          </div>
        )}

        <div className='mt-8 pt-6 border-t border-gray-700'>
          <h3 className='text-lg font-semibold text-white mb-3'>
            Testing Instructions:
          </h3>
          <ol className='list-decimal list-inside space-y-2 text-gray-300'>
            <li>Click any of the test buttons above</li>
            <li>Wait a few seconds for the event to be sent</li>
            <li>
              Open your{' '}
              <a
                href='https://365aitech.sentry.io/issues/'
                target='_blank'
                rel='noopener noreferrer'
                className='text-purple-400 underline hover:text-purple-300'
              >
                Sentry Dashboard
              </a>
            </li>
            <li>Check the &quot;Issues&quot; section for the new error/message</li>
            <li>Click on the issue to see all the context data</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
