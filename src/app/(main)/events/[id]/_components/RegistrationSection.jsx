'use client'

import React from 'react'
import { Button } from '../../../../../../components/ui/button'
import Link from 'next/link'
import moment from 'moment'

export default function RegistrationSection({ eventId, padding, registrationDeadline }) {
  const isBeforeDeadline = () => {
    if (!registrationDeadline) return true // always show if deadline not set
    const now = moment()
    const deadline = moment(registrationDeadline)
    return now.isBefore(deadline)
  }

  return (
    <div className={`bg-[#1b0c2e] ${padding}`}>
      {isBeforeDeadline() && (
        <div className='mt-6 w-full'>
          <Link href={`/events/fighter-registration/${eventId}`}>
            <Button className='bg-gradient-to-r from-[#B02FEC] to-[#5141B5] hover:opacity-90 text-white px-6 py-3 w-full rounded-sm text-xl font-semibold'>
              Register as Fighter
            </Button>
          </Link>
          <p className='mt-2 text-base text-gray-400 text-center'>
            Fighter Fee Amount:
            <span className='text-white font-semibold text-xl ml-2'>
              $75.00
            </span>
          </p>
        </div>
      )}

      {isBeforeDeadline() && (
        <div className='mt-6 w-full'>
          <Link href={`/events/trainer-registration/${eventId}`}>
            <Button className='bg-gradient-to-r from-[#B02FEC] to-[#5141B5] hover:opacity-90 text-white px-6 py-3 w-full rounded-sm text-xl font-semibold'>
              Register As Trainer
            </Button>
          </Link>
          <p className='mt-2 text-base text-gray-400 text-center'>
            Trainer Fee Amount:
            <span className='text-white font-semibold text-xl ml-2'>
              $75.00
            </span>
          </p>
        </div>
      )}

      <div className='mt-6 w-full'>
        <Button className='bg-gradient-to-r from-[#B02FEC] to-[#5141B5] hover:opacity-90 text-white px-6 py-3 my-2 w-full rounded-sm text-xl font-semibold'>
          Buy Spectator Ticket
        </Button>
      </div>
    </div>
  )
}
