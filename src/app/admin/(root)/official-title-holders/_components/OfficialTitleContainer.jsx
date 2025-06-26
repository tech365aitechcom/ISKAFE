'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Loader from '../../../../_components/Loader'
import { API_BASE_URL } from '../../../../../constants'
import { AddOfficialTitle } from './AddOfficialTitle'
import { OfficialTitleTable } from './OfficialTitleTable'

export const OfficialTitleContainer = () => {
  const [showAddTitleForm, setShowAddTitleForm] = useState(false)
  const [officialTitles, setOfficialTitles] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(1)
  const [limit, setLimit] = useState(10)

  const getTitles = async () => {
    setLoading(true)
    setOfficialTitles([])
    try {
      const response = await axios.get(
        `${API_BASE_URL}/official-title-holders?page=${currentPage}&limit=${limit}&search=${searchQuery}`
      )
      console.log('Response:', response.data)
      setOfficialTitles(response.data.data.items)
      setTotalPages(response.data.data.pagination.totalPages)
      setTotalItems(response.data.data.pagination.totalItems)
    } catch (error) {
      console.log('Error fetching promoter:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getTitles()
  }, [showAddTitleForm, limit, currentPage])

  return (
    <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
      {showAddTitleForm ? (
        <AddOfficialTitle setShowAddTitleForm={setShowAddTitleForm} />
      ) : (
        <>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-2xl font-semibold leading-8'>
              Official Title Holders
            </h2>
            <button
              className='text-white px-4 py-2 rounded-md'
              style={{
                background:
                  'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
              }}
              onClick={() => setShowAddTitleForm(true)}
            >
            New Title
            </button>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <OfficialTitleTable
              officialTitles={officialTitles}
              limit={limit}
              setLimit={setLimit}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              onSuccess={getTitles}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          )}
        </>
      )}
    </div>
  )
}
