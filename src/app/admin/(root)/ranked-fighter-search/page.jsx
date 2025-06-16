'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '../../../../constants'
import { enqueueSnackbar } from 'notistack'
import { Eye } from 'lucide-react'
import Link from 'next/link'
import Loader from '../../../_components/Loader'
import { City, Country, State } from 'country-state-city'

export default function RankedFighterSearch() {
  const [showResults, setShowResults] = useState(false)
  const [rankings, setRankings] = useState([])
  const [classifications, setClassifications] = useState([])
  const [loading, setLoading] = useState(false)

  const [filters, setFilters] = useState({
    proClassification: '',
    sport: '',
    weightClass: '',
    country: '',
    state: '',
    city: '',
  })

  const countries = Country.getAllCountries()
  const states = filters.country
    ? State.getStatesOfCountry(filters.country)
    : []
  const cities =
    filters.country && filters.state
      ? City.getCitiesOfState(filters.country, filters.state)
      : []

  const getTitles = async () => {
    setLoading(true)
    setRankings([])
    try {
      let queryParams = `?page=1&limit=100`
      if (filters.proClassification)
        queryParams += `&classification=${filters.proClassification}`
      if (filters.sport) queryParams += `&sport=${filters.sport}`
      if (filters.weightClass)
        queryParams += `&weightClass=${filters.weightClass}`
      if (filters.country) queryParams += `&country=${filters.country}`
      if (filters.state) queryParams += `&state=${filters.state}`
      if (filters.city) queryParams += `&city=${filters.city}`

      const response = await axios.get(
        `${API_BASE_URL}/official-title-holders?${queryParams}`
      )
      console.log('Response:', response.data)
      setRankings(response.data.data.items)
      setShowResults(true)
    } catch (error) {
      console.log('Error fetching promoter:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMasterData = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/master/proClassifications`
      )
      setClassifications(response.data.result)
    } catch (err) {
      console.error('Failed to fetch classifications:', err)
    }
  }

  const selectedClassification = classifications.find(
    (c) => c.label === filters.proClassification
  )

  const sportOptions =
    selectedClassification?.sports.map((sport) => sport.label) || []

  const selectedSport = selectedClassification?.sports.find(
    (s) => s.label === filters.sport
  )

  const weightClassOptions = selectedSport?.weightClass || []

  const selectOptionsMap = {
    proClassification: classifications.map((c) => c.label),
    sport: sportOptions,
    weightClass: weightClassOptions,
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
      ...(name === 'proClassification' && { sport: '', weightClass: '' }),
      ...(name === 'sport' && { weightClass: '' }),
    }))
  }

  useEffect(() => {
    fetchMasterData()
  }, [])

  const handleSearch = () => {
    // Validate required fields
    if (!filters.proClassification || !filters.sport || !filters.weightClass) {
      enqueueSnackbar(
        'Please select all required fields: Pro Classification, Sport, and Weight Class',
        { variant: 'error' }
      )
      return
    }

    getTitles()
  }

  useEffect(() => {
    setShowResults(false)
  }, [filters])

  const renderHeader = (label) => (
    <th className='px-4 pb-3 whitespace-nowrap cursor-pointer'>
      <div className='flex items-center gap-1'>{label}</div>
    </th>
  )

  return (
    <div className='text-white p-8 flex justify-center relative overflow-hidden'>
      <div
        className='absolute -left-10 top-1/2 transform -translate-y-1/2 w-60 h-96 rounded-full opacity-70 blur-xl'
        style={{
          background:
            'linear-gradient(317.9deg, #6F113E 13.43%, rgba(111, 17, 62, 0) 93.61%)',
        }}
      ></div>
      <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-semibold leading-8'>
            Ranked Fighter Search
          </h2>
        </div>

        <div className='flex flex-wrap items-center gap-4 mb-6'>
          {[
            { label: 'Pro Classification', name: 'proClassification' },
            { label: 'Sport', name: 'sport' },
            { label: 'Weight Class', name: 'weightClass' },
          ].map(({ label, name }, index, arr) => {
            // Determine previous field name, or null if first
            const prevFieldName = index > 0 ? arr[index - 1].name : null

            // Disable current field if previous is not selected (and previous exists)
            const disabled = prevFieldName ? !filters[prevFieldName] : false

            return (
              <div key={name} className='relative w-64 mb-4'>
                <label className='block mb-2 text-sm font-medium text-white'>
                  {label}
                  <span className='text-red-500'>*</span>
                </label>
                <div className='relative flex items-center justify-between w-full px-4 py-2 border border-gray-700 rounded-lg'>
                  <select
                    name={name}
                    value={filters[name]}
                    onChange={handleChange}
                    className='w-full bg-transparent text-white appearance-none outline-none cursor-pointer'
                    required={!disabled}
                    disabled={disabled}
                  >
                    <option value='' className='text-black'>
                      Select {label}
                    </option>
                    {selectOptionsMap[name].map((opt) => (
                      <option key={opt} value={opt} className='text-black'>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )
          })}
          {/* Country Filter */}
          <div className='relative w-64 mb-4'>
            <label className='block mb-2 text-sm font-medium text-white'>
              Country
            </label>
            <div className='relative flex items-center justify-between w-full px-4 py-2 border border-gray-700 rounded-lg'>
              <select
                name='country'
                value={filters.country}
                onChange={handleChange}
                className='w-full bg-transparent text-white appearance-none outline-none cursor-pointer'
              >
                <option value='' className='text-black'>
                  Select Country
                </option>
                {countries.map((country) => (
                  <option
                    key={country.isoCode}
                    value={country.isoCode}
                    className='text-black'
                  >
                    {country.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* State Filter */}
          <div className='relative w-64 mb-4'>
            <label className='block mb-2 text-sm font-medium text-white'>
              State
            </label>
            <div className='relative flex items-center justify-between w-full px-4 py-2 border border-gray-700 rounded-lg'>
              <select
                name='state'
                value={filters.state}
                onChange={handleChange}
                className='w-full bg-transparent text-white appearance-none outline-none cursor-pointer'
                disabled={!filters.country}
              >
                <option value='' className='text-black'>
                  Select State
                </option>
                {states.map((state) => (
                  <option
                    key={state.isoCode}
                    value={state.isoCode}
                    className='text-black'
                  >
                    {state.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* City Filter */}
          <div className='relative w-64 mb-4'>
            <label className='block mb-2 text-sm font-medium text-white'>
              City
            </label>
            <div className='relative flex items-center justify-between w-full px-4 py-2 border border-gray-700 rounded-lg'>
              <select
                name='city'
                value={filters.city}
                onChange={handleChange}
                className='w-full bg-transparent text-white appearance-none outline-none cursor-pointer'
                disabled={!filters.state}
              >
                <option value='' className='text-black'>
                  Select City
                </option>
                {cities.map((city) => (
                  <option
                    key={city.name}
                    value={city.name}
                    className='text-black'
                  >
                    {city.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSearch}
            className='bg-purple-600 hover:bg-purple-700 mt-2 text-white font-medium py-2 px-6 rounded transition duration-200'
          >
            Get Ranked Fighters
          </button>
        </div>
        {loading ? (
          <Loader />
        ) : (
          <>
            {showResults && (
              <div className='overflow-x-auto'>
                <table className='w-full text-sm text-left'>
                  <thead>
                    <tr className='text-gray-400 text-sm'>
                      {renderHeader('Rank', 'rank')}
                      {renderHeader('Name', 'name')}
                      {renderHeader('Country', 'country')}
                      {renderHeader('Wins/Losses', 'wins_losses')}
                      {renderHeader('Gym', 'gym')}
                      {renderHeader('Title', 'title')}
                      {renderHeader('Actions', 'actions')}
                    </tr>
                  </thead>
                  <tbody>
                    {rankings && rankings.length > 0 ? (
                      rankings.map((ranking, index) => {
                        return (
                          <tr
                            key={ranking._id}
                            className={`cursor-pointer ${
                              index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                            }`}
                          >
                            <td className='p-4'>{index + 1}</td>

                            <td className='p-4'>
                              {ranking.fighter?.userId?.firstName +
                                ' ' +
                                ranking.fighter?.userId?.lastName}
                            </td>
                            <td className='p-4'>
                              {ranking.fighter.userId.country}
                            </td>
                            <td className='p-4'>
                              {ranking.fighter.recordHighlight}
                            </td>
                            <td className='p-4'>
                              {ranking.fighter.primaryGym}
                            </td>
                            <td className='p-4'>{ranking.title}</td>
                            <td className='p-4'>
                              <Link href={`/fighters/${ranking.fighter._id}`}>
                                <button className='text-gray-400 hover:text-gray-200 transition flex gap-2'>
                                  View Profile
                                  <Eye size={20} />
                                </button>
                              </Link>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr className='text-center bg-[#0A1330]'>
                        <td colSpan={7} className='p-4'>
                          No Rankings found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
