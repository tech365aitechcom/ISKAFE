'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './_components/Sidebar'
import Header from './_components/Header'
import useUserStore from '../../../stores/userStore'
import Loader from '../../_components/Loader'
import { roles } from '../../../constants/index'

const ProtectedRoutes = ({ children }) => {
  const router = useRouter()
  const { user, _hasHydrated } = useUserStore()

  useEffect(() => {
    if (_hasHydrated && !user) {
      // router.push('/admin/login')
    }
  }, [_hasHydrated, user, router])

  if (!_hasHydrated) {
    return (
      <div className='flex items-center justify-center h-screen w-full bg-[#07091D]'>
        <Loader />
      </div>
    )
  }

  // if (!user || user?.role !== roles.admin) {
  //   return null
  // }

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
