'use client'
import React, { useEffect, useState } from 'react'
import { AddVenuesForm } from './AddVenuesForm'
import { VenuesTable } from './VenuesTable'
import axios from 'axios'
import { API_BASE_URL } from '../../../../../constants'
import Loader from '../../../../_components/Loader'

export const VenueContainer = () => {
  const [showAddVenueForm, setShowAddVenueForm] = useState(false)
  const [venues, setVenues] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(1)
  const [limit, setLimit] = useState(10)

  const getVenues = async () => {
    setLoading(true)
    try {
      let queryParams = `?page=${currentPage}&limit=${limit}`
      if (searchQuery) queryParams += `&search=${searchQuery}`
      if (selectedCity) queryParams += `&city=${selectedCity}`
      if (selectedStatus) queryParams += `&status=${selectedStatus}`
      const response = await axios.get(`${API_BASE_URL}/venues${queryParams}`)
      console.log('Response:', response.data)

      setVenues(response.data.data.items)
      setTotalPages(response.data.data.pagination.totalPages)
      setTotalItems(response.data.data.pagination.totalItems)
    } catch (error) {
      console.log('Error fetching venues:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getVenues()
  }, [
    showAddVenueForm,
    limit,
    currentPage,
    searchQuery,
    selectedCity,
    selectedStatus,
  ])

  return (
    <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
      {showAddVenueForm ? (
        <AddVenuesForm setShowAddVenueForm={setShowAddVenueForm} />
      ) : (
        <>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-2xl font-semibold leading-8'>Venues</h2>
            <button
              className='text-white px-4 py-2 rounded-md'
              style={{
                background:
                  'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
              }}
              onClick={() => setShowAddVenueForm(true)}
            >
              Create New
            </button>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <VenuesTable
              venues={venues}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              limit={limit}
              setLimit={setLimit}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              onSuccess={getVenues}
            />
          )}
        </>
      )}
    </div>
  )
}
