import React from 'react'
import { Sidebar } from './_components/Sidebar'
import { ExportButton } from './_components/ExportButton'

export const metadata = {
  title: 'IKF - International Kickboxing Federation Admin',
  description:
    'The IKF is the world’s largest amateur and professional kickboxing organization.',
}

const AdminLayout = ({ children }) => {
  return (
    <div className='flex h-screen w-full inset-0 bg-[#07091D]'>
      <Sidebar />
      <main className='overflow-y-auto flex-1'>
        <div className='flex items-center justify-between p-10'>
          <div>
            <h1 className='text-2xl font-semibold leading-8 text-white'>
              Welcome back, John
            </h1>
            <p className='text-xs text-[#AEB9E1] leading-3.5'>
              Fight Platform Admin
            </p>
          </div>
          <ExportButton />
        </div>
        {children}
      </main>
    </div>
  )
}

export default AdminLayout
