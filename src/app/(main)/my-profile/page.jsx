'use client'
import React, { useEffect, useState } from 'react'
import FighterProfileForm from './_components/FighterProfileForm'
import TrainerProfileForm from './_components/TrainerProfileForm'
import SpectatorProfileForm from './_components/SpectatorProfileForm'
import { API_BASE_URL, roles } from '../../../constants'
import useStore from '../../../stores/useStore'
import axios from 'axios'
import Loader from '../../_components/Loader'
export default function MyProfile() {
  const user = useStore((state) => state.user)
  const [userDetails, setUserDetails] = useState(null)
  const [loading, setLoading] = useState(false)

  const getUserDetails = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${API_BASE_URL}/auth/users/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )
      console.log('User details:', response.data)
      setUserDetails(response.data.data)
    } catch (error) {
      console.log('Error fetching user details:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && user.token) {
      getUserDetails()
    }
  }, [user])

  if (!user) {
    return (
      <div className='bg-transparent p-4'>
        <p className='text-center text-gray-500'>
          Please log in to view your profile.
        </p>
      </div>
    )
  }

  console.log('User in MyProfile:', user)

  const role = user.role

  if (loading) {
    return <Loader />
  }

  return (
    <div className='bg-transparent border-t border-[#D9E2F930]'>
      {role === roles.fighter ? (
        <FighterProfileForm
          userDetails={userDetails}
          onSuccess={getUserDetails}
        />
      ) : role === roles.trainer ? (
        <TrainerProfileForm
          userDetails={userDetails}
          onSuccess={getUserDetails}
        />
      ) : (
        <SpectatorProfileForm
          userDetails={userDetails}
          onSuccess={getUserDetails}
        />
      )}
    </div>
  )
}
