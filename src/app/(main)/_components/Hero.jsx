import React from 'react'

const Hero = () => {
  return (
    <div className='bg-transparent w-full flex flex-col md:flex-row lg:px-40'>
      <div className='flex-1 p-8 pt-16 pb-16 flex flex-col justify-center'>
        <h1 className='text-white font-bold text-4xl md:text-5xl uppercase tracking-wide'>
          COMBAT SPORTS
        </h1>
        <h2 className='text-red-500 font-bold text-4xl md:text-5xl uppercase tracking-wide mt-2'>
          CIRCUIT
        </h2>
        <p className='text-white text-xl mt-10 max-w-lg leading-relaxed'>
          Where Kickboxing, Muey Thai, and boxing champions are forged
        </p>

        <div className='mt-10 flex justify-between w-full'>
          <button className='bg-red-600 text-white font-bold px-2 py-4 uppercase text-xl'>
            Register Now
          </button>
          <a className=' text-center hidden md:block' href='#events'>
            <p className='text-gray-400 text-xs'>Scroll to explore</p>
            <div className='text-white text-xl font-bold mt-1 flex text-center justify-center'>
              <svg
                width='20'
                height='40'
                viewBox='0 0 20 40'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M10.027 28.6704C9.41683 28.6704 8.9224 29.1648 8.9224 29.7751V36.1698L6.82868 34.3392C6.36942 33.9382 5.67218 33.9848 5.2704 34.4433C4.86861 34.9025 4.9152 35.6001 5.37447 36.0018L9.2994 39.4348C9.50894 39.6176 9.76787 39.7077 10.026 39.7077H10.0268C10.2849 39.7077 10.5441 39.6176 10.7534 39.4343L14.6764 36.0013C15.1356 35.5995 15.182 34.9019 14.7802 34.443C14.3792 33.9837 13.6814 33.938 13.2219 34.3392L11.1304 36.169L11.1309 29.7745C11.1318 29.1648 10.6371 28.6704 10.0272 28.6704L10.027 28.6704Z'
                  fill='white'
                />
                <path
                  d='M19.4689 19.9374V7.28101C19.4689 3.4038 16.3146 0.249512 12.4376 0.249512H7.61564C3.73786 0.249512 0.583008 3.4038 0.583008 7.28101V19.9374C0.583008 23.8146 3.73786 26.9695 7.61564 26.9695H12.4376C16.3146 26.9695 19.4689 23.8149 19.4689 19.9374ZM17.2596 19.9374C17.2596 22.5973 15.0967 24.7608 12.4371 24.7608H7.61564C4.95579 24.7608 2.792 22.5973 2.792 19.9374V7.28101C2.792 4.62172 4.95607 2.45815 7.61564 2.45815H12.4376C15.0969 2.45815 17.2602 4.62165 17.2602 7.28101V19.9374H17.2596Z'
                  fill='white'
                />
                <path
                  d='M10.0275 6.51263C9.41727 6.51263 8.92285 7.00706 8.92285 7.61728V10.8991C8.92285 11.5093 9.41726 12.0037 10.0275 12.0037C10.6377 12.0037 11.1321 11.5093 11.1321 10.8991V7.61728C11.1321 7.00734 10.6374 6.51263 10.0275 6.51263Z'
                  fill='white'
                />
              </svg>
            </div>
          </a>
        </div>
      </div>
      <div className='flex-1 border-4 border-red-600 relative overflow-hidden w-[530px] h-[600px]'>
        <img
          src='/hero.png'
          alt='Kickboxer in white gloves'
          className='w-full h-full object-cover'
        />
        <div className='absolute inset-0 bg-gradient-to-r from-blue-900/30 to-red-600/30'></div>
        <div className='absolute bottom-6 left-0 right-0 flex justify-center space-x-2'>
          <div className='h-2 w-2 rounded-full bg-white'></div>
          <div className='h-2 w-2 rounded-full bg-gray-500'></div>
          <div className='h-2 w-2 rounded-full bg-gray-500'></div>
          <div className='h-2 w-2 rounded-full bg-gray-500'></div>
          <div className='h-2 w-2 rounded-full bg-gray-500'></div>
        </div>
      </div>
    </div>
  )
}

export default Hero
