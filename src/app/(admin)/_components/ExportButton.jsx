'use client'
import { usePathname } from 'next/navigation'
import React from 'react'

export function ExportButton() {
  const pathname = usePathname()

  const isShowButton = () => {
    return (
      pathname === '/cash-payments-codes' ||
      pathname === '/spectator-ticket-redemption' ||
      pathname === '/event-bout-list' ||
      pathname === '/promoters' ||
      pathname === '/admin-news' ||
      pathname === '/people' ||
      pathname === '/fighter-trainer-checkin'
    )
  }

  return (
    <>
      {isShowButton() && (
        <button className='text-white px-8 py-2 rounded-md bg-[#0A1330] cursor-pointer flex items-center gap-2'>
          Export data
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='16'
            height='18'
            fill='white'
            viewBox='0 0 12 12'
          >
            <path
              fillRule='evenodd'
              d='M8 12a.75.75 0 0 0 .75-.75V4.56l2.47 2.47a.75.75 0 0 0 1.06-1.06L8.53 2.47a.75.75 0 0 0-1.06 0L3.72 5.97a.75.75 0 0 0 1.06 1.06L7.25 4.56v6.69c0 .414.336.75.75.75Z'
            />
          </svg>
        </button>
      )}
    </>
  )
}
