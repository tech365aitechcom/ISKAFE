'use client'
import Link from 'next/link'
import React, { useState } from 'react'
import { usePathname } from 'next/navigation'

const Navbar = () => {
  const pathname = usePathname()
  return (
    <nav className='flex items-center justify-between px-5 h-fit w-full lg:px-40 py-4'>
      <div>
        <a href='#' className='flex items-center'>
          <img src='/logo.png' alt='Logo' className='h-[111px] w-[132px]' />
        </a>
      </div>
      <ul className='flex items-center space-x-6'>
        {[
          { name: 'Home', path: '/' },
          { name: 'Events', path: '/all-events' },
          { name: 'Fighters', path: '/fighters' },
          { name: 'Rankings', path: '/ranking' },
        ].map((item) => (
          <li key={item.path}>
            <Link
              href={item.path}
              className={`font-bold uppercase text-sm tracking-wide ${
                pathname === item.path ? 'text-yellow-500' : 'text-white'
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
        <li className='relative'>
          <button className='text-white font-bold uppercase text-sm tracking-wide flex items-center'>
            More <span className='ml-1'>▾</span>
          </button>
        </li>
      </ul>
      <div>
        <Link
          href={'/login'}
          className='bg-red-600 text-white font-bold px-2 py-4 uppercase text-sm'
        >
          Login / Sign Up
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
