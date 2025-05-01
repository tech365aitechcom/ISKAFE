'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './_components/Sidebar'
import Header from './_components/Header'
import useUserStore from '../../../stores/userStore'

const ProtectedRoutes = ({ children }) => {
  const router = useRouter()
  const { user } = useUserStore()

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      router.push('/admin/login')
    }
  }, [user, router])

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
