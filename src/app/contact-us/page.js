import { Mail, MapPin, PhoneCall } from 'lucide-react'
import React from 'react'
import ContactForm from './_components/ContactForm'

const ContactUs = () => {
  return (
    <div className='bg-[#160B25] container p-2 mx-auto mb-32 flex flex-col md:flex-row justify-between'>
      <div className='bg-[#24195D] text-white w-full md:w-[40%] px-8 py-8 pb-32 rounded-tl-lg rounded-bl-lg'>
        <h1 className='font-semibold text-3xl'>Contact Information</h1>
        <p className='text-[#C9C9C9] text-lg font-normal'>
          We&apos;re here to help
        </p>
        <div className='flex flex-col gap-8 mt-32'>
          <div className='flex gap-2'>
            <PhoneCall className='mt-1' />
            <h3 className='text-xl font-normal'>+1012 3456 789</h3>
          </div>
          <div className='flex gap-2'>
            <Mail className='mt-1' />
            <h3 className='text-xl font-normal'>demo@gmail.com</h3>
          </div>
          <div className='flex gap-2'>
            <MapPin className='mt-1' />
            <h3 className='text-xl font-normal'>
              132 Dartmouth Street Boston, <br /> Massachusetts 02156 United
              States
            </h3>
          </div>
        </div>
      </div>
      <ContactForm />
    </div>
  )
}

export default ContactUs
