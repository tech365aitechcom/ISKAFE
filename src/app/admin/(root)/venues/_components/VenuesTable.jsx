'use client'
import { MapPin, Search } from 'lucide-react'
import PaginationHeader from '../../../../_components/PaginationHeader'
import Pagination from '../../../../_components/Pagination'
import { useState } from 'react'
import { API_BASE_URL, apiConstants } from '../../../../../constants'
import axios from 'axios'
import { enqueueSnackbar } from 'notistack'
import ConfirmationModal from '../../../../_components/ConfirmationModal'
import useStore from '../../../../../stores/useStore'
import ActionButtons from '../../../../_components/ActionButtons'
import { Country } from 'country-state-city'

export function VenuesTable({
  venues,
  searchQuery,
  setSearchQuery,
  selectedCity,
  setSelectedCity,
  selectedStatus,
  setSelectedStatus,
  limit,
  setLimit,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
  onSuccess,
}) {
  const [isDelete, setIsDelete] = useState(false)
  const [selectedVenue, setSelectedVenue] = useState(null)
  const user = useStore((state) => state.user)

  const cities = venues.map((venue) => venue.address.city)

  const handleDeleteVenue = async (id) => {
    console.log('Deleting news with ID:', id)
    try {
      const res = await axios.delete(`${API_BASE_URL}/venues/${id}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })

      if (res.status == apiConstants.success) {
        enqueueSnackbar(res.data.message, {
          variant: 'success',
        })
        setIsDelete(false)
        onSuccess()
      }
    } catch (error) {
      enqueueSnackbar('Failed to delete venue,try again', {
        variant: 'error',
      })
      console.log('Failed to delete venue:', error)
    }
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
              {cities.map((city) => (
                <option key={city} value={city} className='text-black'>
                  {city}
                </option>
              ))}
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
      {(selectedCity || selectedStatus || searchQuery) && (
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
        <div className='overflow-x-auto custom-scrollbar'>
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
              {venues && venues.length > 0 ? (
                venues.map((venue, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                    }`}
                  >
                    <td className='p-4 whitespace-nowrap'>{venue.name}</td>
                    <td className='p-4 whitespace-nowrap'>
                      {venue.address.street1}
                    </td>
                    <td className='p-4 whitespace-nowrap'>
                      {venue.address.city}
                    </td>
                    <td className='p-4 whitespace-nowrap'>
                      {venue.address.state}
                    </td>
                    <td className='p-4 whitespace-nowrap'>
                      {Country.getCountryByCode(venue.address.country).name}
                    </td>
                    <td className='p-4 whitespace-nowrap'>
                      {venue.address.postalCode}
                    </td>
                    <td className='p-4 whitespace-nowrap'>
                      {venue.contactName}
                    </td>
                    <td className='p-4 whitespace-nowrap'>
                      {venue.contactEmail}
                    </td>
                    <td className='p-4 whitespace-nowrap'>
                      {venue.contactPhone}
                    </td>
                    <td className='p-4 whitespace-nowrap'>{venue.capacity}</td>
                    <td className='p-4 whitespace-nowrap'>{venue.status}</td>
                    <td className='p-4 flex items-center gap-2 whitespace-nowrap max-w-fit'>
                      {venue.media?.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt='Venue'
                          className='h-20 w-20 object-cover rounded mr-2 inline-block'
                        />
                      ))}
                    </td>
                    <td className='p-4 text-center whitespace-nowrap'>
                      {venue.mapLink && (
                        <a
                          href={venue.mapLink}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-center text-blue-500 hover:underline flex items-center justify-center gap-2'
                          title='View on Map'
                        >
                          View Map
                          <MapPin size={20} />
                        </a>
                      )}
                    </td>
                    <td className='p-4 align-middle '>
                      <ActionButtons
                        viewUrl={`/admin/venues/view/${venue._id}`}
                        editUrl={`/admin/venues/edit/${venue._id}`}
                        onDelete={() => {
                          setIsDelete(true)
                          setSelectedVenue(venue._id)
                        }}
                      />
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
        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={isDelete}
          onClose={() => setIsDelete(false)}
          onConfirm={() => handleDeleteVenue(selectedVenue)}
          title='Delete Venue'
          message='Are you sure you want to delete this venue?'
        />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  )
}
