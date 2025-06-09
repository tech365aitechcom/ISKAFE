'use client'
import Loader from '../../../_components/Loader'
import { API_BASE_URL } from '../../../../constants'
import axios from 'axios'
import Image from 'next/image'
import React, { use, useEffect, useState } from 'react'
import Flag from 'react-world-flags'

const TrainingFacilitiesDetailsPage = ({ params }) => {
  const { id } = use(params)
  const [loading, setLoading] = useState(true)
  const [facilityDetails, setFacilityDetails] = useState(null)

  useEffect(() => {
    const fetchFacilityDetails = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/training-facilities/${id}`
        )
        setFacilityDetails(response.data.data)
      } catch (error) {
        console.error('Error fetching facility details:', error)
        console.log('Error fetching facility details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFacilityDetails()
  }, [id])

  if (loading) {
    return <Loader />
  }

  return (
    <div className='text-white container w-full mx-auto my-14 mb-24 md:mb-56 lg:px-8 px-4'>
      <div className='flex items-center gap-6'>
        <Image
          src={facilityDetails.logo}
          alt={facilityDetails.name}
          width={140}
          height={140}
          className='object-contain h-44 w-44'
        />
        <div>
          <h2 className='text-3xl md:text-5xl mb-4 font-bold uppercase'>
            {facilityDetails.name}
          </h2>
          <div className='hidden md:block'>
            <h2>
              <span className='text-[#BDBDBD]'>Location:</span>
              {facilityDetails.address}
            </h2>
            <div className='flex items-center text-white'>
              <Flag
                code={facilityDetails.country}
                style={{ width: '24px', height: '16px' }}
              />
              <span className='ml-2'>
                {facilityDetails.city}, {facilityDetails.state},
                {facilityDetails.country}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className='md:hidden mt-3'>
        <h2>
          <span className='text-[#BDBDBD] text-xl'>Location:</span>{' '}
          {facilityDetails.address}
        </h2>
        <div className='flex items-center gap-2 text-white'>
          <Flag
            code={facilityDetails.country}
            style={{ width: '24px', height: '16px' }}
          />
          <span className='text-sm ml-2'>
            {facilityDetails.city}, {facilityDetails.state},
            {facilityDetails.country}
          </span>
        </div>
      </div>
      <p className='my-12 text-xl leading-7 font-medium hidden md:block'>
        {facilityDetails.description}
      </p>
      <div className='md:hidden my-6'>
        <h3 className='text-[#BDBDBD] text-xl'>About</h3>
        <p className='leading-7 font-medium'>{facilityDetails.description}</p>
      </div>
      <div className='bg-[#28133A80] p-4 rounded'>
        <h2 className='text-2xl md:text-4xl font-bold mb-4'>
          Trainers and Fighters
        </h2>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-6'>
          {facilityDetails.trainers?.map((trainer, index) => {
            const user = trainer.existingTrainerId?.userId
            return (
              <div key={`trainer-${index}`} className='relative'>
                <Image
                  src='/fighter.png' // You can update this to trainer-specific image if available
                  alt={user?.firstName || 'Trainer'}
                  width={220}
                  height={220}
                  className='border border-gray-500 object-cover'
                />
                <div className='absolute bottom-0 bg-[#050310B2] opacity-75 w-56 p-2'>
                  <div className='flex items-center gap-2 text-white px-2'>
                    <Flag
                      code={user.country}
                      style={{ width: '24px', height: '14px' }}
                    />
                    <span>{user?.country || 'Unknown'}</span>
                  </div>
                  <div className='border-t border-[#BDBDBD] mt-2 pt-2 px-2'>
                    <h3 className='text-xl font-bold text-white'>
                      {user?.firstName} {user?.lastName}
                    </h3>
                  </div>
                </div>
                <div className='absolute top-2 -left-2'>
                  <Image
                    src='/trainer-badge.png'
                    alt='Trainer Badge'
                    width={50}
                    height={50}
                  />
                </div>
              </div>
            )
          })}

          {facilityDetails.fighters?.map((fighter, index) => {
            const user = fighter.existingFighterId?.userId
            return (
              <div key={`fighter-${index}`} className='relative'>
                <Image
                  src='/fighter.png' // You can update this to fighter-specific image if available
                  alt={user?.firstName || 'Fighter'}
                  width={220}
                  height={220}
                  className='border border-gray-500 object-cover'
                />

                <div className='absolute bottom-0 bg-[#050310B2] opacity-75 w-56 p-2'>
                  <div className='flex items-center gap-2 text-white px-2'>
                    <Flag
                      code={user.country}
                      style={{ width: '24px', height: '14px' }}
                    />
                    <span>{user?.country || 'Unknown'}</span>
                  </div>
                  <div className='border-t border-[#BDBDBD] mt-2 pt-2 px-2'>
                    <h3 className='text-xl font-bold text-white'>
                      {user?.firstName} {user?.lastName}
                    </h3>
                  </div>
                </div>
                <div className='absolute top-2 -left-2'>
                  <Image
                    src='/fighter-badge.png'
                    alt='Fighter Badge'
                    width={50}
                    height={50}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default TrainingFacilitiesDetailsPage
