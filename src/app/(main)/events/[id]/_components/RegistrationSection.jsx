'use client'

import React, { useState } from 'react'
import { Button } from '../../../../../../components/ui/button'
import CustomDialog from '../../../../_components/Dialog'
import FighterRegistrationForm from '../../_components/FighterRegistrationForm'
import TrainerRegistrationForm from '../../_components/TrainerRegistrationForm'

export default function RegistrationSection() {
  const [isOpen, setIsOpen] = useState(false)
  const [modalType, setModalType] = useState(null)

  const handleOpenModal = (type) => {
    setModalType(type)
    setIsOpen(true)
  }

  return (
    <>
      <div className='bg-[#1b0c2e] p-4'>
        <div className='mt-6 w-full'>
          <Button
            onClick={() => handleOpenModal('compete')}
            className='bg-gradient-to-r from-[#B02FEC] to-[#5141B5] hover:opacity-90 text-white px-6 py-3 w-full rounded-sm text-xl font-semibold'
          >
            Register To Compete
          </Button>
          <p className='mt-2 text-base text-gray-400 text-center'>
            Registration Fee:{' '}
            <span className='text-white font-semibold text-xl'>$75.00</span>
          </p>
        </div>

        <div className='mt-6 w-full'>
          <Button
            onClick={() => handleOpenModal('trainer')}
            className='bg-gradient-to-r from-[#B02FEC] to-[#5141B5] hover:opacity-90 text-white px-6 py-3 w-full rounded-sm text-xl font-semibold'
          >
            Register As Trainer
          </Button>
          <p className='mt-2 text-base text-gray-400 text-center'>
            Registration Fee:{' '}
            <span className='text-white font-semibold text-xl'>$75.00</span>
          </p>
        </div>
      </div>

      <div className='w-full'>
        <CustomDialog open={isOpen} onOpenChange={setIsOpen}>
          {modalType === 'compete' && (
            <FighterRegistrationForm setIsOpen={setIsOpen} />
          )}
          {modalType === 'trainer' && (
            <TrainerRegistrationForm setIsOpen={setIsOpen} />
          )}
        </CustomDialog>
      </div>
    </>
  )
}
