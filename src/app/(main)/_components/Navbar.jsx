'use client'
import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import useUserStore from '../../../stores/userStore'

const Navbar = () => {
  const user = useUserStore((state) => state.user)
  const pathname = usePathname()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef(null)
  const isLoggedIn = user ? true : false

  console.log('User in Navbar:', user)
  console.log('Is user logged in:', isLoggedIn)

  const mainMenuItems = [
    { name: 'Home', path: '/' },
    { name: 'Events', path: '/events' },
    { name: 'Fighters', path: '/fighters' },
    { name: 'Rankings', path: '/ranking' },
  ]

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
      { name: 'My Profile', path: '/my-profile' },
      { name: 'Logout', action: 'logout' },
    ]
  }

  const isMoreMenuActive = moreMenuItems.some((item) =>
    pathname.startsWith(item.path)
  )

  const getMenuItemClass = (path) => {
    return pathname === path || pathname.startsWith(`${path}/`)
      ? 'text-yellow-500'
      : 'text-white'
  }

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

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  return (
    <nav className='flex items-center justify-between px-2 container mx-auto h-fit w-full py-4 relative'>
      {/* Logo */}
      <div>
        <a href='/' className='flex items-center'>
          <img src='/logo.png' alt='Logo' className='h-[111px] w-[132px]' />
        </a>
      </div>

      {/* Desktop Navigation */}
      <ul className='hidden lg:flex items-center space-x-6'>
        {mainMenuItems.map((item) => (
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
            } font-bold uppercase text-2xl tracking-wide flex items-center`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            More <span className='ml-1'>▾</span>
          </button>
          {dropdownOpen && (
            <ul className='absolute left-0 mt-2 bg-black shadow-lg rounded-md w-44 py-2 z-50'>
              {moreMenuItems.map((item, index, array) => (
                <li key={index}>
                  {item.action === 'logout' ? (
                    <button
                      onClick={() => {
                        useUserStore.getState().clearUser()
                        setDropdownOpen(false)
                        window.location.href = '/'
                      }}
                      className={`block w-full text-left py-2 text-white uppercase font-semibold mx-2 ${
                        index !== array.length - 1
                          ? 'border-b border-[#6C6C6C]'
                          : ''
                      }`}
                    >
                      Logout
                    </button>
                  ) : (
                    <Link
                      href={item.path}
                      onClick={() => setDropdownOpen(false)}
                      className={`block py-2 ${getMenuItemClass(
                        item.path
                      )} hover:bg-gray-900 uppercase text-left font-semibold ${
                        index !== array.length - 1
                          ? 'border-b border-[#6C6C6C] mx-2'
                          : 'mx-2'
                      }`}
                    >
                      {item.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </li>
      </ul>

      {/* Desktop Login/Signup */}
      {!isLoggedIn ? (
        <div className='hidden lg:block'>
          <Link
            href={'/login'}
            className='bg-red-600 text-white font-bold px-2 py-4 uppercase text-2xl'
          >
            Login / Sign Up
          </Link>
        </div>
      ) : (
        <div></div>
      )}

      {/* Mobile Menu Toggle */}
      <div className='lg:hidden'>
        <button
          onClick={toggleMobileMenu}
          className='text-white focus:outline-none'
        >
          {mobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className='fixed inset-0 bg-black z-50 lg:hidden'>
          <div className='flex flex-col h-full'>
            {/* Mobile Menu Header */}
            <div className='flex justify-end items-center px-5 py-4'>
              <button
                onClick={closeMobileMenu}
                className='text-white focus:outline-none'
              >
                <X size={32} />
              </button>
            </div>

            {/* Mobile Menu Items */}
            <div className='overflow-y-auto'>
              <ul className='py-4'>
                <ul className='py-4'>
                  {[...mainMenuItems, ...moreMenuItems].map((item) => (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        onClick={closeMobileMenu}
                        className={`block px-2 py-3 text-xl border-b border-[#6C6C6C] mx-2 ${getMenuItemClass(
                          item.path
                        )} uppercase font-semibold`}
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </ul>
            </div>

            {/* Mobile Login/Signup */}
            {!isLoggedIn ? (
              <div className='px-3 py-4'>
                <Link
                  href={'/login'}
                  onClick={closeMobileMenu}
                  className=' bg-red-600 text-white font-bold text-center px-4 py-3 uppercase text-xl'
                >
                  Login / Sign Up
                </Link>
              </div>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar
