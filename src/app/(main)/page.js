'use client'
import axios from 'axios'
import { Button } from '../../../components/ui/button'
import { API_BASE_URL } from '../../constants'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Loader from '../_components/Loader'
import moment from 'moment'
import useStore from '../../stores/useStore'

export default function Home() {
  const user = useStore((state) => state.user)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [latestNews, setLatestNews] = useState(null)
  const [events, setEvents] = useState([])
  const [latestMedia, setLatestMedia] = useState([])
  const [topFighters, setTopFighters] = useState([])
  const [featuredResult, setFeaturedResult] = useState(null)

  const isLoggedIn = !!user

  useEffect(() => {
    const fetchHomeSettings = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/home-config`)
        const resData = response.data.data
        console.log('Fetched home config:', resData)

        setData(resData || {})
        setLatestNews(resData.latestNews || resData?.latestNews || null)
        setEvents(
          Array.isArray(resData.upcomingEvents) ? resData.upcomingEvents : []
        )
        setLatestMedia(
          Array.isArray(resData?.latestMedia) ? resData.latestMedia : []
        )
        setTopFighters(
          Array.isArray(resData.topFighters) ? resData.topFighters : []
        )
        setFeaturedResult(resData.featuredResult || null)
      } catch (err) {
        console.error('Error fetching home config:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchHomeSettings()
  }, [])

  const sortedMedia = [...latestMedia].sort((a, b) => a.sortOrder - b.sortOrder)

  if (loading) {
    return (
      <div className='flex items-center justify-center h-screen w-full bg-[#07091D]'>
        <Loader />
      </div>
    )
  }

  return (
    <main>
      {/* Hero Section */}
      <section className='bg-transparent w-full flex flex-col lg:flex-row px-4 md:px-10 lg:px-40 py-12 gap-10'>
        <div className='flex-1 flex flex-col justify-center text-center lg:text-left'>
          {(() => {
            const name = data?.platformName || ''
            const words = name.trim().split(' ')
            const firstLine = words.slice(0, -1).join(' ')
            const lastWord = words[words.length - 1]

            return (
              <>
                <h1 className='text-white font-bold text-3xl sm:text-4xl md:text-5xl uppercase tracking-wide'>
                  {firstLine}
                </h1>
                <h2 className='text-red-500 font-bold text-3xl sm:text-4xl md:text-5xl uppercase tracking-wide mt-2'>
                  {lastWord}
                </h2>
              </>
            )
          })()}

          <p className='text-white text-lg sm:text-xl mt-4 max-w-xl mx-auto lg:mx-0 leading-relaxed'>
            {data?.tagline}
          </p>

          {!isLoggedIn && (
            <div className='mt-6 flex justify-center lg:justify-start'>
              <Link href={data?.cta?.link || '#'}>
                <Button
                  variant='destructive'
                  size='lg'
                  className='py-4 px-8 text-lg rounded'
                >
                  {data?.cta?.text}
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className='flex-1 relative overflow-hidden border-4 border-red-600 w-full h-[400px] sm:h-[500px] md:h-[600px]'>
          <img
            src={data?.heroImage}
            alt={data?.platformName}
            className='w-full h-full object-cover'
          />
          <div className='absolute inset-0 bg-gradient-to-r from-blue-900/30 to-red-600/30'></div>
        </div>
      </section>

      {/* Top Fighters Section */}
      {topFighters.length > 0 && (
        <section className='bg-transparent w-full py-16 px-4 md:px-10 lg:px-20'>
          <div className='max-w-7xl mx-auto'>
            <h2 className='text-white text-3xl md:text-4xl font-bold uppercase tracking-wide mb-12 text-center'>
              Top Fighters
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-white'>
            {topFighters.map((fighter) => {
              const user = fighter.userId
              if (!user) return null

              const fullName = `${user.firstName || ''} ${
                user.lastName || ''
              }`.trim()
              const image = user.profilePhoto || '/fighter.png'

              return (
                <div
                  key={fighter._id}
                  className='flex flex-col items-center text-center'
                >
                  <img
                    src={image}
                    alt={fullName}
                    className='w-full h-[300px] object-contain rounded-md mb-4'
                    onError={(e) => {
                      e.currentTarget.src = '/fighter.png'
                    }}
                  />
                  <p className='text-xl font-semibold'>{fullName}</p>

                  {fighter.recordHighlight && (
                    <p className='text-red-500 font-bold text-lg'>
                      {fighter.recordHighlight}
                    </p>
                  )}

                  {fighter.weightClass && (
                    <p className='text-gray-300 text-sm'>
                      {fighter.weightClass}
                    </p>
                  )}

                  {fighter.weight && (
                    <p className='text-gray-300 text-sm'>
                      {fighter.weight} lbs
                    </p>
                  )}

                  {fighter.nationalRank && (
                    <p className='text-yellow-400 text-sm font-medium'>
                      Rank: {fighter.nationalRank}
                    </p>
                  )}

                  <div className='flex gap-4 justify-center mt-4'>
                    {user.instagram && (
                      <a
                        href={user.instagram}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <img
                          src='/icons/instagram.svg'
                          alt='Instagram'
                          className='w-6 h-6'
                        />
                      </a>
                    )}
                    {user.facebook && (
                      <a
                        href={user.facebook}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <img
                          src='/icons/facebook.svg'
                          alt='Facebook'
                          className='w-6 h-6'
                        />
                      </a>
                    )}
                    {user.youtube && (
                      <a
                        href={user.youtube}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        <img
                          src='/icons/youtube.svg'
                          alt='YouTube'
                          className='w-6 h-6'
                        />
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events Section */}
      {events.length > 0 && (
        <section
          id='events'
          className='bg-transparent w-full py-16 px-4 md:px-10 lg:px-20'
        >
          <div className='max-w-7xl mx-auto'>
            <h2 className='text-white text-3xl md:text-4xl font-bold uppercase tracking-wide mb-12 text-center'>
              Upcoming Events
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-white'>
            {events.map((event) => (
              <div
                key={event._id}
                className='flex flex-col items-center text-center'
              >
                <img
                  src={event.poster}
                  alt={event.name}
                  className='w-full h-[300px] object-contain rounded-md'
                />
                <p className='text-xl font-semibold mt-4'>{event.name}</p>
                <p className='font-bold'>
                  {moment(event.startDate).format('LL')}
                </p>
                <Button
                  variant='destructive'
                  size='sm'
                  className='mt-2 rounded'
                >
                  BUY TICKETS
                </Button>
              </div>
            ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Fight Result Section */}
      {featuredResult && (
        <section className='bg-gradient-to-br from-purple-900/20 to-indigo-900/20 w-full py-16 px-4 md:px-10 lg:px-20'>
          <div className='max-w-6xl mx-auto'>
            <div className='text-center mb-12'>
              <h2 className='text-white text-3xl md:text-4xl font-bold uppercase tracking-wide mb-4'>
                Featured Fight Result
              </h2>
              <div className='w-24 h-1 bg-gradient-to-r from-yellow-500 to-red-500 mx-auto rounded-full'></div>
            </div>
            
            {/* Main Fight Card */}
            <div className='bg-gradient-to-br from-[#1a0b2e] via-[#16213e] to-[#0f3460] rounded-2xl p-6 md:p-8 lg:p-10 shadow-2xl border border-purple-500/30 backdrop-blur-sm'>
              {/* Fight Header */}
              <div className='text-center mb-8 md:mb-12'>
                <div className='inline-block bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-6 py-2 rounded-full font-bold text-lg md:text-xl mb-4'>
                  {featuredResult.bracket?.divisionTitle || 'Championship Fight'}
                </div>
                <p className='text-gray-300 text-base md:text-lg'>
                  {featuredResult.bracket?.sport} • {featuredResult.bracket?.ruleStyle}
                </p>
              </div>

              {/* Desktop Layout */}
              <div className='hidden lg:block'>
                <div className='flex items-center justify-between mb-8'>
                  {/* Red Corner */}
                  <div className='flex items-center space-x-6 flex-1'>
                    <div className='relative'>
                      <div className='w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center ring-4 ring-red-500/50'>
                        {featuredResult.bout?.redCorner?.profilePhoto ? (
                          <img
                            src={featuredResult.bout.redCorner.profilePhoto}
                            alt={`${featuredResult.bout?.redCorner?.firstName} ${featuredResult.bout?.redCorner?.lastName}`}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='text-white font-bold text-xl'>
                            {featuredResult.bout?.redCorner?.firstName?.[0]}
                            {featuredResult.bout?.redCorner?.lastName?.[0]}
                          </div>
                        )}
                      </div>
                      <div className='absolute -bottom-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full'>
                        RED
                      </div>
                    </div>
                    <div className='text-left'>
                      <h4 className='text-2xl font-bold text-white mb-2'>
                        {featuredResult.bout?.redCorner?.firstName} {featuredResult.bout?.redCorner?.lastName}
                      </h4>
                      <p className='text-gray-300 text-lg mb-1'>
                        {featuredResult.bout?.redCorner?.country}
                      </p>
                      {featuredResult.bout?.redCorner?.weightClass && (
                        <p className='text-gray-400 text-sm'>
                          {featuredResult.bout?.redCorner?.weightClass}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* VS and Result Center */}
                  <div className='text-center mx-8 flex-shrink-0'>
                    <div className='text-white text-4xl font-bold mb-6 tracking-widest'>VS</div>
                    {featuredResult.winner && (
                      <div className='bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-6 py-3 rounded-xl font-bold text-lg mb-3 shadow-lg'>
                        🏆 {featuredResult.winner?.firstName} {featuredResult.winner?.lastName}
                      </div>
                    )}
                    {featuredResult.resultMethod && (
                      <p className='text-gray-300 text-sm uppercase tracking-wide'>
                        Victory by {featuredResult.resultMethod}
                      </p>
                    )}
                  </div>

                  {/* Blue Corner */}
                  <div className='flex items-center space-x-6 flex-1 justify-end'>
                    <div className='text-right'>
                      <h4 className='text-2xl font-bold text-white mb-2'>
                        {featuredResult.bout?.blueCorner?.firstName} {featuredResult.bout?.blueCorner?.lastName}
                      </h4>
                      <p className='text-gray-300 text-lg mb-1'>
                        {featuredResult.bout?.blueCorner?.country}
                      </p>
                      {featuredResult.bout?.blueCorner?.weightClass && (
                        <p className='text-gray-400 text-sm'>
                          {featuredResult.bout?.blueCorner?.weightClass}
                        </p>
                      )}
                    </div>
                    <div className='relative'>
                      <div className='w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center ring-4 ring-blue-500/50'>
                        {featuredResult.bout?.blueCorner?.profilePhoto ? (
                          <img
                            src={featuredResult.bout.blueCorner.profilePhoto}
                            alt={`${featuredResult.bout?.blueCorner?.firstName} ${featuredResult.bout?.blueCorner?.lastName}`}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='text-white font-bold text-xl'>
                            {featuredResult.bout?.blueCorner?.firstName?.[0]}
                            {featuredResult.bout?.blueCorner?.lastName?.[0]}
                          </div>
                        )}
                      </div>
                      <div className='absolute -bottom-2 -left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full'>
                        BLUE
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile & Tablet Layout */}
              <div className='block lg:hidden'>
                <div className='space-y-6'>
                  {/* Red Corner */}
                  <div className='flex items-center space-x-4 bg-red-900/20 rounded-xl p-4'>
                    <div className='relative flex-shrink-0'>
                      <div className='w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center ring-2 ring-red-500/50'>
                        {featuredResult.bout?.redCorner?.profilePhoto ? (
                          <img
                            src={featuredResult.bout.redCorner.profilePhoto}
                            alt={`${featuredResult.bout?.redCorner?.firstName} ${featuredResult.bout?.redCorner?.lastName}`}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='text-white font-bold text-sm md:text-lg'>
                            {featuredResult.bout?.redCorner?.firstName?.[0]}
                            {featuredResult.bout?.redCorner?.lastName?.[0]}
                          </div>
                        )}
                      </div>
                      <div className='absolute -bottom-1 -right-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full'>
                        RED
                      </div>
                    </div>
                    <div className='flex-1'>
                      <h4 className='text-lg md:text-xl font-bold text-white mb-1'>
                        {featuredResult.bout?.redCorner?.firstName} {featuredResult.bout?.redCorner?.lastName}
                      </h4>
                      <p className='text-gray-300 text-sm md:text-base'>
                        {featuredResult.bout?.redCorner?.country}
                      </p>
                    </div>
                  </div>

                  {/* VS and Result */}
                  <div className='text-center py-4'>
                    <div className='text-white text-2xl md:text-3xl font-bold mb-4 tracking-widest'>VS</div>
                    {featuredResult.winner && (
                      <div className='bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-4 py-2 rounded-lg font-bold text-sm md:text-base mb-2 inline-block'>
                        🏆 Winner: {featuredResult.winner?.firstName} {featuredResult.winner?.lastName}
                      </div>
                    )}
                    {featuredResult.resultMethod && (
                      <p className='text-gray-300 text-xs md:text-sm uppercase tracking-wide'>
                        Victory by {featuredResult.resultMethod}
                      </p>
                    )}
                  </div>

                  {/* Blue Corner */}
                  <div className='flex items-center space-x-4 bg-blue-900/20 rounded-xl p-4'>
                    <div className='relative flex-shrink-0'>
                      <div className='w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center ring-2 ring-blue-500/50'>
                        {featuredResult.bout?.blueCorner?.profilePhoto ? (
                          <img
                            src={featuredResult.bout.blueCorner.profilePhoto}
                            alt={`${featuredResult.bout?.blueCorner?.firstName} ${featuredResult.bout?.blueCorner?.lastName}`}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='text-white font-bold text-sm md:text-lg'>
                            {featuredResult.bout?.blueCorner?.firstName?.[0]}
                            {featuredResult.bout?.blueCorner?.lastName?.[0]}
                          </div>
                        )}
                      </div>
                      <div className='absolute -bottom-1 -right-1 bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full'>
                        BLUE
                      </div>
                    </div>
                    <div className='flex-1'>
                      <h4 className='text-lg md:text-xl font-bold text-white mb-1'>
                        {featuredResult.bout?.blueCorner?.firstName} {featuredResult.bout?.blueCorner?.lastName}
                      </h4>
                      <p className='text-gray-300 text-sm md:text-base'>
                        {featuredResult.bout?.blueCorner?.country}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Judge Scores if available */}
              {featuredResult.judgeScores && (
                <div className='mt-8 bg-black/30 rounded-xl p-4 md:p-6 backdrop-blur-sm'>
                  <h4 className='text-white font-semibold mb-4 text-center text-lg md:text-xl'>Official Scorecard</h4>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='bg-gradient-to-br from-red-800/40 to-red-900/40 rounded-lg p-4 text-center border border-red-500/30'>
                      <div className='text-red-300 text-sm font-medium mb-2 uppercase tracking-wide'>Red Corner</div>
                      <div className='text-white font-bold text-xl'>
                        {featuredResult.judgeScores.red?.join(' - ') || 'N/A'}
                      </div>
                    </div>
                    <div className='bg-gradient-to-br from-blue-800/40 to-blue-900/40 rounded-lg p-4 text-center border border-blue-500/30'>
                      <div className='text-blue-300 text-sm font-medium mb-2 uppercase tracking-wide'>Blue Corner</div>
                      <div className='text-white font-bold text-xl'>
                        {featuredResult.judgeScores.blue?.join(' - ') || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Latest Media Section */}
      <section className='bg-transparent w-full py-16 px-4 md:px-10 lg:px-20'>
        <div className='max-w-7xl mx-auto'>
          <h2 className='text-white text-3xl md:text-4xl font-bold uppercase tracking-wide mb-12 text-center'>
            Latest Media
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-white'>
            {sortedMedia.map((item) => (
              <div key={item._id} className='flex flex-col items-center group'>
                <div className='w-full h-[250px] md:h-[300px] rounded-xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-105'>
                  <img
                    src={item.image}
                    alt={item.title}
                    className='w-full h-full object-cover'
                  />
                </div>
                <p className='text-lg md:text-xl font-semibold mt-4 text-center'>
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News Post Section */}
      {latestNews && (
        <section className='bg-transparent w-full py-16 px-4 md:px-10 lg:px-20'>
          <div className='max-w-7xl mx-auto'>
            <h2 className='text-white text-3xl md:text-4xl font-bold uppercase tracking-wide mb-12 text-center'>
              Latest News
            </h2>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center'>
              {/* Text Content */}
              <div className='flex flex-col gap-4 justify-center text-white order-2 lg:order-1'>
                {(() => {
                  const words = latestNews?.title?.split(' ') || []
                  const firstLine = words.slice(0, 4).join(' ')
                  const secondLine = words.slice(4).join(' ')
                  return (
                    <h3 className='text-2xl md:text-3xl lg:text-4xl font-bold mb-4 leading-tight'>
                      {firstLine}
                      {secondLine && (
                        <>
                          <br />
                          <span className='text-red-500'>{secondLine}</span>
                        </>
                      )}
                    </h3>
                  )
                })()}

                <p className='text-lg md:text-xl text-gray-300 mb-6'>
                  {moment(latestNews?.publishDate).format('LL')}
                </p>
                
                <div className='flex justify-start'>
                  <Link href='/news'>
                    <Button
                      variant='destructive'
                      size='lg'
                      className='py-4 px-8 text-lg rounded-lg transition-transform duration-300 hover:scale-105'
                    >
                      Read More
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Image */}
              <div className='order-1 lg:order-2'>
                <div className='w-full h-[300px] md:h-[400px] lg:h-[450px] rounded-xl overflow-hidden shadow-2xl'>
                  <img
                    src={latestNews?.coverImage}
                    alt={latestNews?.title}
                    className='w-full h-full object-cover'
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
