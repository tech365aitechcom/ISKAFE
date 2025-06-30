'use client'
import React, { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import FighterCard from '../_components/FighterCard'
import { API_BASE_URL, sportTypes } from '../../../constants'
import axios from 'axios'
import { City, Country, State } from 'country-state-city'
import Pagination from '../../_components/Pagination'
import Loader from '../../_components/Loader'
import { useRouter } from 'next/navigation'

const Page = () => {
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [trainingStyle, setTrainingStyle] = useState('')
  const [fighters, setFighters] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 9

  const countries = Country.getAllCountries()
  const states = country ? State.getStatesOfCountry(country) : []
  const cities = country && state ? City.getCitiesOfState(country, state) : []

  const getFighters = async (
    searchTerm = '',
    selectedCountry = '',
    selectedState = '',
    selectedCity = '',
    selectedStyle = ''
  ) => {
    setLoading(true)
    try {
      let queryParams = `?page=${currentPage}&limit=${limit}`
      if (searchTerm) queryParams += `&search=${searchTerm}`
      if (selectedCountry) queryParams += `&country=${selectedCountry}`
      if (selectedState) queryParams += `&state=${selectedState}`
      if (selectedCity) queryParams += `&city=${selectedCity}`
      if (selectedStyle) queryParams += `&trainingStyle=${selectedStyle}`

      const response = await axios.get(`${API_BASE_URL}/fighters${queryParams}`)
      setFighters(response.data.data.items)
      setTotalPages(response.data.data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching fighters:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getFighters(search, country, state, city, trainingStyle)
  }, [currentPage])

  const handleSearch = () => {
    setCurrentPage(1)
    getFighters(search, country, state, city, trainingStyle)
  }

  const handleReset = () => {
    setSearch('')
    setCountry('')
    setState('')
    setCity('')
    setTrainingStyle('')
    setCurrentPage(1)
    getFighters('', '', '', '', '')
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader />
      </div>
    )
  }

  return (
    <div className='relative w-full'>
      <div className='bg-purple-900'>
        <div className='absolute inset-0 bg-transparent opacity-90'></div>
        <div className='relative w-full max-w-6xl mx-auto px-4 pt-16 pb-32'>
          <div className='text-center mb-8'>
            <h1 className='text-4xl md:text-5xl font-bold text-white'>
              FIGHTERS
            </h1>
          </div>
          <div
            className='absolute left-0 right-0 mx-auto px-4 w-full max-w-5xl'
            style={{ top: '70%' }}
          >
            <div className='bg-purple-950 rounded-xl p-8 shadow-xl'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {/* Search */}
                <div className='flex flex-col items-start'>
                  <label className='text-white text-sm mb-2'>
                    Search Fighter
                  </label>
                  <input
                    type='text'
                    placeholder='Fighter Name'
                    className='w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500'
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Country */}
                <div className='flex flex-col items-start'>
                  <label className='text-white text-sm mb-2'>Country</label>
                  <div className='relative w-full'>
                    <select
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value)
                        setState('')
                        setCity('')
                      }}
                      className='appearance-none w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500'
                    >
                      <option value='' className='bg-purple-900'>
                        Select
                      </option>
                      {countries.map((c) => (
                        <option
                          key={c.isoCode}
                          value={c.isoCode}
                          className='bg-purple-900'
                        >
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <div className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
                      <ChevronDown className='h-5 w-5 text-white' />
                    </div>
                  </div>
                </div>

                {/* State */}
                <div className='flex flex-col items-start'>
                  <label className='text-white text-sm mb-2'>State</label>
                  <div className='relative w-full'>
                    <select
                      value={state}
                      onChange={(e) => {
                        setState(e.target.value)
                        setCity('')
                      }}
                      className='appearance-none w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500'
                    >
                      <option value='' className='bg-purple-900'>
                        Select
                      </option>
                      {states.map((s) => (
                        <option
                          key={s.isoCode}
                          value={s.isoCode}
                          className='bg-purple-900'
                        >
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <div className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
                      <ChevronDown className='h-5 w-5 text-white' />
                    </div>
                  </div>
                </div>

                {/* City */}
                <div className='flex flex-col items-start'>
                  <label className='text-white text-sm mb-2'>City</label>
                  <div className='relative w-full'>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className='appearance-none w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500'
                    >
                      <option value='' className='bg-purple-900'>
                        Select
                      </option>
                      {cities.map((c) => (
                        <option
                          key={c.name}
                          value={c.name}
                          className='bg-purple-900'
                        >
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <div className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
                      <ChevronDown className='h-5 w-5 text-white' />
                    </div>
                  </div>
                </div>

                {/* Training Style */}
                <div className='flex flex-col items-start'>
                  <label className='text-white text-sm mb-2'>Game Type</label>
                  <div className='relative w-full'>
                    <select
                      value={trainingStyle}
                      onChange={(e) => setTrainingStyle(e.target.value)}
                      className='appearance-none w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500'
                    >
                      <option value='' className='bg-purple-900'>
                        Select
                      </option>
                      {sportTypes.map((type) => (
                        <option
                          key={type}
                          value={type}
                          className='bg-purple-900'
                        >
                          {type}
                        </option>
                      ))}
                    </select>
                    <div className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
                      <ChevronDown className='h-5 w-5 text-white' />
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className='mt-8 flex justify-center'>
                <button
                  onClick={handleSearch}
                  className='bg-red-500 text-white px-12 py-3 rounded font-medium hover:bg-red-600 transition-colors'
                >
                  Search
                </button>
                {(search || country || state || city || trainingStyle) && (
                  <button
                    onClick={handleReset}
                    className='bg-gray-500 text-white ml-4 px-12 py-3 rounded font-medium hover:bg-gray-600 transition-colors'
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className='w-full h-32 bg-black'></div>
      </div>

      {/* Fighters List */}
      <div className='bg-black w-full mx-auto px-4 py-56 md:py-0 md:pt-32 flex flex-wrap justify-center gap-10 items-center'>
        {fighters.map((fighter) => {
          const user = fighter.user || {}
          const countryCode = user.country
          const stateCode = user.state
          const cityCode = user.city

          const countryName =
            Country.getCountryByCode(countryCode)?.name || countryCode
          const stateName =
            State.getStateByCodeAndCountry(stateCode, countryCode)?.name ||
            stateCode
          const cityName =
            City.getCitiesOfState(countryCode, stateCode)?.find(
              (c) => c.name.toLowerCase() === cityCode?.toLowerCase()
            )?.name || cityCode

          return (
            <FighterCard
              key={fighter._id}
              id={fighter._id}
              image={user.profilePhoto}
              imageAlt={user.firstName}
              city={cityName}
              state={stateName}
              country={countryName}
              name={`${user.firstName ?? ''} ${user.lastName ?? ''}${
                user.nickName ? ` - ${user.nickName}` : ''
              }`}
              bio={fighter.bio ?? ''}
              style={fighter.trainingStyle}
            />
          )
        })}
      </div>

      {/* Pagination */}
      <div className='bg-black pb-8'>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}

export default Page
