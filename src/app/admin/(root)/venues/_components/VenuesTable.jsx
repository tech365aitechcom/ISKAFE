'use client'

import { ChevronDown, ChevronsUpDown, Search, Trash } from 'lucide-react'
import { useState } from 'react'

export function VenuesTable({ venues }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpenCity, setIsOpenCity] = useState(false)
  const [isOpenStatus, setIsOpenStatus] = useState(false)
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  })

  const toggleDropdownCity = () => {
    setIsOpenCity(!isOpenCity)
  }

  const toggleDropdownStatus = () => {
    setIsOpenStatus(!isOpenStatus)
  }

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch = venue.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const matchesCity = selectedCity ? venue.city === selectedCity : true
    const matchesStatus = selectedStatus
      ? venue.status === selectedStatus
      : true
    return matchesSearch && matchesCity && matchesStatus
  })

  const sortedVenues = [...filteredVenues].sort((a, b) => {
    if (!sortConfig.key) return 0
    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    } else {
      return sortConfig.direction === 'asc'
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
        ? 1
        : -1
    }
  })

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      } else {
        return { key, direction: 'asc' }
      }
    })
  }

  const handleDelete = (id) => {
    console.log('Deleting venue with ID:', id)
  }

  const handleUpdate = (venue) => {
    console.log('Editing venue:', venue)
  }
  const handleResetFilter = () => {
    setSelectedCity('')
    setSelectedStatus('')
    setSearchQuery('')
  }

  const renderHeader = (label, key) => (
    <th
      className='px-4 pb-3 whitespace-nowrap cursor-pointer'
      onClick={() => handleSort(key)}
    >
      <div className='flex items-center gap-1'>
        {label}
        <ChevronsUpDown className='w-4 h-4 text-gray-400' />
      </div>
    </th>
  )

  return (
    <>
      <div className='relative mb-6'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
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
          {/* Dropdown Button */}
          <button
            onClick={toggleDropdownCity}
            className='flex items-center justify-between w-full px-4 py-2 border border-gray-700 rounded-lg'
          >
            <span>City</span>
            <ChevronDown
              size={16}
              className={`transition-transform ${
                isOpenCity ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isOpenCity && (
            <div className='absolute w-full mt-2 bg-[#081028] shadow-lg z-10'>
              <ul className='py-1'>
                <li
                  className='mx-4 py-3 border-b border-[#6C6C6C] cursor-pointer'
                  onClick={() => {
                    setSelectedCity('')
                    setIsOpenCity(false)
                  }}
                >
                  All
                </li>{' '}
                <li
                  className='mx-4 py-3 border-b border-[#6C6C6C] cursor-pointer'
                  onClick={() => {
                    setSelectedCity('Charlotte')
                    setIsOpenCity(false)
                  }}
                >
                  Charlotte
                </li>
                <li
                  className='mx-4 py-3 cursor-pointer'
                  onClick={() => {
                    setSelectedCity('Newport Beach')
                    setIsOpenCity(false)
                  }}
                >
                  Newport Beach
                </li>
              </ul>
            </div>
          )}
        </div>
        <div className='relative w-64 mb-4'>
          {/* Dropdown Button */}
          <button
            onClick={toggleDropdownStatus}
            className='flex items-center justify-between w-full px-4 py-2 border border-gray-700 rounded-lg'
          >
            <span>Status</span>
            <ChevronDown
              size={16}
              className={`transition-transform ${
                isOpenStatus ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isOpenStatus && (
            <div className='absolute w-full mt-2 bg-[#081028] shadow-lg z-10'>
              <ul className='py-1'>
                <li
                  className='mx-4 py-3 border-b border-[#6C6C6C] cursor-pointer'
                  onClick={() => {
                    setSelectedStatus('')
                    setIsOpenStatus(false)
                  }}
                >
                  All
                </li>{' '}
                <li
                  className='mx-4 py-3 border-b border-[#6C6C6C] cursor-pointer'
                  onClick={() => {
                    setSelectedStatus('Active')
                    setIsOpenStatus(false)
                  }}
                >
                  Active
                </li>
                <li
                  className='mx-4 py-3 cursor-pointer'
                  onClick={() => {
                    setSelectedStatus('Upcoming')
                    setIsOpenStatus(false)
                  }}
                >
                  Upcoming
                </li>
              </ul>
            </div>
          )}
        </div>
        {(selectedCity || selectedStatus) && (
          <button
            className='border border-gray-700 rounded-lg px-4 py-2 mb-4'
            onClick={handleResetFilter}
          >
            Reset Filter
          </button>
        )}
      </div>
      <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
        <div className='mb-4 pb-4 p-4 flex justify-between items-center border-b border-[#343B4F]'>
          <p className='text-sm'>Next 10 Venues</p>
          <p className='text-sm'>
            1 - {sortedVenues.length} of {filteredVenues.length}
          </p>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left'>
            <thead>
              <tr className='text-gray-400 text-sm'>
                {renderHeader('Venue Name', 'name')}
                {renderHeader('Address', 'address')}
                {renderHeader('City', 'city')}
                {renderHeader('State/Province', 'state')}
                {renderHeader('Country', 'country')}
                {renderHeader('ZIP/Postal Code', 'postalCode')}
                {renderHeader('Contact Person', 'person')}
                {renderHeader('Contact Email', 'email')}
                {renderHeader('Contact Phone', 'contact')}
                {renderHeader('Capacity', 'capacity')}
                {renderHeader('Status', 'status')}
                {renderHeader('Upload Images', 'images')}
                {renderHeader('Map Location', 'images')}
                {renderHeader('Actions', 'actions')}
              </tr>
            </thead>
            <tbody>
              {sortedVenues.map((venue, index) => (
                <tr
                  key={index}
                  className={`text-center ${
                    index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                  }`}
                >
                  <td className='p-4'>{venue.name}</td>
                  <td className='p-4'>{venue.address}</td>
                  <td className='p-4'>{venue.city}</td>
                  <td className='p-4'>{venue.state}</td>
                  <td className='p-4'>{venue.country}</td>
                  <td className='p-4'>{venue.postalCode}</td>
                  <td className='p-4'>{venue.person}</td>
                  <td className='p-4'>{venue.email}</td>
                  <td className='p-4'>{venue.contact}</td>
                  <td className='p-4'>{venue.capacity}</td>
                  <td className='p-4'>{venue.status}</td>
                  <td className='p-4'>
                    {venue.images?.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt='Venue'
                        className='h-10 w-10 object-cover rounded mr-2 inline-block'
                      />
                    ))}
                  </td>
                  <td className='p-4'>
                    <a
                      href={venue.mapLocation}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-500 underline'
                    >
                      View Map
                    </a>
                  </td>
                  <td className='p-4 py-8 flex items-center space-x-2'>
                    <button
                      onClick={() => handleUpdate(venue)}
                      className='bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs'
                    >
                      Save/Update
                    </button>
                    <button
                      onClick={() => handleDelete(venue)}
                      className='text-red-600'
                    >
                      <Trash size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
