'use client'

import axios from 'axios'
import { ChevronDown, Eye, Search, SquarePen, Trash } from 'lucide-react'
import moment from 'moment'
import Link from 'next/link'
import { enqueueSnackbar } from 'notistack'
import { useState } from 'react'
import { API_BASE_URL, apiConstants } from '../../../../../constants'
import PaginationHeader from '../../../../_components/PaginationHeader'
import Pagination from '../../../../_components/Pagination'
import Image from 'next/image'
import ConfirmationModal from '../../../../_components/ConfirmationModal'
import useStore from '../../../../../stores/useStore'

export function NewsTable({
  news,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  limit,
  setLimit,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
  onSuccess,
}) {
  const user = useStore((state) => state.user)
  const [isDelete, setIsDelete] = useState(false)
  const [selectedNews, setSelectedNews] = useState(null)
  const { newsCategories } = useStore()

  const handleDeleteNews = async (id) => {
    console.log('Deleting news with ID:', id)
    try {
      const res = await axios.delete(`${API_BASE_URL}/news/${id}`, {
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
              {newsCategories.map((category) => (
                <option
                  key={category._id}
                  value={category.label}
                  className='text-black'
                >
                  {category.label}
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
              {news && news.length > 0 ? (
                news.map((item, index) => {
                  return (
                    <tr
                      key={item._id}
                      className={`cursor-pointer ${
                        index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                      }`}
                    >
                      <td className='p-4'>{item._id}</td>
                      <td className='p-4'>
                        {item.coverImage !== null && (
                          <div className='relative w-full h-[120px]'>
                            <Image
                              src={item.coverImage}
                              alt={item.title}
                              fill
                              sizes='(max-width: 768px) 100vw, 50vw'
                              className='object-cover rounded'
                            />
                          </div>
                        )}
                      </td>
                      <td className='p-4'>{item.title}</td>
                      <td className='p-4'>{item.category}</td>
                      <td className='p-4'>
                        {moment(item.publishDate).format('YYYY/MM/DD')}
                      </td>
                      <td className='p-4'>
                        {moment(item.updatedAt).format('YYYY/MM/DD')}
                      </td>
                      <td className='p-4'>{item.status}</td>
                      <td className='p-4 '>
                        <div className='flex space-x-4 items-center'>
                          {/* View */}
                          <Link href={`/admin/news/view/${item._id}`}>
                            <button className='text-gray-400 hover:text-gray-200 transition'>
                              <Eye size={20} />
                            </button>
                          </Link>

                          {/* Edit */}
                          <Link href={`/admin/news/edit/${item._id}`}>
                            <button className='text-blue-500 hover:underline'>
                              <SquarePen size={20} />
                            </button>
                          </Link>
                          {/* Delete */}
                          <button
                            onClick={() => {
                              setIsDelete(true)
                              setSelectedNews(item._id)
                            }}
                            className='text-red-600 hover:text-red-400 transition'
                          >
                            <Trash size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={8} className='p-4 text-center text-gray-400'>
                    No news found.
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
          onConfirm={() => handleDeleteNews(selectedNews)}
          title='Delete News'
          message='Are you sure you want to delete this news?'
        />
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
