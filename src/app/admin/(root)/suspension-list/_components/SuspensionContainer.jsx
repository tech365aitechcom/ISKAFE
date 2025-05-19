'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { API_BASE_URL, suspensionsData } from '../../../../../constants'
import Loader from '../../../../_components/Loader'
import { SuspensionTable } from './SuspensionTable'
import { SuspensionEditorForm } from './SuspensionEditorForm'

export const SuspensionContainer = () => {
  const [showAddSuspensionForm, setShowAddSuspensionForm] = useState(false)
  const [suspensions, setSuspensions] = useState(suspensionsData)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(1)
  const [limit, setLimit] = useState(10)

  const getSuspensions = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/suspension/find-all?page=${currentPage}&limit=${limit}`
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
  }, [showAddSuspensionForm, limit, currentPage])

  return (
    <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
      {showAddSuspensionForm ? (
        <SuspensionEditorForm
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
            />
          )}
        </>
      )}
    </div>
  )
}
