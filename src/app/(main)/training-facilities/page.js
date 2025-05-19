'use client'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const trainingFacilities = [
  {
    name: 'Arnett Sport Kung Fu Association',
    slug: 'arnett-sport-kung-fu-association',
    logo: '/sportskungfu.png',
    location: 'Jacksonville, FL, USA',
  },
  {
    name: 'Arnett Sport Kung Fu Association',
    slug: 'arnett-sport-kung-fu-association',
    logo: '/sportskungfu.png',
    location: 'Jacksonville, FL, USA',
  },
  {
    name: 'Arnett Sport Kung Fu Association',
    slug: 'arnett-sport-kung-fu-association',
    logo: '/sportskungfu.png',
    location: 'Jacksonville, FL, USA',
  },
  {
    name: 'Arnett Sport Kung Fu Association',
    slug: 'arnett-sport-kung-fu-association',
    logo: '/sportskungfu.png',
    location: 'Jacksonville, FL, USA',
  },
  {
    name: 'Arnett Sport Kung Fu Association',
    slug: 'arnett-sport-kung-fu-association',
    logo: '/sportskungfu.png',
    location: 'Jacksonville, FL, USA',
  },
  {
    name: 'Arnett Sport Kung Fu Association',
    slug: 'arnett-sport-kung-fu-association',
    logo: '/sportskungfu.png',
    location: 'Jacksonville, FL, USA',
  },
  {
    name: 'Arnett Sport Kung Fu Association',
    slug: 'arnett-sport-kung-fu-association',
    logo: '/sportskungfu.png',
    location: 'Jacksonville, FL, USA',
  },
  {
    name: 'Arnett Sport Kung Fu Association',
    slug: 'arnett-sport-kung-fu-association',
    logo: '/sportskungfu.png',
    location: 'Jacksonville, FL, USA',
  },
]

const countryStates = {
  usa: ['California', 'Texas', 'New York', 'Florida', 'Illinois'],
  uk: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
  japan: ['Tokyo', 'Osaka', 'Kyoto', 'Hokkaido'],
  korea: ['Seoul', 'Busan', 'Incheon', 'Daegu'],
}

const TrainingFacilitiesPage = () => {
  const [facilityName, setFacilityName] = useState('')
  const [country, setCountry] = useState('')
  const [state, setState] = useState('')
  const [bgImage, setBgImage] = useState('/Cover.png')
  const [topPosition, setTopPosition] = useState('90%')
  const [isShowForm, setIsShowForm] = useState(false)

  const handleSearch = () => {
    console.log('Searching for:', { facilityName, country, state })
    // Implement actual search functionality here
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
                      <option value='usa' className='bg-purple-900'>
                        USA
                      </option>
                      <option value='uk' className='bg-purple-900'>
                        UK
                      </option>
                      <option value='japan' className='bg-purple-900'>
                        Japan
                      </option>
                      <option value='korea' className='bg-purple-900'>
                        South Korea
                      </option>
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
                      {countryStates[country]?.map((stateOption) => (
                        <option
                          key={stateOption}
                          value={stateOption.toLowerCase()}
                          className='bg-purple-900'
                        >
                          {stateOption}
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
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className='mt-72 mb-12 md:my-56 mx-4'>
        <div className='container mx-auto'>
          <div className='flex justify-end mb-4'>
            <Link href='/training-facilities/register'>
              <button className='bg-yellow-500 text-white px-4 py-2 rounded font-bold hover:bg-yellow-600 transition-colors'>
                Register Your Training Facility
              </button>
            </Link>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
            {trainingFacilities.map((facility, index) => (
              <Link key={index} href={`/training-facilities/${facility.slug}`}>
                <div
                  key={index}
                  className='bg-black border border-gray-600 shadow-lg pt-4 flex flex-col hover:scale-105 transition-transform'
                >
                  <div className='mb-4 flex justify-center'>
                    <img
                      src={facility.logo}
                      alt={`${facility.name} logo`}
                      className='w-36 h-36 object-contain'
                    />
                  </div>
                  <div className='flex items-center text-gray-400 py-2 px-4'>
                    <img
                      src='/Flag.png'
                      alt='USA Flag'
                      className='w-5 h-3 mr-2'
                    />
                    <span className=''>{facility.location}</span>
                  </div>
                  <h3 className='text-white font-bold text-left mb-2 text-2xl border-t border-gray-600 pt-2 px-4'>
                    {facility.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default TrainingFacilitiesPage
