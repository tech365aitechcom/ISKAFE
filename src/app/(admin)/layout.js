import React from 'react'
import { Sidebar } from './_components/Sidebar'
import { ExportButton } from './_components/ExportButton'
import Header from './_components/Header'

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
        <Header />
        {children}
      </main>
    </div>
  )
}

export default AdminLayout
