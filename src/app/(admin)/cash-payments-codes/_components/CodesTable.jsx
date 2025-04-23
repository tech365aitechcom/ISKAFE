'use client'

import { ChevronsUpDown } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

export function CodesTable({ users, handleFighterClick }) {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  })

  const sortedUsers = [...users].sort((a, b) => {
    if (!sortConfig.key) return 0

    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    } else {
      return sortConfig.direction === 'asc'
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
        ? 1
        : -1
    }
  })

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      } else {
        return { key, direction: 'asc' }
      }
    })
  }

  const renderHeader = (label, key) => (
    <th
      className='px-4 pb-3 whitespace-nowrap cursor-pointer'
      onClick={() => handleSort(key)}
    >
      <div className='flex items-center gap-1'>
        {label}
        <ChevronsUpDown className='w-4 h-4 text-gray-400' />
      </div>
    </th>
  )

  return (
    <div className='border border-[#343B4F] rounded-lg overflow-hidden mt-6'>
      <div className='mb-4 pb-4 p-4 flex justify-between items-center border-b border-[#343B4F]'>
        <p className='text-sm'>Codes</p>
        <p className='text-sm'>1 - 10 of {users.length}</p>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm text-left'>
          <thead>
            <tr className='text-gray-400 text-sm'>
              {renderHeader('Player Name & Email', 'name')}
              {renderHeader('Date', 'date')}
              {renderHeader('Code', 'code')}
              {renderHeader('Amount', 'amount')}
              {renderHeader('Notes', 'notes')}
              {renderHeader('Redeemed', 'redeemed')}
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user, index) => (
              <tr
                key={index}
                className={`cursor-pointer ${
                  index % 2 === 0 ? 'bg-[#0A1330]' : 'bg-[#0B1739]'
                }`}
              >
                <td className='p-4'>
                  <div
                    className='flex items-center cursor-pointer hover:text-blue-300'
                    onClick={() => handleFighterClick(user)}
                  >
                    <div className='relative w-10 h-10 mr-3'>
                      <Image
                        src={user.profilePic}
                        alt='Profile'
                        layout='fill'
                        className='rounded-full bg-violet-700'
                      />
                    </div>
                    <div className='flex flex-col'>
                      <p>{user.name}</p>
                      <p>{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className='p-4'>{user.date}</td>
                <td className='p-4'>{user.code}</td>
                <td className='p-4'>{user.amount}</td>
                <td className='p-4'>{user.notes}</td>
                <td className='p-4'>{user.redeemed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
