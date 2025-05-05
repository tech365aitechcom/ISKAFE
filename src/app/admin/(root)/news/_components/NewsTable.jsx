'use client'

import axios from 'axios'
import { Search, SquarePen, Trash } from 'lucide-react'
import moment from 'moment'
import Link from 'next/link'
import { enqueueSnackbar } from 'notistack'
import { useState } from 'react'
import { API_BASE_URL, apiConstants } from '../../../../../constants'
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
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [isDelete, setIsDelete] = useState(false)
  const [selectedNews, setSelectedNews] = useState(null)

  const filteredNews = news?.filter((news) => {
    const matchesSearch = news?.title
      ?.toLowerCase()
      .includes(searchQuery?.toLowerCase())
    const matchesType = selectedType ? news.city === selectedType : true
    const matchesStatus = selectedStatus ? news.status === selectedStatus : true
    return matchesSearch && matchesType && matchesStatus
  })

  const handleDeleteNews = async (id) => {
    console.log('Deleting news with ID:', id)
    try {
      const res = await axios.delete(`${API_BASE_URL}/news/${id}`)
      console.log(res, 'Response from delete news')

      if (res.status == apiConstants.success) {
        enqueueSnackbar('Event deleted successfully', {
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
      {/* <div className='flex space-x-4'>
        <div className='relative w-64 mb-4'>
          <div className='w-64 mb-4'>
            <label
              htmlFor='pro-classification'
              className='block mb-2 text-sm font-medium text-white'
            >
              Select Status
            </label>
            <div className='relative flex items-center justify-between w-full px-4 py-2 border border-gray-700 rounded-lg'>
              <select
                id='pro-classification'
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className='w-full bg-transparent text-white appearance-none outline-none cursor-pointer'
              >
                <option value='All' className='text-black'>
                  All
                </option>
                <option value='Upcoming' className='text-black'>
                  Upcoming
                </option>
                <option value='Closed' className='text-black'>
                  Closed
                </option>
              </select>
              <ChevronDown
                size={16}
                className='absolute right-4 pointer-news-none'
              />
            </div>
          </div>
        </div>
        <div className='relative w-64 mb-4'>
          <div className='w-64 mb-4'>
            <label
              htmlFor='pro-classification'
              className='block mb-2 text-sm font-medium text-white'
            >
              Select <span>Type</span>
            </label>
            <div className='relative flex items-center justify-between w-full px-4 py-2 border border-gray-700 rounded-lg'>
              <select
                id='pro-classification'
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className='w-full bg-transparent text-white appearance-none outline-none cursor-pointer'
              >
                <option value='All' className='text-black'>
                  All
                </option>
                <option value='Kickboxing' className='text-black'>
                  Kickboxing
                </option>
                <option value='MMA' className='text-black'>
                  MMA
                </option>
                <option value='Grappling' className='text-black'>
                  Grappling
                </option>
              </select>
              <ChevronDown
                size={16}
                className='absolute right-4 pointer-news-none'
              />
            </div>
          </div>
        </div>

        {(selectedType || selectedStatus) && (
          <button
            className='border border-gray-700 rounded-lg px-4 py-2 mb-4'
            onClick={handleResetFilter}
          >
            Reset Filter
          </button>
        )}
      </div> */}
      <div className='border border-[#343B4F] rounded-lg overflow-hidden'>
        <div className='mb-4 pb-4 p-4 flex justify-between items-center border-b border-[#343B4F]'>
          <div className='flex items-center space-x-2'>
            <label htmlFor='limit' className='text-sm'>
              Next
            </label>
            <select
              id='limit'
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className='text-sm py-1 outline-none'
            >
              {[10, 20, 30, 50].map((val) => (
                <option key={val} value={val} className='bg-[#0A1330]'>
                  {val} News
                </option>
              ))}
            </select>
          </div>
          <p className='text-sm'>
            {(currentPage - 1) * limit + 1} -{' '}
            {Math.min(currentPage * limit, totalItems)} of {totalItems}
          </p>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left'>
            <thead>
              <tr className='text-gray-400 text-sm'>
                {renderHeader('ID', 'id')}
                {renderHeader('Image', 'image')}
                {renderHeader('Title', 'title')}
                {renderHeader('Published Date', 'date')}
                {renderHeader('Actions', 'actions')}
              </tr>
            </thead>
            <tbody>
              {filteredNews.map((news, index) => {
                return (
                  <tr
                    key={index}
                    className={`cursor-pointer ${
                      index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                    }`}
                  >
                    <td className='p-4'>
                      {index + 1 + (currentPage - 1) * limit}
                    </td>
                    <td className='p-4'>
                      <div className='relative w-full h-[120px]'>
                        <Image
                          src={
                            news?.imageUrl && process.env.NEXT_PUBLIC_BASE_URL
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
                    <td className='p-4'>
                      {moment(news.publishDate).format('YYYY/MM/DD')}
                    </td>
                    <td className='p-4 '>
                      <div className='flex space-x-4 items-center'>
                        {/* View/Edit */}
                        {/* <Link href={`/admin/news/${news._id}`}> */}
                        <button className='text-blue-500 hover:underline block'>
                          <SquarePen size={20} />
                        </button>
                        {/* </Link> */}

                        {/* Delete */}
                        <button
                          onClick={() => {
                            setIsDelete(true)
                            setSelectedNews(news._id)
                          }}
                          className='text-red-600'
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
