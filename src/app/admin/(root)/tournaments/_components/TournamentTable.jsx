'use client'

import axios from 'axios'
import {
  ChevronDown,
  ChevronsUpDown,
  Search,
  SquarePen,
  Trash,
} from 'lucide-react'
import moment from 'moment'
import { enqueueSnackbar } from 'notistack'
import { useState } from 'react'
import { API_BASE_URL, apiConstants } from '../../../../../constants'
import { getEventStatus } from '../../../../../utils/eventUtils'

export function TournamentTable({ tournaments, onSuccess }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [isDelete, setIsDelete] = useState(false)
  const [selectedTournament, setSelectedTournament] = useState(null)

  const filteredTournaments = tournaments?.filter((tournament) => {
    const matchesSearch = tournament?.name
      ?.toLowerCase()
      .includes(searchQuery?.toLowerCase())
    const matchesType = selectedType ? tournament.city === selectedType : true
    const matchesStatus = selectedStatus
      ? tournament.status === selectedStatus
      : true
    return matchesSearch && matchesType && matchesStatus
  })

  const handleViewEdit = (tournament) => {
    console.log('Viewing/Editing tournament:', tournament)
  }

  const handleDeleteTournament = async (id) => {
    console.log('Deleting tournament with ID:', id)
    try {
      const res = await axios.delete(`${API_BASE_URL}/tournaments/delete/${id}`)
      console.log(res, 'Response from delete tournament')

      if (res.status == apiConstants.success) {
        enqueueSnackbar('Tournament deleted successfully', {
          variant: 'success',
        })
        setIsDelete(false)
        onSuccess()
      }
    } catch (error) {
      enqueueSnackbar('Failed to delete tournament,try again', {
        variant: 'error',
      })
    }
  }

  const handleResetFilter = () => {
    setSelectedStatus('')
    setSelectedType('')
    setSearchQuery('')
  }

  const renderHeader = (label, key) => (
    <th className='px-4 pb-3 whitespace-nowrap cursor-pointer'>
      <div className='flex items-center gap-1'>{label}</div>
    </th>
  )

  return (
    <>
      <div className='relative mb-6'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-tournaments-none'>
          <Search size={18} className='text-gray-400' />
        </div>
        <input
          type='text'
          className='bg-transparent border border-gray-700 text-white rounded-md pl-10 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600'
          placeholder='Search by Name...'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className='flex space-x-4'>
        <div className='relative w-64 mb-4'>
          <div className='w-64 mb-4'>
            <label
              htmlFor='pro-classification'
              className='block mb-2 text-sm font-medium text-white'
            >
              Select Status
            </label>
            <div className='relative flex items-center justify-between w-full px-4 py-2 border border-gray-700 rounded-lg'>
              <select
                id='pro-classification'
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className='w-full bg-transparent text-white appearance-none outline-none cursor-pointer'
              >
                <option value='All' className='text-black'>
                  All
                </option>
                <option value='Upcoming' className='text-black'>
                  Upcoming
                </option>
                <option value='Closed' className='text-black'>
                  Closed
                </option>
              </select>
              <ChevronDown
                size={16}
                className='absolute right-4 pointer-tournaments-none'
              />
            </div>
          </div>
        </div>
        {/* <div className='relative w-64 mb-4'>
          <div className='w-64 mb-4'>
            <label
              htmlFor='pro-classification'
              className='block mb-2 text-sm font-medium text-white'
            >
              Select <span>Type</span>
            </label>
            <div className='relative flex items-center justify-between w-full px-4 py-2 border border-gray-700 rounded-lg'>
              <select
                id='pro-classification'
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className='w-full bg-transparent text-white appearance-none outline-none cursor-pointer'
              >
                <option value='All' className='text-black'>
                  All
                </option>
                <option value='Kickboxing' className='text-black'>
                  Kickboxing
                </option>
                <option value='MMA' className='text-black'>
                  MMA
                </option>
                <option value='Grappling' className='text-black'>
                  Grappling
                </option>
              </select>
              <ChevronDown
                size={16}
                className='absolute right-4 pointer-tournaments-none'
              />
            </div>
          </div>
        </div> */}
        {(selectedType || selectedStatus || searchQuery) && (
          <button
            className='border border-gray-700 rounded-lg px-4 mb-4'
            onClick={handleResetFilter}
          >
            Reset Filter
          </button>
        )}
      </div>
      <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
        <div className='mb-4 pb-4 p-4 flex justify-between items-center border-b border-[#343B4F]'>
          <p className='text-sm'>Next 10 Tournaments</p>
          <p className='text-sm'>1 - 10 of {filteredTournaments?.length}</p>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left'>
            <thead>
              <tr className='text-gray-400 text-sm'>
                {renderHeader('Name', 'name')}
                {renderHeader('Date', 'date')}
                {renderHeader('Location', 'address')}
                {renderHeader('Participants', 'participants')}
                {renderHeader('Rules', 'rules')}
                {renderHeader('Status', 'status')}
                {renderHeader('Actions', 'actions')}
              </tr>
            </thead>
            <tbody>
              {filteredTournaments.map((tournament, index) => {
                return (
                  <tr
                    key={index}
                    className={`cursor-pointer ${
                      index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                    }`}
                  >
                    <td className='p-4'>{tournament.name}</td>
                    <td className='p-4'>
                      {moment(tournament.dateTime).format('YYYY/MM/DD HH:mm')}
                    </td>
                    <td className='p-4'>{tournament.location}</td>
                    <td className='p-4'>
                      <ul className='list-disc list-inside'>
                        {tournament.participants?.map((participant, idx) => (
                          <li key={idx}>
                            {Array.isArray(participant?.fullName)
                              ? participant.fullName.join(', ')
                              : participant?.fullName}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className='p-4'>{tournament.rules}</td>
                    <td className='p-4'>
                      {getEventStatus(tournament.dateTime)}
                    </td>
                    <td className='py-8 px-4 flex space-x-4 items-center'>
                      {/* Edit */}
                      <button
                        className='text-blue-500 hover:underline block'
                        onClick={() => handleViewEdit(tournament)}
                      >
                        <SquarePen size={20} />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          setIsDelete(true)
                          setSelectedTournament(tournament._id)
                        }}
                        className='text-red-600'
                      >
                        <Trash size={20} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {isDelete && (
          <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gray-800/30'>
            <div className='bg-[#0B1739] bg-opacity-80 p-8 rounded-lg text-white w-full max-w-md'>
              <h2 className='text-lg font-semibold mb-4'>Delete Tournament</h2>
              <p>Are you sure you want to delete this tournament?</p>
              <div className='flex justify-end mt-6 space-x-4'>
                <button
                  onClick={() => setIsDelete(false)}
                  className='px-5 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 font-medium transition'
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteTournament(selectedTournament)}
                  className='px-5 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 font-medium transition'
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
