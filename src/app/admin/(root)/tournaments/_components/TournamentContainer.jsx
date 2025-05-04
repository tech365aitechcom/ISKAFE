'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Loader from '../../../../_components/Loader'
import { API_BASE_URL } from '../../../../../constants'
import { AddTournamentForm } from './AddTournamentForm'
import { TournamentTable } from './TournamentTable'

export const TournamentContainer = () => {
  const [showAddTournamentForm, setShowAddTournament] = useState(false)
  const [tournaments, setTournaments] = useState([])
  const [loading, setLoading] = useState(true)

  const getTournaments = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/tournaments/find-all?page=1&limit=10`
      )
      console.log('Response:', response.data)

      setTournaments(response.data.data.tournaments)
    } catch (error) {
      console.log('Error fetching tournaments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getTournaments()
  }, [showAddTournamentForm])

  return (
    <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
      {showAddTournamentForm ? (
        <AddTournamentForm setShowAddTournament={setShowAddTournament} />
      ) : (
        <>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-2xl font-semibold leading-8'>Tournaments</h2>
            <button
              className='text-white px-4 py-2 rounded-md'
              style={{
                background:
                  'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
              }}
              onClick={() => setShowAddTournament(true)}
            >
              Create New
            </button>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <TournamentTable
              tournaments={tournaments}
              onSuccess={getTournaments}
            />
          )}
        </>
      )}
    </div>
  )
}
