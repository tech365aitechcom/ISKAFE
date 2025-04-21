import { Plus } from 'lucide-react'
import React from 'react'

export default function Fighters({ expandedBracket }) {
  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-lg font-semibold leading-8'>
          You can change sequence of fighters by drag & drop.
        </h2>
        <button
          className='text-white px-4 py-2 rounded-md cursor-pointer flex gap-2 items-center'
          style={{
            background:
              'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
          }}
          onClick={() => setShowAddVenues(true)}
        >
          <Plus size={18} />
          Add Fighter
        </button>
      </div>
      <div className='relative'>
        <div className='absolute top-0 left-1/2 w-[76%] h-[1px] bg-[#8C8C8C] translate-x-[-50%] z-0' />

        <div className='grid grid-cols-4 gap-4 my-4 pt-10 z-10 relative'>
          {expandedBracket.images.map((image, index) => (
            <div key={index} className='w-60 mx-auto relative'>
              <img
                src={image.src}
                className='w-60 h-60 border border-[#D9E2F930]'
              />
              <div className='text-center w-full mt-4'>
                <h3>{image.name}</h3>
                <h3>Age: {image.age}</h3>
              </div>

              <div className='absolute top-[-40px] left-1/2 w-[2px] h-10 bg-[#8C8C8C] -translate-x-1/2 z-0' />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
