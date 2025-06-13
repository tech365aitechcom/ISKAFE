'use client'
import axios from 'axios'
import { Button } from '../../../components/ui/button'
import { API_BASE_URL } from '../../constants'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Loader from '../_components/Loader'
import moment from 'moment'

const fighters = [
  { name: 'Tugruk Smith', record: '16–2', image: '/fighter.png' },
  { name: 'Eric Franks', record: '20–6', image: '/fighter.png' },
  { name: 'Alex Warner', record: '12–1', image: '/fighter.png' },
]

const events = [
  {
    title: 'Summer Showdown',
    date: 'June 14, 2025',
    image: '/fighter.png',
  },
  {
    title: 'Kickboxing Championship',
    date: 'August 14, 2025',
    image: '/fighter.png',
  },
  {
    title: 'Alex Warner',
    date: 'September, 2025',
    image: '/fighter.png',
  },
]

const media = [
  {
    title: 'Highlight Reel 2024',
    image: '/fighter.png',
  },
  {
    title: 'Behind the Gloves',
    image: '/fighter.png',
  },
  {
    title: 'Training Camp Secrets',
    image: '/fighter.png',
  },
]

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [latestNews, setLatestNews] = useState(null)

  useEffect(() => {
    const fetchHomeSettings = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/home-config`)
        setData(response.data.data)
        setLatestNews(response.data.latestNews)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchHomeSettings()
  }, [])

  console.log('data', data)

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
      <section className='bg-transparent w-full py-12 px-4 md:px-20'>
        <h2 className='text-white text-3xl md:text-4xl font-bold uppercase tracking-wide mb-10 container mx-auto'>
          Top Fighters
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-10 text-white'>
          {fighters.map((fighter, i) => (
            <div key={i} className='flex flex-col items-center text-center'>
              <img
                src={fighter.image}
                alt={fighter.name}
                className='w-full h-[300px] object-contain rounded-md'
              />
              <p className='text-xl font-semibold mt-4'>{fighter.name}</p>
              <p className='font-bold'>{fighter.record}</p>
            </div>
          ))}
        </div>
      </section>

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
            <div key={i} className='flex flex-col items-center text-center'>
              <img
                src={event.image}
                alt={event.title}
                className='w-full h-[300px] object-contain rounded-md'
              />
              <p className='text-xl font-semibold mt-4'>{event.title}</p>
              <p className='font-bold'>{event.date}</p>
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
          {media.map((item, i) => (
            <div key={i} className='flex flex-col items-center'>
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
      <section className='bg-transparent w-full py-12 px-4 md:px-20'>
        <h2 className='text-white text-3xl md:text-4xl font-bold uppercase tracking-wide mb-10 container mx-auto'>
          Recent Event Results
        </h2>
        <div className='flex flex-wrap gap-4 justify-evenly w-full'>
          <img
            src='/fighter.png'
            alt='Tugruk Smith'
            className=' h-[300px] object-contain rounded-md'
          />
          <div className='flex flex-col gap-4 justify-center text-white text-left '>
            <p className='text-2xl'>April 19,2025</p>
            <h2 className='text-5xl'>Professional Photography</h2>
            <p className='text-2xl'>
              Professional photographers capture combat sports action at a
              <br /> new venue at inticulate sports
            </p>
            <div className='w-full flex items-center justify-start mt-10'>
              <Button
                variant='destructive'
                size='lg'
                className='py-6 text-xl rounded '
              >
                Read More
              </Button>
            </div>
          </div>
        </div>
      </section>
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
