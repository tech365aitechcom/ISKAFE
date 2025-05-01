'use client'

import VideoCard from '../_components/VideoCard'

const VideosSections = () => {
  const videos = [
    {
      id: 1,
      title: 'IFS',
      location: 'The Grand Theater Anaheim, CA, USA',
      thumbnail: '/api/placeholder/300/200',
    },
    {
      id: 2,
      title: 'All Out Battle 6',
      location: 'The Grand Theater Anaheim, CA, USA',
      thumbnail: '/api/placeholder/300/200',
    },
    {
      id: 3,
      title: 'Triangle Kickboxing Promotions presents...',
      location: 'The Grand Theater Anaheim, CA, USA',
      thumbnail: '/api/placeholder/300/200',
    },
    {
      id: 4,
      title: 'IKF Federation Point/ Kickbox',
      location: 'The Grand Theater Anaheim, CA, USA',
      thumbnail: '/api/placeholder/300/200',
    },
  ]

  return (
    <div className='bg-transparent py-10  h-fit w-full lg:px-40'>
      <div className='text-center mb-10'>
        <p className='text-white text-sm uppercase tracking-wider'>
          LEARN MORE ABOUT
        </p>
        <h2 className='text-white text-4xl font-bold mt-2'>Upcoming Videos</h2>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative mt-10'>
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            title={video.title}
            location={video.location}
          />
        ))}

        <div className='hidden lg:flex absolute -right-8 top-1/2 transform -translate-y-1/2'>
          <button className='bg-red-600 rounded-full p-3 text-white hover:bg-red-700'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <path d='M9 18l6-6-6-6' />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default VideosSections
