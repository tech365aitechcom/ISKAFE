'use client'
import { KeySquare, ShieldUser, UserPen } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { ProfileForm } from './_components/ProfileForm'
import ChangePassword from './_components/ChangePassword'

export default function MyProfile() {
  const [type, setType] = useState('View Profile')

  return (
    <div className=' text-white p-8 flex justify-center relative overflow-hidden'>
      <div
        className='absolute -left-10 top-1/2 transform -translate-y-1/2 w-60 h-96 rounded-full opacity-70 blur-xl'
        style={{
          background:
            'linear-gradient(317.9deg, #6F113E 13.43%, rgba(111, 17, 62, 0) 93.61%)',
        }}
      ></div>
      <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
        <div className='flex justify-between items-center'>
          <h2 className='text-2xl font-semibold leading-8'>Account Settings</h2>
          <div className='flex space-x-8'>
            {type !== 'View Profile' && (
              <button
                className='text-white flex items-center gap-2 cursor-pointer'
                onClick={() => setType('View Profile')}
              >
                <ShieldUser />
                View Profile
              </button>
            )}
            {type !== 'Edit Profile' && (
              <button
                className='text-white flex items-center gap-2 cursor-pointer'
                onClick={() => setType('Edit Profile')}
              >
                <UserPen />
                Edit Profile
              </button>
            )}
            {type !== 'Change Password' && (
              <button
                className='text-white flex items-center gap-2 cursor-pointer'
                onClick={() => setType('Change Password')}
              >
                <KeySquare />
                Change Password
              </button>
            )}
          </div>
        </div>
        {type == 'Change Password' ? (
          <ChangePassword />
        ) : (
          <ProfileForm isEditable={type == 'Edit Profile'} />
        )}
      </div>
    </div>
  )
}
