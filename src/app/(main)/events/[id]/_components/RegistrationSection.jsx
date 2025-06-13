'use client'

import React, { useState } from 'react'
import { Button } from '../../../../../../components/ui/button'
import Link from 'next/link'

export default function RegistrationSection({ eventId, padding }) {
  const [isOpen, setIsOpen] = useState(false)
  const [modalType, setModalType] = useState(null)

  const handleOpenModal = (type) => {
    setModalType(type)
    setIsOpen(true)
  }

  return (
    <>
      <div className={`bg-[#1b0c2e] ${padding}`}>
        <div className='mt-6 w-full'>
          <Link href={`/events/fighter-registration/${eventId}`}>
            <Button className='bg-gradient-to-r from-[#B02FEC] to-[#5141B5] hover:opacity-90 text-white px-6 py-3 w-full rounded-sm text-xl font-semibold'>
              Register To Compete
            </Button>
          </Link>
          <p className='mt-2 text-base text-gray-400 text-center'>
            Registration Fee:
            <span className='text-white font-semibold text-xl'>$75.00</span>
          </p>
        </div>

        <div className='mt-6 w-full'>
          <Link href={`/events/trainer-registration/${eventId}`}>
            <Button className='bg-gradient-to-r from-[#B02FEC] to-[#5141B5] hover:opacity-90 text-white px-6 py-3 w-full rounded-sm text-xl font-semibold'>
              Register As Trainer
            </Button>
          </Link>
          <p className='mt-2 text-base text-gray-400 text-center'>
            Registration Fee:{' '}
            <span className='text-white font-semibold text-xl'>$75.00</span>
          </p>
        </div>
      </div>
    </>
  )
}
