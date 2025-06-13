'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../../../../../constants'
import Loader from '../../../../_components/Loader'
import { SuspensionTable } from './SuspensionTable'
import { AddSuspensionForm } from './AddSuspensionForm'

export const SuspensionContainer = () => {
  const [showAddSuspensionForm, setShowAddSuspensionForm] = useState(false)
  const [suspensions, setSuspensions] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedType, setSelectedType] = useState('')

  const getSuspensions = async () => {
    setLoading(true)
    try {
      let queryParams = `?page=${currentPage}&limit=${limit}`

      if (searchQuery) {
        queryParams += `&search=${searchQuery}`
      }
      if (selectedStatus) {
        queryParams += `&status=${selectedStatus}`
      }
      if (selectedType) {
        queryParams += `&type=${selectedType}`
      }
      const response = await axios.get(
        `${API_BASE_URL}/suspensions${queryParams}`
      )
      console.log('Response:', response.data)

      setSuspensions(response.data.data.items)
      setTotalPages(response.data.data.pagination.totalPages)
      setTotalItems(response.data.data.pagination.totalItems)
    } catch (error) {
      console.log('Error fetching suspensions:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getSuspensions()
  }, [showAddSuspensionForm, limit, currentPage, selectedStatus, selectedType])

  return (
    <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
      {showAddSuspensionForm ? (
        <AddSuspensionForm
          setShowAddSuspensionForm={setShowAddSuspensionForm}
        />
      ) : (
        <>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-2xl font-semibold leading-8'>Suspension</h2>
            <button
              className='text-white px-4 py-2 rounded-md'
              style={{
                background:
                  'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
              }}
              onClick={() => setShowAddSuspensionForm(true)}
            >
              Create New
            </button>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <SuspensionTable
              suspensions={suspensions}
              limit={limit}
              setLimit={setLimit}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              onSuccess={getSuspensions}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
            />
          )}
        </>
      )}
    </div>
  )
}
