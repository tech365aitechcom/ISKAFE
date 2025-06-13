'use client'
import React from 'react'
import Navbar from './_components/Navbar'
import Footer from './_components/Footer'
import useStore from '../../stores/useStore'
import Loader from '../_components/Loader'

const MainLayout = ({ children }) => {
  const { _hasHydrated } = useStore()

  if (!_hasHydrated) {
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
