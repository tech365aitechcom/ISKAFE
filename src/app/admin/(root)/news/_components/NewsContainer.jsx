'use client'
import React, { useEffect, useState } from 'react'
import { AddNewsForm } from './AddNewsForm'
import axios from 'axios'
import Loader from '../../../../_components/Loader'
import { API_BASE_URL } from '../../../../../constants'
import { NewsTable } from './NewsTable'

export const NewsContainer = () => {
  const [showAddNewsForm, setShowAddNewsForm] = useState(false)
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(1)
  const [limit, setLimit] = useState(10)

  const getNews = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/news?page=${currentPage}&limit=${limit}`
      )
      console.log('Response:', response.data)

      setNews(response.data.data.items)
      setTotalPages(response.data.data.pagination.totalPages)
      setTotalItems(response.data.data.pagination.totalItems)
    } catch (error) {
      console.log('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getNews()
  }, [showAddNewsForm, limit, currentPage])

  return (
    <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
      {showAddNewsForm ? (
        <AddNewsForm setShowAddNewsForm={setShowAddNewsForm} />
      ) : (
        <>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-2xl font-semibold leading-8'>News</h2>
            <button
              className='text-white px-4 py-2 rounded-md'
              style={{
                background:
                  'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
              }}
              onClick={() => setShowAddNewsForm(true)}
            >
              Create New
            </button>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <NewsTable
              news={news}
              limit={limit}
              setLimit={setLimit}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              onSuccess={getNews}
            />
          )}
        </>
      )}
    </div>
  )
}
