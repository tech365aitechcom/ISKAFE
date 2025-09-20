'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../../../../../../components/ui/button'
import Link from 'next/link'
import moment from 'moment'
import { fetchTournamentSettings } from '../../../../../utils/eventUtils'
import Loader from '../../../../_components/Loader'
import TicketTable from './TicketTable'
import axios from '../../../../../shared/axios'
import { API_BASE_URL } from '../../../../../constants'

export default function RegistrationSection({
  eventId,
  padding,
  registrationDeadline,
  showTable = false,
}) {
  const [tournamentSettings, setTournamentSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hasSpectatorTickets, setHasSpectatorTickets] = useState(false)
  const [spectatorTicketsLoading, setSpectatorTicketsLoading] = useState(true)

  useEffect(() => {
    const loadTournamentSettings = async () => {
      try {
        setLoading(true)
        const settings = await fetchTournamentSettings(eventId)
        setTournamentSettings(settings)
      } catch (error) {
        console.log('Error loading tournament settings:', error)
      } finally {
        setLoading(false)
      }
    }

    const checkSpectatorTickets = async () => {
      try {
        setSpectatorTicketsLoading(true)
        const response = await axios.get(
          `${API_BASE_URL}/spectator-ticket/${eventId}`
        )
        if (
          response.data.success &&
          response.data.data &&
          response.data.data.tiers &&
          response.data.data.tiers.length > 0
        ) {
          setHasSpectatorTickets(true)
        } else {
          setHasSpectatorTickets(false)
        }
      } catch (error) {
        console.log('Error checking spectator tickets:', error)
        setHasSpectatorTickets(false)
      } finally {
        setSpectatorTicketsLoading(false)
      }
    }

    if (eventId) {
      loadTournamentSettings()
      checkSpectatorTickets()
    }
  }, [eventId])

  console.log('tournamentSettings:', tournamentSettings)
  const isBeforeDeadline = () => {
    if (!registrationDeadline) return true // always show if deadline not set
    const now = moment()
    const deadline = moment(registrationDeadline)
    return now.isBefore(deadline)
  }

  const isFighterRegistrationDisabled = () => {
    return (tournamentSettings?.simpleFees?.fighterFee || 0) <= 0
  }

  const isTrainerRegistrationDisabled = () => {
    return (tournamentSettings?.simpleFees?.trainerFee || 0) <= 0
  }

  if (loading || spectatorTicketsLoading) {
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
          {isFighterRegistrationDisabled() ? (
            <Button
              disabled
              className='bg-gray-600 text-gray-400 px-6 py-3 w-full rounded-sm text-xl font-semibold cursor-not-allowed'
            >
              Register As Fighter
            </Button>
          ) : (
            <Link href={`/events/fighter-registration/${eventId}`}>
              <Button className='bg-gradient-to-r from-[#B02FEC] to-[#5141B5] hover:opacity-90 text-white px-6 py-3 w-full rounded-sm text-xl font-semibold'>
                Register As Fighter
              </Button>
            </Link>
          )}
          <p className='mt-2 text-base text-gray-400 text-center'>
            Fighter Fee Amount:
            <span className='text-white font-semibold text-xl ml-2'>
              {tournamentSettings?.simpleFees?.currency || '$'}
              {(tournamentSettings?.simpleFees?.fighterFee || 0).toFixed(2)}
            </span>
          </p>
          {isFighterRegistrationDisabled() && (
            <p className='mt-2 text-sm text-red-400 text-center'>
              Fighter registration is currently unavailable due to tournament
              settings configuration.
            </p>
          )}
        </div>
      )}

      {isBeforeDeadline() && (
        <div className='mt-6 w-full'>
          {isTrainerRegistrationDisabled() ? (
            <Button
              disabled
              className='bg-gray-600 text-gray-400 px-6 py-3 w-full rounded-sm text-xl font-semibold cursor-not-allowed'
            >
              Register As Trainer
            </Button>
          ) : (
            <Link href={`/events/trainer-registration/${eventId}`}>
              <Button className='bg-gradient-to-r from-[#B02FEC] to-[#5141B5] hover:opacity-90 text-white px-6 py-3 w-full rounded-sm text-xl font-semibold'>
                Register As Trainer
              </Button>
            </Link>
          )}

          <p className='mt-2 text-base text-gray-400 text-center'>
            Trainer Fee Amount:
            <span className='text-white font-semibold text-xl ml-2'>
              {tournamentSettings?.simpleFees?.currency || '$'}
              {(tournamentSettings?.simpleFees?.trainerFee || 0).toFixed(2)}
            </span>
          </p>
          {isTrainerRegistrationDisabled() && (
            <p className='mt-2 text-sm text-red-400 text-center'>
              Trainer registration is currently unavailable due to tournament
              settings configuration.
            </p>
          )}
        </div>
      )}

      {hasSpectatorTickets && (
        <div className='mt-6 w-full'>
          <Link href={`/events/${eventId}/spectator-tickets`}>
            <Button className='bg-gradient-to-r from-[#B02FEC] to-[#5141B5] hover:opacity-90 text-white px-6 py-3 w-full rounded-sm text-xl font-semibold'>
              Buy Spectator Tickets
            </Button>{' '}
          </Link>
          {showTable && <TicketTable eventId={eventId} />}
        </div>
      )}
    </div>
  )
}
