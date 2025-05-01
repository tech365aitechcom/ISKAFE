'use client'

import useUserStore from '../../../../stores/userStore'
import React from 'react'
import { ExportButton } from './ExportButton'

export default function Header() {
  const user = useUserStore((state) => state.user)
  return (
    <div className='flex items-center justify-between p-10'>
      <div>
        <h1 className='text-2xl font-semibold leading-8 text-white'>
          Welcome back, {user?.fullName}
        </h1>
        <p className='text-xs text-[#AEB9E1] leading-3.5'>
          Fight Platform Admin
        </p>
      </div>
      <ExportButton />
    </div>
  )
}
