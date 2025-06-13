'use client'
import axios from 'axios'
import useStore from '../../../stores/useStore'
import { ChevronDown, Edit, Pencil } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { API_BASE_URL } from '../../../constants'
import { Country, State } from 'country-state-city'
import Pagination from '../../_components/Pagination'
import Flag from 'react-world-flags'

const TrainingFacilitiesPage = () => {
  const user = useStore((state) => state.user)

  const [facilityName, setFacilityName] = useState('')
  const [country, setCountry] = useState('')
  const [state, setState] = useState('')
  const [bgImage, setBgImage] = useState('/Cover.png')
  const [topPosition, setTopPosition] = useState('90%')
  const [limit, setLimit] = useState(8)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const countries = Country.getAllCountries()
  const states = country ? State.getStatesOfCountry(country) : []

  const [loading, setLoading] = useState(false)
  const [facilities, setFacilities] = useState([])

  const getTrainingFacilities = async ({ search, country, state }) => {
    setLoading(true)

    try {
      const queryParams = {
        status: 'adminApprovedAndUserDraft',
        page: currentPage,
        limit: limit,
        search: search?.trim(),
        country,
        state,
      }

      const filteredParams = Object.fromEntries(
        Object.entries(queryParams).filter(([_, value]) => {
          if (value === '' || value === null || value === undefined)
            return false
          if (Array.isArray(value) && value.length === 0) return false
          return true
        })
      )

      const queryString = new URLSearchParams(filteredParams).toString()
      const response = await axios.get(
        `${API_BASE_URL}/training-facilities?${queryString}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      )

      setFacilities(response.data.data.items)
      setTotalPages(response.data.data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching training facilities:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getTrainingFacilities({ search: '', country: '', state: '' })
  }, [])

  const handleSearch = () => {
    getTrainingFacilities({ search: facilityName, country, state })
  }

  const handleReset = () => {
    setFacilityName('')
    setCountry('')
    setState('')
    getTrainingFacilities({ search: '', country: '', state: '' })
  }

  useEffect(() => {
    const updateBackground = () => {
      setBgImage(
        window.innerWidth >= 768 ? '/Cover.png' : '/rakning_cover_mobile.png'
      )
      setTopPosition(window.innerWidth >= 768 ? '90%' : '70%')
    }

    updateBackground()
    window.addEventListener('resize', updateBackground)

    return () => window.removeEventListener('resize', updateBackground)
  }, [])

  return (
    <div>
      <section
        className='w-full py-12 px-4 relative bg-cover bg-center'
        style={{
          backgroundImage: `url(${bgImage})`,
          boxShadow: 'inset 0 0 50px rgba(76, 0, 255, 0.2)',
        }}
      >
        <div className='absolute inset-0 bg-transparent opacity-90'></div>
        <div className='relative w-full max-w-6xl mx-auto px-4 pt-16 pb-32'>
          <div className='text-center mb-8'>
            <h1 className='text-4xl md:text-5xl font-bold text-white'>
              Training Facilities
            </h1>
            <p className='text-white text-xl font-medium my-4'>
              Premium Training Facility Profiles promote your gym/camp/team on
              the Fight Platform, with rich details <br /> about your fighters,
              coaches, and staff.
            </p>{' '}
          </div>
          <div
            className='absolute left-0 right-0 mx-auto px-0 w-full max-w-5xl'
            style={{ top: topPosition }}
          >
            <div className='bg-purple-950 rounded-xl p-8 shadow-xl'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='flex flex-col items-start'>
                  <label className='text-white text-sm mb-2'>
                    Facility Name
                  </label>
                  <input
                    type='text'
                    placeholder='Name'
                    className='w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500'
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                  />
                </div>
                <div className='flex flex-col items-start'>
                  <label className='text-white text-sm mb-2'>Country</label>
                  <div className='relative w-full'>
                    <select
                      className='appearance-none w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500'
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    >
                      <option value='' className='bg-purple-900'>
                        Select
                      </option>
                      {countries.map((country) => (
                        <option
                          key={country.isoCode}
                          value={country.isoCode}
                          className='bg-purple-900'
                        >
                          {country.name}
                        </option>
                      ))}
                    </select>
                    <div className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
                      <ChevronDown className='h-5 w-5 text-white' />
                    </div>
                  </div>
                </div>
                <div className='flex flex-col items-start'>
                  <label className='text-white text-sm mb-2'>State</label>
                  <div className='relative w-full'>
                    <select
                      className='appearance-none w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500'
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      disabled={!country} // Disable if no country is selected
                    >
                      <option value='' className='bg-purple-900'>
                        Select
                      </option>
                      {states.map((state) => (
                        <option
                          key={state.isoCode}
                          value={state.isoCode}
                          className='bg-purple-900'
                        >
                          {state.name}
                        </option>
                      ))}
                    </select>
                    <div className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
                      <ChevronDown className='h-5 w-5 text-white' />
                    </div>
                  </div>
                </div>
              </div>
              <div className='mt-8 flex justify-center'>
                <button
                  onClick={handleSearch}
                  className='bg-red-500 text-white px-12 py-3 rounded font-medium hover:bg-red-600 transition-colors'
                >
                  Search
                </button>
                {(country || state || facilityName) && (
                  <button
                    onClick={handleReset}
                    className='ml-4 bg-gray-500 text-white px-12 py-3 rounded font-medium hover:bg-gray-600 transition-colors'
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className='mt-72 mb-12 md:my-56 mx-4'>
        <div className='container mx-auto'>
          {user && (
            <div className='flex justify-end mb-4'>
              <Link href='/training-facilities/register'>
                <button className='bg-yellow-500 text-white px-4 py-2 rounded font-bold hover:bg-yellow-600 transition-colors'>
                  Register Your Training Facility
                </button>
              </Link>
            </div>
          )}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
            {facilities.map((facility, index) => (
              <div
                key={index}
                className='relative bg-black border border-gray-600 shadow-lg pt-4 flex flex-col hover:scale-105 transition-transform'
              >
                {/* Edit Icon */}
                {facility?.createdBy?._id === user?._id && (
                  <Link href={`/training-facilities/edit/${facility._id}`}>
                    <div className='absolute top-2 right-2 p-1  hover:bg-gray-700 cursor-pointer z-10'>
                      <Edit size={18} className='text-blue-500' />
                    </div>
                  </Link>
                )}
                <Link href={`/training-facilities/${facility._id}`}>
                  <div className='mb-4 flex justify-center'>
                    <img
                      src={facility.logo}
                      alt={`${facility.name} logo`}
                      className='w-36 h-36 object-contain'
                    />
                  </div>

                  <div className='flex items-center gap-2 text-gray-400 py-2 px-4'>
                    <Flag
                      code={facility.country}
                      style={{ width: '24px', height: '16px' }}
                    />
                    <span>{facility.address}</span>
                  </div>

                  <h3 className='text-white font-bold text-left mb-2 text-2xl border-t border-gray-600 pt-2 px-4'>
                    {facility.name}
                  </h3>
                </Link>
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </section>
    </div>
  )
}

export default TrainingFacilitiesPage
