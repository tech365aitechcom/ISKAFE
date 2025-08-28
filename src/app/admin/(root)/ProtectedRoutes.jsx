'use client'

import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './_components/Sidebar'
import Header from './_components/Header'
import useStore from '../../../stores/useStore'
import Loader from '../../_components/Loader'
import { roles } from '../../../constants/index'
import { validateTokenOnLoad } from '../../../utils/authUtils'

const ProtectedRoutes = ({ children }) => {
  const router = useRouter()
  const { user, _hasHydrated, clearUser } = useStore()
  const [isValidating, setIsValidating] = useState(true)
  const hasValidated = useRef(false)

  useEffect(() => {
    const validateAndSetup = async () => {
      if (!_hasHydrated || hasValidated.current) return

      if (!user) {
        router.push('/admin/login')
        setIsValidating(false)
        return
      }

      if (user?.role !== roles.superAdmin) {
        router.push('/')
        setIsValidating(false)
        return
      }

      // Validate token on load (only once when layout renders)
      try {
        hasValidated.current = true
        console.log('Validating token on layout render...')
        const { isValid, shouldRedirect } = await validateTokenOnLoad()
        
        if (!isValid && shouldRedirect) {
          clearUser()
          router.push('/admin/login')
          return
        }
        console.log('Token validation completed successfully')
      } catch (error) {
        console.error('Token validation error:', error)
        clearUser()
        router.push('/admin/login')
        return
      } finally {
        setIsValidating(false)
      }
    }

    validateAndSetup()
  }, [_hasHydrated, user?.token]) // Run when hydrated and when user token changes

  if (!_hasHydrated || isValidating) {
    return (
      <div className='flex items-center justify-center h-screen w-full bg-[#07091D]'>
        <Loader />
      </div>
    )
  }

  if (!user || user?.role !== roles.superAdmin) {
    return null
  }

  return (
    <div className='flex h-screen w-full inset-0 bg-[#07091D]'>
      <Sidebar />
      <main className='overflow-y-auto flex-1'>
        <Header />
        {children}
      </main>
    </div>
  )
}

export default ProtectedRoutes
