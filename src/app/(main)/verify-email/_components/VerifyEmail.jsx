'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../../../../constants'
import { enqueueSnackbar } from 'notistack'
import { useRouter, useSearchParams } from 'next/navigation'

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
        const response = await axios.get(
          `${API_BASE_URL}/auth/verify-email?email=${email}&token=${token}`
        )

        enqueueSnackbar(
          response.data.message || 'Email verified successfully!',
          {
            variant: 'success',
          }
        )

        setStatus({ loading: false, success: true, error: '' })

        // Redirect after 3 seconds
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      } catch (err) {
        const errMsg =
          err?.response?.data?.message || 'Email verification failed.'
        setStatus({ loading: false, success: false, error: errMsg })
        enqueueSnackbar(errMsg, { variant: 'error' })
        console.error('Verification error:', err)
      }
    }

    verifyEmailToken()
  }, [token, email, router])

  return (
    <div className='flex items-center justify-center h-screen w-full bg-black text-white px-4'>
      {status.loading ? (
        <div className='text-lg font-semibold'>Verifying your email...</div>
      ) : status.success ? (
        <div className='text-lg font-semibold text-green-400'>
          Email verified successfully! Redirecting to login...
        </div>
      ) : (
        <div className='text-lg font-semibold text-red-400'>{status.error}</div>
      )}
    </div>
  )
}

export default VerifyEmail
