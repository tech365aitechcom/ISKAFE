'use client'

import axios from 'axios'
import { ChevronDown, Eye, Search, SquarePen, Trash } from 'lucide-react'
import moment from 'moment'
import Link from 'next/link'
import { enqueueSnackbar } from 'notistack'
import { useEffect, useState } from 'react'
import { API_BASE_URL, apiConstants } from '../../../../../constants'
import PaginationHeader from '../../../../_components/PaginationHeader'
import Pagination from '../../../../_components/Pagination'
import Image from 'next/image'

export function NewsTable({
  news,
  limit,
  setLimit,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
  onSuccess,
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [isDelete, setIsDelete] = useState(false)
  const [selectedNews, setSelectedNews] = useState(null)
  const [categories, setCategories] = useState([])

  const filteredNews = news?.filter((news) => {
    const matchesSearch = news?.title
      ?.toLowerCase()
      .includes(searchQuery?.toLowerCase())
    const matchesCategory = selectedCategory
      ? news.category?._id === selectedCategory
      : true
    return matchesSearch && matchesCategory
  })

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/news-category`)
      console.log('Response:', response.data)
      setCategories(response.data.data)
    } catch (error) {
      console.log('Error fetching events:', error)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleDeleteNews = async (id) => {
    console.log('Deleting news with ID:', id)
    try {
      const res = await axios.delete(`${API_BASE_URL}/news/${id}`)
      console.log(res, 'Response from delete news')

      if (res.status == apiConstants.success) {
        enqueueSnackbar(res.data.message, {
          variant: 'success',
        })
        setIsDelete(false)
        onSuccess()
      }
    } catch (error) {
      enqueueSnackbar('Failed to delete news,try again', {
        variant: 'error',
      })
      console.log('Failed to delete news:', error)
    }
  }

  const handleResetFilter = () => {
    setSearchQuery('')
    setSelectedCategory('')
  }

  const renderHeader = (label, key) => (
    <th className='px-4 pb-3 whitespace-nowrap cursor-pointer'>
      <div className='flex items-center gap-1'>{label}</div>
    </th>
  )

  return (
    <>
      <div className='relative mb-6'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-news-none'>
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
      {/* Category Filter */}
      <div className='flex items-end space-x-4 mb-6'>
        <div className='w-64'>
          <label
            htmlFor='pro-classification'
            className='block mb-2 text-sm font-medium text-white'
          >
            Select Category
          </label>
          <div className='relative'>
            <select
              name='category'
              id='pro-classification'
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(
                  e.target.value === '' ? null : e.target.value
                )
              }
              className='w-full px-4 py-2 pr-10 bg-transparent border border-gray-700 rounded-lg text-white appearance-none outline-none cursor-pointer'
            >
              <option value='' className='text-black'>
                Select category
              </option>
              {categories.map((category) => (
                <option
                  key={category._id}
                  value={category._id}
                  className='text-black'
                >
                  {category.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className='absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-white'
            />
          </div>
        </div>

        {(searchQuery || selectedCategory) && (
          <button
            className='self-end border border-gray-700 text-white rounded-lg px-4 py-2 hover:bg-gray-700 transition'
            onClick={handleResetFilter}
          >
            Reset Filter
          </button>
        )}
      </div>

      <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
        <PaginationHeader
          limit={limit}
          setLimit={setLimit}
          currentPage={currentPage}
          totalItems={totalItems}
          label='news'
        />
        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left'>
            <thead>
              <tr className='text-gray-400 text-sm'>
                {renderHeader('News ID', 'id')}
                {renderHeader('Cover Image', 'image')}
                {renderHeader('Title', 'title')}
                {renderHeader('Category', 'category')}
                {renderHeader('Publish Date', 'publishDate')}
                {renderHeader('Last Updated At', 'lastUpdated')}
                {renderHeader('Status', 'status')}
                {renderHeader('Actions', 'actions')}
              </tr>
            </thead>
            <tbody>
              {filteredNews.map((news, index) => {
                return (
                  <tr
                    key={news._id}
                    className={`cursor-pointer ${
                      index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                    }`}
                  >
                    <td className='p-4'>{news._id}</td>
                    <td className='p-4'>
                      <div className='relative w-full h-[120px]'>
                        <Image
                          src={
                            news?.imageUrl !== null &&
                            process.env.NEXT_PUBLIC_BASE_URL
                              ? new URL(
                                  news.imageUrl,
                                  process.env.NEXT_PUBLIC_BASE_URL
                                ).toString()
                              : null
                          }
                          alt={news.title}
                          fill
                          sizes='(max-width: 768px) 100vw, 50vw'
                          className='object-cover rounded'
                        />
                      </div>
                    </td>
                    <td className='p-4'>{news.title}</td>
                    <td className='p-4'>{news.category?.name}</td>
                    <td className='p-4'>
                      {moment(news.publishDate).format('YYYY/MM/DD')}
                    </td>
                    <td className='p-4'>
                      {moment(news.updatedAt).format('YYYY/MM/DD')}
                    </td>
                    <td className='p-4'>
                      {news.isPublished ? 'Published' : 'Draft'}
                    </td>
                    <td className='p-4 '>
                      <div className='flex space-x-4 items-center'>
                        {/* View */}
                        <Link href={`/admin/news/view/${news._id}`}>
                          <button className='text-gray-400 hover:text-gray-200 transition'>
                            <Eye size={20} />
                          </button>
                        </Link>

                        {/* Edit */}
                        <Link href={`/admin/news/edit/${news._id}`}>
                          <button className='text-blue-500 hover:underline'>
                            <SquarePen size={20} />
                          </button>
                        </Link>
                        {/* Delete */}
                        <button
                          onClick={() => {
                            setIsDelete(true)
                            setSelectedNews(news._id)
                          }}
                          className='text-red-600 hover:text-red-400 transition'
                        >
                          <Trash size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {isDelete && (
          <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gray-800/30'>
            <div className='bg-[#0B1739] bg-opacity-80 p-8 rounded-lg text-white w-full max-w-md'>
              <h2 className='text-lg font-semibold mb-4'>Delete News</h2>
              <p>Are you sure you want to delete this news?</p>
              <div className='flex justify-end mt-6 space-x-4'>
                <button
                  onClick={() => setIsDelete(false)}
                  className='px-5 py-2 rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 font-medium transition'
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteNews(selectedNews)}
                  className='px-5 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 font-medium transition'
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </>
  )
}
