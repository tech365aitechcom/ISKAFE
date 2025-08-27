'use client'
import React, { useEffect, useState } from 'react'
import Navbar from './_components/Navbar'
import Footer from './_components/Footer'
import useStore from '../../stores/useStore'
import Loader from '../_components/Loader'
import { validateTokenOnLoad } from '../../utils/authUtils'

const MainLayout = ({ children }) => {
  const { _hasHydrated, user, clearUser } = useStore()
  const [isValidating, setIsValidating] = useState(false)

  useEffect(() => {
    const validateToken = async () => {
      if (!_hasHydrated || !user?.token) return

      setIsValidating(true)
      try {
        const { isValid, shouldRedirect } = await validateTokenOnLoad()

        if (!isValid && shouldRedirect) {
          clearUser()
        }
      } catch (error) {
        console.error('Token validation error in main layout:', error)
        clearUser()
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [_hasHydrated, user?.id, clearUser])

  if (!_hasHydrated || isValidating) {
    return (
      <div className='flex items-center justify-center h-screen w-full bg-[#07091D]'>
        <Loader />
      </div>
    )
  }

  return (
    <div className=''>
      <Navbar />
      {children}
      <Footer />
    </div>
  )
}

export default MainLayout
