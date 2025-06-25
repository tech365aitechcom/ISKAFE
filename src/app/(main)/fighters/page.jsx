'use client'
import React, { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import FighterCard from '../_components/FighterCard'
import { API_BASE_URL, sportTypes } from '../../../constants'
import axios from 'axios'
import { City, Country, State } from 'country-state-city'
import Pagination from '../../_components/Pagination'
import Loader from '../../_components/Loader'

const page = () => {
  const [search, setSearch] = useState('')
  const [country, setCountry] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [trainingStyle, setTrainingStyle] = useState('')
  const limit = 9

  const [fighters, setFighters] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const countries = Country.getAllCountries()
  const states = country ? State.getStatesOfCountry(country) : []
  const cities = country && state ? City.getCitiesOfState(country, state) : []

  const getFighters = async (search, country, state, city, trainingStyle) => {
    setLoading(true)
    try {
      let queryParams = `?page=${currentPage}&limit=${limit}`
      if (search) queryParams += `&search=${search}`
      if (country) queryParams += `&country=${country}`
      if (state) queryParams += `&state=${state}`
      if (city) queryParams += `&city=${city}`
      if (trainingStyle) queryParams += `&trainingStyle=${trainingStyle}`
      const response = await axios.get(`${API_BASE_URL}/fighters${queryParams}`)
      console.log('Fighters Response:', response.data)

      setFighters(response.data.data.items)
      setTotalPages(response.data.data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getFighters()
  }, [currentPage])

  const handleSearch = () => {
    getFighters(search, country, state, city, trainingStyle)
  }

  const handleReset = () => {
    setSearch(''),
      setCountry(''),
      setState(''),
      setCity(''),
      setTrainingStyle(''),
      getFighters()
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
                <div className='flex flex-col items-start'>
                  <label className='text-white text-sm mb-2'>City</label>
                  <div className='relative w-full'>
                    <select
                      className='appearance-none w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500'
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    >
                      <option value='' className='bg-purple-900'>
                        Select
                      </option>
                      {cities.map((name) => (
                        <option
                          key={name.name}
                          value={name.name}
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
                  <label className='text-white text-sm mb-2'>Game Type</label>
                  <div className='relative w-full'>
                    <select
                      className='appearance-none w-full bg-transparent border-b border-gray-600 text-white text-lg pb-2 focus:outline-none focus:border-red-500'
                      value={trainingStyle}
                      onChange={(e) => setTrainingStyle(e.target.value)}
                    >
                      <option value='' className='bg-purple-900'>
                        Select
                      </option>
                      {sportTypes.map((level) => (
                        <option
                          key={level}
                          value={level}
                          className='bg-purple-900'
                        >
                          {level}
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
      <div className='bg-black w-full mx-auto px-4 py-56 md:py-0 md:pt-32 flex flex-wrap justify-center gap-10 items-center'>
        {fighters.map((fighter) => {
          const countryCode = fighter.user?.country
          const stateCode = fighter.user?.state
          const cityCode = fighter.user?.city

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
              image={fighter.user?.profilePhoto}
              imageAlt={fighter.user?.firstName}
              location={`${cityName}, ${stateName}, ${countryName}`}
              name={`${
                fighter.user?.firstName + ' ' + fighter.user?.lastName
              } ${
                fighter.user?.nickName ? '-' + ' ' + fighter.user?.nickName : ''
              }`}
              bio={fighter.bio ?? ''}
              style={fighter.trainingStyle}
            />
          )
        })}
      </div>
      <div className='bg-black pb-8'>
        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}

export default page
