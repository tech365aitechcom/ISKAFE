'use client'
import React, { useEffect, useState } from 'react'
import { AddNewsForm } from './AddNewsForm'
import axios from 'axios'
import Loader from '../../../../_components/Loader'
import { API_BASE_URL } from '../../../../../constants'
import { NewsTable } from './NewsTable'
import useStore from '../../../../../stores/useStore'

export const NewsContainer = () => {
  const [showAddNewsForm, setShowAddNewsForm] = useState(false)
  const [news, setNews] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(1)
  const [limit, setLimit] = useState(10)

  useEffect(() => {
    const getCategories = async () => {
      setLoading(true)
      try {
        const response = await axios.get(
          `${API_BASE_URL}/master/newsCategories`
        )
        console.log('Response:', response.data)
        useStore.getState().setNewsCategories(response.data.result)
      } catch (error) {
        console.log('Error fetching news:', error)
      } finally {
        setLoading(false)
      }
    }
    getCategories()
  }, [])

  const getNews = async () => {
    setLoading(true)
    try {
      const response = await axios.get(
        `${API_BASE_URL}/news?category=${selectedCategory}&search=${searchQuery}&page=${currentPage}&limit=${limit}`
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
  }, [showAddNewsForm, limit, currentPage, selectedCategory, searchQuery])

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
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
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
