'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './_components/Sidebar'
import Header from './_components/Header'
import useUserStore from '../../../stores/userStore'
import Loader from '../../_components/Loader'

const ProtectedRoutes = ({ children }) => {
  const router = useRouter()
  const { user, _hasHydrated } = useUserStore()

  useEffect(() => {
    if (_hasHydrated && (!user || user.role !== 'ADMIN')) {
      router.push('/admin/login')
    }
  }, [_hasHydrated, user, router])

  if (!_hasHydrated) {
    return <Loader />
  }

  if (!user || user.role !== 'ADMIN') {
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
