'use client'

import { Search, Trash } from 'lucide-react'
import { useState } from 'react'
import PaginationHeader from '../../../../_components/PaginationHeader'
import Pagination from '../../../../_components/Pagination'

export function VenuesTable({
  venues,
  limit,
  setLimit,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
  onSuccess,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

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

  const renderHeader = (label) => (
    <th className='px-4 pb-3 whitespace-nowrap cursor-pointer'>
      <div className='flex items-center gap-1'>{label}</div>
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
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
        <div className='relative'>
          <label className='block mb-2 text-sm font-medium text-white'>
            City
          </label>
          <div className='relative'>
            <select
              className='w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-white appearance-none outline-none'
              value={selectedCity || ''}
              onChange={(e) => setSelectedCity(e.target.value || null)}
            >
              <option value='' className='text-black'>
                All
              </option>
              <option value='Charlotte' className='text-black'>
                Charlotte
              </option>
              <option value='Newport Beach' className='text-black'>
                Newport Beach
              </option>
            </select>
          </div>
        </div>
        <div className='relative'>
          <label className='block mb-2 text-sm font-medium text-white'>
            Status
          </label>
          <div className='relative'>
            <select
              className='w-full px-4 py-2 bg-transparent border border-gray-700 rounded-lg text-white appearance-none outline-none'
              value={selectedStatus || ''}
              onChange={(e) => setSelectedStatus(e.target.value || null)}
            >
              <option value='' className='text-black'>
                All
              </option>
              <option value='Active' className='text-black'>
                Active
              </option>
              <option value='Upcoming' className='text-black'>
                Upcoming
              </option>
            </select>
          </div>
        </div>
      </div>
      {(selectedCity || selectedStatus) && (
        <div className='flex justify-end mb-6'>
          <button
            className='border border-gray-700 text-white rounded-lg px-4 py-2 hover:bg-gray-700 transition'
            onClick={handleResetFilter}
          >
            Reset Filters
          </button>
        </div>
      )}
      <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
        <PaginationHeader
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          totalItems={totalItems}
          label='venues'
        />
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
              {filteredVenues && filteredVenues.length > 0 ? (
                filteredVenues.map((venue, index) => (
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
                ))
              ) : (
                <tr className='text-center bg-[#0A1330]'>
                  <td colSpan='14' className='p-4'>
                    No venues found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  )
}
