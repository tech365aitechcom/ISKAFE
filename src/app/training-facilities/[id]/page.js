import Image from 'next/image'
import React from 'react'

const TrainingFacilitiesDetailsPage = () => {
  return (
    <div className='text-white container w-full mx-auto my-14 mb-24 md:mb-56 px-4'>
      <div className='flex items-center gap-6'>
        <Image
          src='/sportskungfu.png'
          alt=''
          width={140}
          height={140}
          className='object-contain h-44 w-44'
        />
        <div className=''>
          <h2 className='text-3xl md:text-5xl mb-4 font-bold uppercase'>
            Arnett Sport Kung Fu Association
          </h2>
          <div className='hidden md:block'>
            <h2>
              <span className='text-[#BDBDBD]'>Location:</span> 580 Ellis Rd S,
              Suite 122A
            </h2>
            <div className='flex items-center text-white'>
              <img src='/Flag.png' alt='USA Flag' className='w-5 h-3 mr-2' />
              <span className=''>Jacksonville, FL, USA</span>
            </div>
          </div>
        </div>
      </div>
      <div className='md:hidden mt-3'>
        <h2>
          <span className='text-[#BDBDBD] text-xl'>Location:</span> 580 Ellis Rd
          S, Suite 122A
        </h2>
        <div className='flex items-center text-white'>
          <img src='/Flag.png' alt='USA Flag' className='w-5 h-3 mr-2' />
          <span className='text-sm'>Jacksonville, FL, USA</span>
        </div>
      </div>
      <p className='my-12 text-xl leading-7 font-medium hidden md:block'>
        At Arnett Sport Kung Fu, we take pride in offering top-tier training in
        both Sport and Traditional Wing Chun Kung Fu. Our school, located at 580
        Ellis Rd S in Jacksonville, Florida, is dedicated to providing a
        comprehensive martial arts experience that blends discipline, technique,
        and practical application. Our expert instructors are committed to
        guiding you through every step of your martial arts journey, whether
        you're a beginner looking to learn the basics or an advanced student
        aiming to refine your skills.
      </p>
      <div className='md:hidden my-6 '>
        <h3 className='text-[#BDBDBD] text-xl'>About</h3>
        <p className='leading-7 font-medium'>
          February 2022 - Johnny Davis is a Former 2x World Kickboxing Champion
          and now Global V.P. of Operations and Promotions for International
          Kickboxing Federation (IKF)....IKF CEO Ms. Toni Fossum. He is also
          President: IKF Point Muay Thai (PMT), Point Kickboxing (PKB), and
          Point Boxing Sparring Circuit (PBSC). Additionally, he's owner and
          President of www.AKPLive.com a Pay Per View Streaming Company with
          partner Mr. Derrick Rhems and has other business entities. Johnny
          Morris Davis (born July 15, 1962) is an American former kickboxer who
          competed in the welterweight and middleweight divisions. Nicknamed
          "Superfoot",
        </p>
      </div>
      <div className='bg-[#28133A80] p-4 rounded'>
        <h2 className='text-2xl md:text-4xl font-bold mb-4'>
          Trainers and Fighters
        </h2>
        <div className='flex flex-col items-center justify-between gap-4'>
          <div className='relative'>
            <Image
              src='/fighter.png'
              alt=''
              width={220}
              height={220}
              className='border border-gray-500 object-cover'
            />
            <div className='absolute bottom-0 bg-[#050310B2] opacity-75 w-56 p-2'>
              <div className='flex items-center text-white px-2'>
                <img src='/Flag.png' alt='USA Flag' className='w-5 h-3 mr-2' />
                <span className=''>Gilroy, CA, USA</span>
              </div>
              <div className='border-t border-[#BDBDBD] mt-2 pt-2 px-2'>
                <h3 className='text-xl font-bold text-white'>Eric Franks</h3>
              </div>
            </div>
            <div className='absolute top-2 -left-2'>
              <Image src='/trainer-badge.png' alt='' width={50} height={50} />
            </div>
          </div>
          <div className='relative'>
            <Image
              src='/fighter.png'
              alt=''
              width={220}
              height={220}
              className='border border-gray-500 object-cover'
            />
            <div className='absolute bottom-0 bg-[#050310B2] opacity-75 w-56 p-2'>
              <div className='flex items-center text-white px-2'>
                <img src='/Flag.png' alt='USA Flag' className='w-5 h-3 mr-2' />
                <span className=''>Gilroy, CA, USA</span>
              </div>
              <div className='border-t border-[#BDBDBD] mt-2 pt-2 px-2'>
                <h3 className='text-xl font-bold text-white'>Eric Franks</h3>
              </div>
            </div>
            <div className='absolute top-2 -left-2'>
              <Image src='/fighter-badge.png' alt='' width={50} height={50} />
            </div>
          </div>
          <div className='relative'>
            <Image
              src='/fighter.png'
              alt=''
              width={220}
              height={220}
              className='border border-gray-500 object-cover'
            />
            <div className='absolute bottom-0 bg-[#050310B2] opacity-75 w-56 p-2'>
              <div className='flex items-center text-white px-2'>
                <img src='/Flag.png' alt='USA Flag' className='w-5 h-3 mr-2' />
                <span className=''>Gilroy, CA, USA</span>
              </div>
              <div className='border-t border-[#BDBDBD] mt-2 pt-2 px-2'>
                <h3 className='text-xl font-bold text-white'>Eric Franks</h3>
              </div>
            </div>
            <div className='absolute top-2 -left-2'>
              <Image src='/trainer-badge.png' alt='' width={50} height={50} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrainingFacilitiesDetailsPage
