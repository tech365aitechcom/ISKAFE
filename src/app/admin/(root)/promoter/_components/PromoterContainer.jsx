'use client'
import React, { useEffect, useState } from 'react'
import { AddPromoterForm } from './AddPromoterForm'
import axios from 'axios'
import Loader from '../../../../_components/Loader'
import { API_BASE_URL } from '../../../../../constants'
import { PromoterTable } from './PromoterTable'
import { useSearchParams } from 'next/navigation'

export const PromoterContainer = () => {
  const [showAddPromoterForm, setShowAddPromoterForm] = useState(false)
  const [promoters, setPromoters] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')

  const searchParams = useSearchParams()
  const redirectOrigin = searchParams.get('redirectOrigin')

  useEffect(() => {
    if (!redirectOrigin) return
    else if (redirectOrigin === 'addEvent') {
      setShowAddPromoterForm(true)
    }
  }, [redirectOrigin])

  const getPromoters = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/promoter?search=${searchQuery}&page=${currentPage}&limit=${limit}`
      )
      console.log('Response:', response.data)

      setPromoters(response.data.data.items)
      setTotalPages(response.data.data.pagination.totalPages)
      setTotalItems(response.data.data.pagination.totalItems)
    } catch (error) {
      console.log('Error fetching promoter:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getPromoters()
  }, [showAddPromoterForm, limit, searchQuery, currentPage])

  return (
    <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
      {showAddPromoterForm ? (
        <AddPromoterForm
          setShowAddPromoterForm={setShowAddPromoterForm}
          redirectOrigin={redirectOrigin}
        />
      ) : (
        <>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-2xl font-semibold leading-8'>Promoters</h2>
            <button
              className='text-white px-4 py-2 rounded-md'
              style={{
                background:
                  'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
              }}
              onClick={() => setShowAddPromoterForm(true)}
            >
              Create New
            </button>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <PromoterTable
              promoters={promoters}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              limit={limit}
              setLimit={setLimit}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              onSuccess={getPromoters}
            />
          )}
        </>
      )}
    </div>
  )
}
