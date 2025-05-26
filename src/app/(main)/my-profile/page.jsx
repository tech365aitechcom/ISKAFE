import React from 'react'
import FighterProfileForm from './_components/FighterProfileForm'
import TrainerProfileForm from './_components/TrainerProfileForm'
import SpectatorProfileForm from './_components/SpectatorProfileForm'
import { roles } from '../../../constants'

export default function MyProfile() {
  const role = roles.fighter
  return (
    <div className='bg-transparent border-t border-[#D9E2F930]'>
      {role === roles.fighter ? (
        <FighterProfileForm />
      ) : role === roles.trainer ? (
        <TrainerProfileForm />
      ) : (
        <SpectatorProfileForm />
      )}
    </div>
  )
}
