'use client'
import { API_BASE_URL } from '../../../constants'
import axios from 'axios'
import Link from 'next/link'
import { enqueueSnackbar } from 'notistack'
import React, { useEffect, useState } from 'react'
import Loader from '../../_components/Loader'
import { Country } from 'country-state-city'

const RankingPage = () => {
  const [bgImage, setBgImage] = useState('/Cover.png')
  const [showResults, setShowResults] = useState(false)
  const [rankings, setRankings] = useState([])
  const [classifications, setClassifications] = useState([])
  const [loading, setLoading] = useState(false)

  const [filters, setFilters] = useState({
    proClassification: '',
    sport: '',
    weightClass: '',
  })

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
    const updateBackground = () => {
      setBgImage(
        window.innerWidth >= 768 ? '/Cover.png' : '/rakning_cover_mobile.png'
      )
    }

    updateBackground()
    window.addEventListener('resize', updateBackground)

    return () => window.removeEventListener('resize', updateBackground)
  }, [])

  useEffect(() => {
    setShowResults(false)
  }, [filters])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFilters((prevState) => ({
      ...prevState,
      [name]: value,
      ...(name === 'proClassification' && { sport: '', weightClass: '' }),
      ...(name === 'sport' && { weightClass: '' }),
    }))
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

  return (
    <main className='md:pb-56 min-h-screen bg-black'>
      <section
        className='w-full py-16 px-4 relative bg-cover bg-center'
        style={{
          backgroundImage: `url(${bgImage})`,
          boxShadow: 'inset 0 0 50px rgba(76, 0, 255, 0.2)',
        }}
      >
        <div className='absolute inset-0 bg-black opacity-20'></div>
        <div className='max-w-4xl mx-auto text-center relative z-10'>
          <h2 className='text-white text-3xl md:text-4xl font-medium mb-4'>
            IKF Official Fighter Ranking
          </h2>
          <p className='text-white text-xl font-medium my-4'>
            Fighters earn championship titles through bout victories. The IKF
            Fighter Ranking Engine automates much of this research to help
            identify these title contenders.
          </p>
        </div>
      </section>

      <section className='px-4 w-full mx-auto max-w-5xl mt-16'>
        <h2 className='text-white text-2xl md:text-3xl font-medium mb-4 text-center'>
          Get the ranked fighters for the particular weight class
        </h2>
        <div className='flex flex-col md:flex-row gap-8 justify-between py-14 md:px-16'>
          <div className='flex flex-col items-center gap-4'>
            <img
              src='/pro.png'
              alt='Pro Classification'
              className='w-24 h-24 object-cover'
            />
            <h2 className='text-white text-xl'>
              Choose the Pro Classification
            </h2>
          </div>
          <div className='flex flex-col items-center gap-4'>
            <img
              src='/sport.png'
              alt='Sport'
              className='w-24 h-24 object-cover'
            />
            <h2 className='text-white text-xl'>Choose the Sport</h2>
          </div>
          <div className='flex flex-col items-center gap-4'>
            <img
              src='/weight.png'
              alt='Weight Class'
              className='w-24 h-24 object-cover'
            />
            <h2 className='text-white text-xl'>Choose A Weight Class</h2>
          </div>
        </div>

        <div className='bg-gray-900 bg-opacity-80 rounded-xl p-8 shadow-xl border border-purple-800'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
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
                <div key={name} className='bg-[#00000061] p-2 rounded'>
                  <label className='block text-sm font-medium mb-1 text-white'>
                    {label}
                    <span className='text-red-500'>*</span>
                  </label>
                  <select
                    name={name}
                    value={filters[name]}
                    onChange={handleChange}
                    className='w-full bg-transparent outline-none text-white'
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
              )
            })}
          </div>

          <div className='mt-8 flex justify-center'>
            <button
              onClick={handleSearch}
              className='bg-red-500 text-white px-12 py-3 rounded font-medium hover:bg-red-600 transition-colors transform hover:scale-105 active:scale-95'
            >
              Search Rankings
            </button>
          </div>
        </div>
      </section>

      {/* Desktop Results */}
      {showResults && (
        <section className='bg-transparent text-white px-4 sm:px-6 md:px-8 py-12 sm:py-16'>
          <div className='max-w-6xl mx-auto'>
            {loading ? (
              <Loader />
            ) : (
              <div className='flex flex-col md:flex-row gap-8'>
                {/* Rankings Section */}
                <div className='bg-transparent border border-gray-300 p-4 sm:p-6 md:p-8 w-full'>
                  <div className='text-center mb-6 sm:mb-8'>
                    <h3 className='bg-gradient-to-b from-yellow-400 to-yellow-200 bg-clip-text text-transparent font-bold uppercase text-sm sm:text-base md:text-lg'>
                      {filters.proClassification} &gt; {filters.sport} &gt;{' '}
                      {filters.weightClass}
                    </h3>
                  </div>

                  {rankings.length > 0 ? (
                    <div className='mt-8 sm:mt-12 border-t border-gray-600 pt-6 sm:pt-8'>
                      <h4 className='text-white text-base sm:text-lg font-medium mb-4 sm:mb-6'>
                        Complete Rankings
                      </h4>
                      <div className='space-y-4 sm:space-y-3'>
                        {rankings.map((ranking, index) => (
                          <div
                            key={index}
                            className='flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-800 bg-opacity-50 rounded-lg hover:bg-opacity-70 transition-all gap-4 sm:gap-0'
                          >
                            <div className='flex items-center space-x-4'>
                              <div className='text-white font-bold text-base sm:text-lg w-6 sm:w-8 text-center'>
                                {index + 1}
                              </div>
                              <img
                                src={ranking.fighter.userId.profilePhoto}
                                alt={ranking.fighter.userId.firstName}
                                className='w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-full'
                              />
                              <div>
                                <h5 className='text-white text-sm sm:text-base font-medium'>
                                  {ranking.fighter.userId.firstName +
                                    ' ' +
                                    ranking.fighter.userId.lastName}
                                </h5>
                                <p className='text-gray-400 text-xs sm:text-sm capitalize'>
                                  {
                                    Country.getCountryByCode(
                                      ranking.fighter.userId.country
                                    ).name
                                  }
                                  • {ranking.fighter.primaryGym}
                                </p>
                              </div>
                            </div>

                            <div className='flex flex-col sm:flex-row sm:items-center sm:space-x-4 w-full sm:w-auto'>
                              <p className='text-white font-medium text-sm sm:text-base text-right sm:text-left'>
                                {ranking.fighter.recordHighlight}
                              </p>
                              <Link href={`/fighters/${ranking.fighter._id}`}>
                                <button className='mt-2 sm:mt-0 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 transition-colors w-full sm:w-auto'>
                                  View Profile
                                </button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className='text-white text-lg font-medium mb-6'>
                      No Rankings Found
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  )
}

export default RankingPage
