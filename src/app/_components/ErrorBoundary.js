'use client'

import React from 'react'
import * as Sentry from '@sentry/nextjs'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    })
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className='flex items-center justify-center min-h-screen bg-gray-900'>
          <div className='text-center p-8 bg-gray-800 rounded-lg shadow-xl max-w-md'>
            <h2 className='text-2xl font-bold text-red-500 mb-4'>
              Oops! Something went wrong
            </h2>
            <p className='text-gray-300 mb-6'>
              We&apos;ve been notified of this error and will fix it as soon as
              possible.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className='bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition-colors'
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
