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
  const [topFighters, setTopFighters] = useState([]) // Add this state
  const isLoggedIn = user ? true : false

  useEffect(() => {
    const fetchHomeSettings = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/home-config`)
        setData(response.data.data)
        setLatestNews(response.data.latestNews)
        setEvents(response.data.upcomingEvents)
        setLatestMedia(response.data.data.latestMedia)
        setTopFighters(response.data.topFighters || []) // Add this line
      } catch (err) {
        console.error(err)
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
        <section className='bg-transparent w-full py-12 px-4 md:px-20'>
          <h2 className='text-white text-3xl md:text-4xl font-bold uppercase tracking-wide mb-10 container mx-auto'>
            Top Fighters
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 text-white'>
            {topFighters.map((fighter) => (
              <div key={fighter._id} className='flex flex-col items-center text-center bg-gray-900/50 p-6 rounded-lg border border-gray-700 hover:border-red-600 transition-colors'>
                <div className='w-full h-[300px] mb-4 overflow-hidden rounded-md'>
                  <img
                    src={fighter.image}
                    alt={fighter.name}
                    className='w-full h-full object-cover'
                    onError={(e) => {
                      e.target.src = '/fighter.png' // Fallback image
                    }}
                  />
                </div>
                <h3 className='text-xl font-semibold mb-2'>{fighter.name}</h3>
                <p className='text-red-500 font-bold text-lg mb-2'>{fighter.record}</p>
                {fighter.weightClass && (
                  <p className='text-gray-300 text-sm mb-1'>{fighter.weightClass}</p>
                )}
                {fighter.weight && (
                  <p className='text-gray-300 text-sm mb-1'>{fighter.weight} lbs</p>
                )}
                {fighter.rank && (
                  <p className='text-yellow-400 text-sm font-medium'>Rank: {fighter.rank}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Events Section */}
      <section
        id='events'
        className='bg-transparent w-full py-12 px-4 md:px-20'
      >
        <h2 className='text-white text-3xl md:text-4xl font-bold uppercase tracking-wide mb-10 container mx-auto'>
          Upcoming Events
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-10 text-white'>
          {events.map((event, i) => (
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
              <Button variant='destructive' size='sm' className='mt-2 rounded'>
                BUY TICKETS
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Latest Media Section */}
      <section className='bg-transparent w-full py-12 px-4 md:px-20'>
        <h2 className='text-white text-3xl md:text-4xl font-bold uppercase tracking-wide mb-10 container mx-auto'>
          Latest Media
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-10 text-white'>
          {sortedMedia.map((item) => (
            <div key={item._id} className='flex flex-col items-center'>
              <img
                src={item.image}
                alt={item.title}
                className='w-full h-[300px] object-contain rounded-md'
              />
              <p className='text-xl font-semibold mt-4'>{item.title}</p>
            </div>
          ))}
        </div>
      </section>

      {/* News Post Section */}
      <section className='bg-transparent w-full py-12 px-4 md:px-20'>
        <h2 className='text-white text-3xl md:text-4xl font-bold uppercase tracking-wide mb-10 container mx-auto'>
          News Post
        </h2>
        <div className='flex flex-wrap md:justify-evenly w-full'>
          <div className='flex flex-col gap-4 justify-center text-white md:text-right '>
            {(() => {
              const words = latestNews?.title?.split(' ') || []
              const firstLine = words.slice(0, 4).join(' ')
              const secondLine = words.slice(4).join(' ')
              return (
                <h2 className='text-3xl md:text-5xl font-bold mb-4 leading-tight'>
                  {firstLine}
                  <br />
                  <span className='text-red-500'>{secondLine}</span>
                </h2>
              )
            })()}

            <p className='text-2xl'>
              {moment(latestNews?.publishDate).format('LL')}
            </p>
            <div className='w-full flex items-center justify-end mt-10'>
              <Link href='/news'>
                <Button
                  variant='destructive'
                  size='lg'
                  className='py-6 text-xl rounded '
                >
                  Read More
                </Button>
              </Link>
            </div>
          </div>
          <img
            src={latestNews?.coverImage}
            alt={latestNews?.title}
            className=' h-[400px] w-[600px] object-contain rounded-md'
          />
        </div>
      </section>
    </main>
  )
}