'use client'
import { KeySquare, LogOut, ShieldUser, UserPen } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { ProfileForm } from './_components/ProfileForm'
import ChangePassword from './_components/ChangePassword'
import useStore from '../../../../stores/useStore'
import axios from 'axios'
import { API_BASE_URL } from '../../../../constants'

export default function MyProfile() {
  const [type, setType] = useState('View Profile')
  const { user, setUser } = useStore()
  const [userDetails, setUserDetails] = useState(null)

  const getUserDetails = async () => {
    const response = await axios.get(`${API_BASE_URL}/auth/users/${user._id}`, {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
    console.log('User details:', response.data)
    setUserDetails(response.data.data)
  }

  useEffect(() => {
    if (user && user.token) {
      getUserDetails()
    }
  }, [user])

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
          <h2 className='text-2xl font-semibold leading-8'>{type}</h2>
          <div className='flex space-x-8'>
            {type !== 'View Profile' && (
              <button
                className='text-white flex items-center gap-2'
                onClick={() => setType('View Profile')}
              >
                <ShieldUser />
                View Profile
              </button>
            )}
            {type !== 'Edit Profile' && (
              <button
                className='text-white flex items-center gap-2'
                onClick={() => setType('Edit Profile')}
              >
                <UserPen />
                Edit Profile
              </button>
            )}
            {type !== 'Change Password' && (
              <button
                className='text-white flex items-center gap-2'
                onClick={() => setType('Change Password')}
              >
                <KeySquare />
                Change Password
              </button>
            )}
            <button
              className='text-white flex items-center gap-2'
              onClick={() => {
                setUser(null)
              }}
            >
              <LogOut />
              Logout
            </button>
          </div>
        </div>
        {type == 'Change Password' ? (
          <ChangePassword />
        ) : (
          <ProfileForm
            isEditable={type == 'Edit Profile'}
            userDetails={userDetails}
            onSuccess={getUserDetails}
            setType={setType}
          />
        )}
      </div>
    </div>
  )
}
