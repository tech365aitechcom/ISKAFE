'use client'
import Link from 'next/link'
import { Clipboard, LayoutDashboard, Package, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

export function Sidebar() {
  return (
    <div className='hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 '>
      <div className='flex-1 flex flex-col min-h-0 bg-white shadow-md'>
        <div className='flex items-center justify-center flex-shrink-0 px-4 bg-white border-b'>
          <Image
            src='/logo.png'
            alt='Logo'
            className='w-30 h-30 ml-2 rounded-full mt-2'
            width={300}
            height={300}
          />
        </div>
        <div className='flex-1 flex flex-col overflow-y-auto pt-2 pb-4'>
          <nav className='flex-1 px-2 space-y-1'>
            <NavItem
              href='/dashboard'
              icon={<LayoutDashboard size={24} />}
              title={'dashboard'}
            />
          </nav>
        </div>
      </div>
    </div>
  )
}

function NavItem({ href, icon, title }) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname?.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      className={`flex items-center px-4 py-3 text-lg font-medium rounded-md ${
        isActive
          ? 'bg-orange-100 text-orange-700'
          : 'text-gray-500 hover:bg-orange-50 hover:text-orange-700'
      }`}
    >
      <div className={`mr-4 ${isActive ? 'text-orange-600' : 'text-gray-500'}`}>
        {icon}
      </div>
      {title}
    </Link>
  )
}
