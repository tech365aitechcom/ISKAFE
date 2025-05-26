import React from 'react'
import { OfficialTitleContainer } from './_components/OfficialTitleContainer'

export default function OfficialTitleHolders() {
  return (
    <div className=' text-white p-8 flex justify-center relative overflow-hidden'>
      <div
        className='absolute -left-10 top-1/2 transform -translate-y-1/2 w-60 h-96 rounded-full opacity-70 blur-xl'
        style={{
          background:
            'linear-gradient(317.9deg, #6F113E 13.43%, rgba(111, 17, 62, 0) 93.61%)',
        }}
      ></div>
      <OfficialTitleContainer />
    </div>
  )
}
