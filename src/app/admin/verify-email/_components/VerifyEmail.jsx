'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../../../../constants'
import { enqueueSnackbar } from 'notistack'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

const VerifyEmail = () => {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const email = searchParams.get('email')
  const router = useRouter()

  const [status, setStatus] = useState({
    loading: true,
    success: false,
    error: '',
  })

  useEffect(() => {
    const verifyEmailToken = async () => {
      if (!token || !email) {
        setStatus({
          loading: false,
          success: false,
          error: 'Invalid verification link.',
        })
        enqueueSnackbar('Invalid verification link. Missing token or email.', {
          variant: 'error',
        })
        return
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, {
          email,
          token,
        })

        enqueueSnackbar(
          response.data.message || 'Email verified successfully!',
          {
            variant: 'success',
          }
        )

        setStatus({ loading: false, success: true, error: '' })

        setTimeout(() => {
          router.push('/admin/login')
        }, 3000)
      } catch (err) {
        const errMsg =
          err?.response?.data?.message || 'Email verification failed.'
        setStatus({ loading: false, success: false, error: errMsg })
        enqueueSnackbar(errMsg, { variant: 'error' })
      }
    }

    verifyEmailToken()
  }, [token, email, router])

  return (
    <div className='flex items-center justify-center h-screen bg-black px-4'>
      <Card className='w-full max-w-md bg-gray-900 text-white border-gray-800'>
        <CardHeader>
          <CardTitle className='text-center text-xl'>
            {status.loading && 'Verifying Email'}
            {status.success && 'Email Verified'}
            {!status.loading && !status.success && 'Verification Failed'}
          </CardTitle>
        </CardHeader>

        <CardContent className='text-center space-y-4'>
          {status.loading ? (
            <div className='flex flex-col items-center'>
              <Loader2 className='animate-spin text-white w-6 h-6 mb-2' />
              <p>Verifying your email...</p>
            </div>
          ) : status.success ? (
            <div className='flex flex-col items-center text-green-400'>
              <CheckCircle className='w-8 h-8 mb-2' />
              <p>Email verified successfully! Redirecting...</p>
              <p className='text-sm text-gray-400'>
                Not redirected?{' '}
                <Button
                  variant='link'
                  onClick={() => router.push('/admin/login')}
                  className='p-0 h-auto text-blue-400'
                >
                  Click here
                </Button>
              </p>
            </div>
          ) : (
            <div className='flex flex-col items-center text-red-400'>
              <XCircle className='w-8 h-8 mb-2' />
              <p>{status.error}</p>
              <Button
                variant='secondary'
                className='mt-4'
                onClick={() => router.push('/admin/login')}
              >
                Go to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default VerifyEmail
