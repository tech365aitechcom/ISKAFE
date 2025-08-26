'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../../../../../../components/ui/button'
import Link from 'next/link'
import moment from 'moment'
import { fetchTournamentSettings } from '../../../../../utils/eventUtils'
import Loader from '../../../../_components/Loader'
import TicketTable from './TicketTable'

export default function RegistrationSection({
  eventId,
  padding,
  registrationDeadline,
  showTable = false,
}) {
  const [tournamentSettings, setTournamentSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTournamentSettings = async () => {
      try {
        setLoading(true)
        const settings = await fetchTournamentSettings(eventId)
        setTournamentSettings(settings)
      } catch (error) {
        console.error('Error loading tournament settings:', error)
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      loadTournamentSettings()
    }
  }, [eventId])

  console.log('tournamentSettings:', tournamentSettings)
  const isBeforeDeadline = () => {
    if (!registrationDeadline) return true // always show if deadline not set
    const now = moment()
    const deadline = moment(registrationDeadline)
    return now.isBefore(deadline)
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[#0f0217]'>
        <Loader />
      </div>
    )
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
              {tournamentSettings?.simpleFees?.currency || '$'}
              {(tournamentSettings?.simpleFees?.fighterFee || 0).toFixed(2)}
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
              {tournamentSettings?.simpleFees?.currency || '$'}
              {(tournamentSettings?.simpleFees?.trainerFee || 0).toFixed(2)}
            </span>
          </p>
        </div>
      )}

      <div className='mt-6 w-full'>
        <Link
          href={`/events/${eventId}/spectator-tickets`}
          className='bg-gradient-to-r from-[#B02FEC] to-[#5141B5] hover:opacity-90 text-white px-6 py-3 w-full rounded-sm text-xl inline-block text-center font-semibold'
        >
          Buy Spectator Tickets
        </Link>
        {showTable && <TicketTable eventId={eventId} />}
      </div>
    </div>
  )
}
