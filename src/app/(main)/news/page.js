'use client'
import axios from 'axios'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../../constants'
import Loader from '../../_components/Loader'
import Pagination from '../../_components/Pagination'
import moment from 'moment'
import useStore from '../../../stores/useStore'

const NewsPage = () => {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(false)
  const [bgImage, setBgImage] = useState('/Cover.png')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [category, setCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const newsPerPage = 9

  const { newsCategories } = useStore()

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

  useEffect(() => {
    const updateBackground = () => {
      setBgImage(
        window.innerWidth >= 768 ? '/Cover.png' : '/rakning_cover_mobile.png'
      )
    }

    updateBackground()
    window.addEventListener('resize', updateBackground)

    return () => window.removeEventListener('resize', updateBackground)
  }, [])

  const fetchNews = async (category, search) => {
    setLoading(true)

    try {
      let queryParams = `?isPublished=true&page=${currentPage}&limit=${newsPerPage}`
      if (category && category !== 'All') {
        queryParams += `&category=${category}`
      }
      if (search) {
        queryParams += `&search=${encodeURIComponent(search)}`
      }
      const response = await axios.get(`${API_BASE_URL}/news${queryParams}`)
      console.log('Response:', response.data)
      setNews(response.data.data.items)
      setTotalPages(response.data.data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [currentPage])

  const handleSearch = () => {
    fetchNews(category, searchTerm)
  }

  const handleReset = () => {
    setCategory('All')
    setSearchTerm('')
    setCurrentPage(1)
    fetchNews('All', '')
  }

  return (
    <main className='md:pb-44'>
      <section
        className='w-full py-16 relative bg-cover bg-center'
        style={{
          backgroundImage: `url(${bgImage})`,
          boxShadow: 'inset 0 0 50px rgba(76, 0, 255, 0.2)',
        }}
      >
        <div className='absolute inset-0 bg-black opacity-20'></div>
        <div className='max-w-4xl mx-auto text-center relative z-10'>
          <h2 className='text-white text-3xl md:text-4xl font-medium mb-4 uppercase'>
            News
          </h2>
          <p className='text-white text-xl font-medium my-4'>
            Stay up to date with the latest news and announcements from the IKF.
          </p>
        </div>
      </section>
      <section className='container mx-auto py-12 px-4'>
        <div className='bg-[#28133A] rounded-xl p-8 shadow-xl mb-8'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 '>
            {/* Category Dropdown */}
            <div className='flex flex-col items-start mb-6'>
              <label className='text-white text-sm mb-2'>Category</label>
              <div className='relative w-full'>
                <select
                  className='appearance-none w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500'
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value='' className='bg-purple-900'>
                    Select
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
                <div className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
                  <ChevronDown className='h-5 w-5 text-white' />
                </div>
              </div>
            </div>

            {/* Search Input */}
            <div className='flex flex-col items-start mb-6'>
              <label className='text-white text-sm mb-2'>Search</label>
              <input
                type='text'
                placeholder='Search by keywords...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500 placeholder-gray-400'
              />
            </div>
          </div>

          <div className='mt-4 flex justify-center'>
            <button
              onClick={handleSearch}
              className='bg-red-500 text-white px-12 py-3 rounded font-medium hover:bg-red-600 transition-colors'
            >
              Search
            </button>
            {(category !== 'All' || searchTerm) && (
              <button
                onClick={handleReset}
                className='bg-gray-500 text-white ml-4 px-12 py-3 rounded font-medium hover:bg-gray-600 transition-colors'
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : (
          <div className='flex flex-wrap gap-4'>
            {news?.map((item, index) => (
              <div
                key={index}
                className='w-100 mx-auto border border-gray-500 rounded block hover:shadow-lg transition-shadow duration-300'
              >
                <img
                  src={item?.coverImage}
                  alt={item?.title}
                  className='w-100 h-60 object-cover rounded-t'
                />
                <div className='p-4 text-white'>
                  <h3 className='text-white text-xl font-bold'>
                    {item?.title}
                  </h3>
                  <h3 className='text-[#BDBDBD] text-lg font-medium my-2 leading-6'>
                    {item?.content}
                  </h3>
                  <h3 className='text-[#BDBDBD] font-medium mb-4'>
                    {moment.utc(item?.updatedAt).toISOString()}
                  </h3>
                  <Link href={`/news/${item?._id}`}>
                    <button className='bg-[#0A1330] text-white px-4 py-2 rounded transition duration-200'>
                      Read More
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </section>
    </main>
  )
}

export default NewsPage
