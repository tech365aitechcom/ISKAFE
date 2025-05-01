import {
  ChevronLeft,
  Facebook,
  Twitter,
  Instagram,
  Link as LinkIcon,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const NewsDetailsPage = () => {
  const news = {
    title: 'Professional Photography at the IKF Spring Classic!',
    description:
      'We are pleased to welcome Zaneta Hech as our official photographer for the 2025 IKF Spring Muay Thai...',
    img: '/news.png',
    time: '8 hours ago',
    author: 'Johnny Davis',
    createdAt: 'Mar 3,2025',
  }

  return (
    <div className='bg-[#28133A80] p-4 max-w-7xl mx-auto flex flex-col md:flex-row gap-4 my-6'>
      <div className='w-full md:w-[50%] h-fit'>
        <Image
          src={news.img}
          alt='News Image'
          width={100}
          height={100}
          className='w-full h-full object-cover'
        />
        <div className='bg-[#050310B2] opacity-75 p-4'>
          <h3 className='text-white text-xl font-bold'>
            <span className='text-[#BDBDBD]'>Written By: </span>
            {news.author}
          </h3>
          <h3 className='text-white text-xl font-bold'>
            <span className='text-[#BDBDBD]'>Posted On: </span>
            {news.createdAt}
          </h3>
        </div>
      </div>

      <div className='text-white w-full'>
        <Link href={'/news'} className='flex items-center mb-4'>
          <ChevronLeft size={24} className='cursor-pointer' />
          Back
        </Link>
        <h1 className='text-2xl md:text-5xl font-bold uppercase'>
          {news.title}
        </h1>

        {/* Share Icons */}
        <div className='flex gap-4 mt-4 mb-6'>
          <Facebook className='cursor-pointer hover:text-blue-500 transition-colors' />
          <Twitter className='cursor-pointer hover:text-sky-400 transition-colors' />
          <Instagram className='cursor-pointer hover:text-pink-500 transition-colors' />
          <LinkIcon className='cursor-pointer hover:text-gray-300 transition-colors' />
        </div>

        <p className='leading-6 mt-2'>
          We are pleased to welcome Zaneta Hesch as our official photographer
          for the 2025 IKF Spring Muay Thai and Kickboxing Classic taking place
          this Saturday in Myrtle Beach, SC.
          <br />
          <br />
          Zaneta, who hails from New Bern, North Carolina and trains out of Nine
          Limbs Strikers with Kru Pol and has over a decade of photography
          experience and four years of training in Muay Thai.
          <br />
          <br />
          This opportunity to work with IKF allows her to combine her two
          passions: capturing fighters in the ring and telling their stories of
          discipline and the warrior mindset.
          <br />
          <br />
          The event will be held at the Landmark Resort, with Full Contact
          Action kicking off on Saturday at 1: PM and continuing until around 11
          PM.
          <br />
          <br />
          Additionally, there will be plenty of semi-contact action, including
          IKF Point Muay Thai and Kickboxing Sparring, as well as PBSC Point
          Boxing Sparring and BJJ competitions starting on Saturday evening.
          <br />
          <br />
          Zaneta will be on-site capturing action shots and sharing fascinating
          stories through her photography. Expect to see a wealth of photos
          following the event!
          <br />
          <br />
          Get your tickets and more information at www.IKFFightplatform.com. If
          you have any questions, please call (843)773-1005.
        </p>
      </div>
    </div>
  )
}

export default NewsDetailsPage
