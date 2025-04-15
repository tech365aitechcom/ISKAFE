import React from 'react'
import { Sidebar } from './_components/Sidebar'

const AdminLayout = ({ children }) => {
  return (
    <div className='flex h-screen inset-0 bg-gradient-to-br from-blue-50 to-indigo-100'>
      <Sidebar />
      <div className='flex-1 flex flex-col overflow-hidden'>
        <main className='flex-1 overflow-y-auto p-4 ml-0 md:ml-64'>
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
