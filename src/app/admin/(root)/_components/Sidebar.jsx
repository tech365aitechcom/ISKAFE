'use client'
import Link from 'next/link'
import {
  Search,
  Home,
  User,
  List,
  DollarSign,
  MapPin,
  Users,
  ChevronRight,
  Star,
  Dumbbell,
  Newspaper,
  Info,
  SquareUser,
  Scale,
  Ban,
  Crown,
  UserCheck,
  Medal,
  BarChart2,
  ClipboardList,
  PhoneCall,
  ShieldCheck,
  Globe,
} from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import useStore from '../../../../stores/useStore'
import { useState } from 'react'

export function Sidebar() {
  const pathname = usePathname()
  const user = useStore((state) => state.user)
  const [search, setSearch] = useState('')
  const [reportsOpen, setReportsOpen] = useState(false)

  const navItems = [
    { href: '/admin/dashboard', icon: <Home size={18} />, title: 'Dashboard' },
    {
      href: '/admin/events',
      icon: <Star size={18} />,
      title: 'Events',
      highlight: true,
    },
    {
      href: '/admin/spectator-ticket-redemption',
      icon: <User size={18} />,
      title: 'Spectator Ticket Redemption',
    },
    {
      href: '/admin/fighter-trainer-checkin',
      icon: <UserCheck size={18} />,
      title: 'Fighter & Trainer Checkin',
    },
    {
      href: '/admin/fighter-and-rankings',
      icon: <Medal size={18} />,
      title: 'Fighter & Rankings',
    },
    {
      href: '/admin/event-bout-list',
      icon: <List size={18} />,
      title: 'Event Bout List',
    },
    {
      href: '/admin/cash-payments-codes',
      icon: <DollarSign size={18} />,
      title: 'Cash Payments & Codes',
    },
    {
      href: '/admin/training-and-gym-facilities',
      icon: <Dumbbell size={18} />,
      title: 'Training & Gym Facilities',
      highlight: true,
    },
    {
      href: '/admin/suspensions',
      icon: <Ban size={18} />,
      title: 'Suspensions List',
    },
    { href: '/admin/venues', icon: <MapPin size={18} />, title: 'Venues' },
    { href: '/admin/news', icon: <Newspaper size={18} />, title: 'News' },
    { href: '/admin/rules', icon: <Scale size={18} />, title: 'Rules' },
    {
      href: '/admin/promoter',
      icon: <User size={18} />,
      title: 'Promoters',
    },
    { href: '/admin/people', icon: <Users size={18} />, title: 'People' },
    {
      href: '/admin/access-control',
      icon: <ShieldCheck size={18} />,
      title: 'User Roles And Permissions',
    },
    {
      href: '/admin/official-title-holders',
      icon: <Crown size={18} />,
      title: 'Official Title Holders',
      highlight: true,
    },
    {
      href: '/admin/ranked-fighter-search',
      icon: <Search size={18} />,
      title: 'Ranked Fighter Search',
      highlight: true,
    },
    {
      href: '/admin/contact-settings',
      icon: <SquareUser size={18} />,
      title: 'Contact Settings',
    },
    {
      href: '/admin/home-setting',
      icon: <SquareUser size={18} />,
      title: 'Homepage Settings',
    },
    { href: '/admin/about', icon: <Info size={18} />, title: 'About' },
  ]

  return (
    <div className='flex flex-col w-72 h-auto bg-[#081028] text-white font-lato overflow-y-auto scrollbar-hide'>
      {/* Font Import in Head */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap');

        body {
          font-family: 'Lato', sans-serif;
        }
      `}</style>

      {/* Logo Section */}
      <div className='flex p-6'>
        <div className='relative w-30 h-30'>
          <Image
            src='/logo1.png'
            alt='Global Sports Federation Logo'
            layout='fill'
            className='rounded-full'
          />
        </div>
      </div>

      {/* Search Bar */}
      <div className='px-4 py-2'>
        <div className='relative'>
          <Search className='absolute left-3 top-2.5 h-4 w-4 text-gray-400' />
          <input
            type='text'
            placeholder='Search for...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className='w-full bg-gray-800 text-sm text-white rounded-md py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500 font-lato'
          />
        </div>
      </div>

      {/* Navigation Items */}
      <nav className='flex-1 mt-2'>
        {navItems
          .filter((item) =>
            item.title.toLowerCase().includes(search.toLowerCase())
          )
          .map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              title={item.title}
              isActive={pathname.startsWith(item.href)}
              highlight={item.highlight}
            />
          ))}

        <Link href={'/'} className={`flex items-center p-4 text-sm`}>
          <span className='mr-3'>
            <Globe size={18} />
          </span>
          Public Site
          <span className='ml-auto'>
            <ChevronRight size={14} />
          </span>
        </Link>

        <div className='flex flex-col'>
          <button
            onClick={() => setReportsOpen((prev) => !prev)}
            className={`flex items-center p-4 text-sm w-full text-left ${
              reportsOpen
                ? 'text-[#FFCA28]'
                : 'text-gray-300 hover:text-[#FFCA28]'
            } font-lato`}
          >
            <span className='mr-3'>
              <BarChart2 size={18} />
            </span>
            Reports
            <span className='ml-auto'>
              <ChevronRight
                size={14}
                className={`transition-transform duration-200 ${
                  reportsOpen ? 'rotate-90' : ''
                }`}
              />
            </span>
          </button>

          {reportsOpen && (
            <div className='ml-2 flex flex-col'>
              <Link
                href='/admin/reports/event-registrations'
                className={`p-2 text-sm  hover:text-[#FFCA28] font-lato flex gap-2 ${
                  pathname === '/admin/reports/event-registrations'
                    ? 'text-[#FFCA28]'
                    : 'text-gray-300'
                }`}
              >
                <ClipboardList size={18} />
                Event Registrations (Fighters and Trainers)
              </Link>
              <Link
                href='/admin/reports/contact-us'
                className={`p-2 text-sm hover:text-[#FFCA28] font-lato flex gap-2 ${
                  pathname === '/admin/reports/contact-us'
                    ? 'text-[#FFCA28]'
                    : 'text-gray-300'
                }`}
              >
                <PhoneCall size={18} />
                Contact Us
              </Link>
            </div>
          )}
        </div>

        {/* User Profile Section */}
        <Link
          href={`/admin/profile`}
          className={`${pathname === '/admin/profile' && 'text-[#FFCA28]'}`}
        >
          <div className='flex items-center p-4'>
            <div className='flex items-center'>
              <div className='relative w-10 h-10 mr-3'>
                {user?.profilePhoto ? (
                  <Image
                    src={user.profilePhoto}
                    alt='Profile'
                    layout='fill'
                    className='rounded-full bg-violet-700 object-cover'
                  />
                ) : (
                  <div className='w-full h-full rounded-full bg-violet-700 flex items-center justify-center text-white text-sm font-semibold'>
                    {user?.firstName?.charAt(0) + user?.lastName?.charAt(0) ||
                      'U'}
                  </div>
                )}
              </div>

              <div>
                <p className='text-sm font-medium'>
                  {user?.firstName + ' ' + user?.lastName}
                </p>
                <p
                  className={`text-sm ${
                    pathname === '/admin/profile'
                      ? 'text-[#FFCA28]'
                      : 'text-gray-400'
                  }`}
                >
                  Account settings
                </p>
              </div>
            </div>
            <span className='ml-auto'>
              <ChevronRight size={14} />
            </span>
          </div>
        </Link>
      </nav>
    </div>
  )
}

function NavItem({ href, icon, title, isActive, highlight }) {
  return (
    <Link
      href={href}
      className={`flex items-center p-4 text-sm ${
        isActive ? 'text-[#FFCA28]' : 'text-gray-300 hover:text-[#FFCA28]'
      } ${highlight ? 'font-bold' : ''} font-lato`}
    >
      <span className='mr-3'>{icon}</span>
      {title}
      <span className='ml-auto'>
        <ChevronRight size={14} />
      </span>
    </Link>
  )
}
