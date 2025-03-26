'use client'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

const Navbar = () => {
  const pathname = usePathname()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const isLoggedIn = false

  let moreMenuItems = [
    { name: 'Training Facilities', path: '/training-facilities' },
    { name: 'News', path: '/news' },
    { name: 'About', path: '/about' },
    { name: 'Contact Us', path: '/contact-us' },
  ]

  if (isLoggedIn) {
    moreMenuItems = [
      ...moreMenuItems,
      { name: 'My Purchases', path: '/my-purchases' },
      { name: 'My Fight Family', path: '/my-fight-family' },
      { name: 'Logout', path: '#' },
    ]
  }

  const isMoreMenuActive = moreMenuItems.some((item) => pathname === item.path)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <nav className='flex items-center justify-between px-5 h-fit w-full lg:px-40 py-4 relative'>
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
              className={`font-bold uppercase text-2xl tracking-wide ${
                pathname === item.path ? 'text-yellow-500' : 'text-white'
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
        <li className='relative' ref={dropdownRef}>
          <button
            className={`${
              isMoreMenuActive ? 'text-yellow-500' : 'text-white'
            } font-bold uppercase text-2xl tracking-wide flex items-center cursor-pointer`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            More <span className='ml-1'>▾</span>
          </button>
          {dropdownOpen && (
            <ul className='absolute left-0 mt-2 bg-black shadow-lg rounded-md w-44 py-2 z-50'>
              {moreMenuItems.map((item, index, array) => (
                <li key={index}>
                  <Link
                    href={item.path}
                    onClick={() => setDropdownOpen(false)}
                    className={`block py-2 ${
                      pathname === item.path ? 'text-yellow-500' : 'text-white'
                    } hover:bg-gray-900 uppercase text-left font-semibold ${
                      index !== array.length - 1
                        ? 'border-b border-[#6C6C6C] mx-2'
                        : 'mx-2'
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      </ul>
      <div>
        <Link
          href={'/login'}
          className='bg-red-600 text-white font-bold px-2 py-4 uppercase text-2xl'
        >
          Login / Sign Up
        </Link>
      </div>
    </nav>
  )
}

export default Navbar
