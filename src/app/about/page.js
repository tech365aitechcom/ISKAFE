import { Check } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

const points = [
  'Event scheduling',
  'Database of fighters, trainers, coaches, teams, camps, officials, venues, commissions, and more',
  'Head-to-head fight cards',
  'Single-elimination tournaments',
  'Results (decisions, stoppages, DQs, etc)',
  'Fighter profiles with fight history and results',
  'Fighter suspensions',
  'Single-elimination tournaments',
]

const AboutPage = () => {
  return (
    <div className='bg-[#28133A] md:bg-[#28133A80] container mx-auto md:p-10 md:px-14 mb-44 p-4 pb-12 rounded-lg flex flex-col items-center justify-center'>
      <div>
        <Image
          src='/ifs-logo.png'
          alt=''
          width={300}
          height={300}
          className='hidden md:block object-cover'
        />
        <Image
          src='/ifs-logo.png'
          alt=''
          width={500}
          height={300}
          className='md:hidden object-cover'
        />
      </div>
      <div className='text-white flex flex-col md:flex-row justify-between items-center mt-6 w-full'>
        <div>
          <h1 className='text-3xl md:text-5xl font-bold'>
            THE IKF FIGHT PLATFORM
          </h1>
          <p className='text-xl font-medium mt-4'>
            The IKF Fight Platform is the technology engine that powers
            International Fight Sports.
            <br /> It is the official technology platform for International
            Fight Sports and AK Promotions.
          </p>
          <div className='md:hidden mt-8'>
            <p className='text-xl font-medium'>
              The IKF Fight Platform has a robust set of capabilities for
              combat-sports events, including:
            </p>
            <ul className='list-none flex flex-col gap-2 mt-4'>
              {points.map((point, index) => (
                <li key={index} className='text-lg font-medium flex gap-2'>
                  <Check
                    size={20}
                    color='#4E2D92'
                    fontWeight={700}
                    className='mt-1'
                  />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className='pt-8 md:pt-24'>
            <h2 className='font-bold text-2xl'>Social</h2>
            <div className='flex gap-4 mt-2'>
              <Image src='/insta.png' alt='' width={30} height={30} />
              <Image src='/x.png' alt='' width={25} height={25} />
            </div>
          </div>
          <div className='pt-8 md:pt-12'>
            <h2 className='font-bold text-2xl'>Platforms</h2>
            <p className='font-medium text-xl mt-2'>
              IKF Fight Platform Partners
            </p>
          </div>
          <div className='pt-8 md:pt-12'>
            <h2 className='font-bold text-2xl'>
              Usage Outside International Fight Sports
            </h2>
            <p className='font-medium text-xl mt-2'>
              The IKF Fight Platform is also available for unaffiliated
              promoters, gyms, fight camps, trainers, <br /> coaches, and
              officials. Contact the team (email) for details.
            </p>
          </div>
        </div>
        <div className='hidden md:block'>
          <p className='text-xl font-medium'>
            The IKF Fight Platform has a robust set of capabilities for
            combat-sports events, including:
          </p>
          <ul className='list-none flex flex-col gap-2 mt-4'>
            {points.map((point, index) => (
              <li key={index} className='text-lg font-medium flex gap-2'>
                <Check
                  size={20}
                  color='#4E2D92'
                  fontWeight={700}
                  className='mt-1'
                />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
