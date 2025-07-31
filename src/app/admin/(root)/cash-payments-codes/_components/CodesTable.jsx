'use client'

import { ChevronsUpDown } from 'lucide-react'
import { useState } from 'react'

export function CodesTable({ users, handleFighterClick, onRedeemCode }) {
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
    <th className='px-4 pb-3 whitespace-nowrap' onClick={() => handleSort(key)}>
      <div className='flex items-center gap-1'>
        {label}
        <ChevronsUpDown className='w-4 h-4 text-gray-400' />
      </div>
    </th>
  )

  const formatStatus = (code) => {
    if (code.status === 'redeemed' || code.redeemed) {
      return (
        <div className="flex items-center">
          <span className="text-green-400 mr-1">✓</span>
          <span>Redeemed</span>
          {(code.redeemedAt || code.redeemedDate) && (
            <span className="ml-2 text-xs text-gray-400">
              ({new Date(code.redeemedAt || code.redeemedDate).toLocaleDateString()})
            </span>
          )}
        </div>
      )
    }
    return <span className="text-red-400">Not Redeemed</span>
  }

  const handleRedeemClick = async (code) => {
    if (code.status === 'redeemed' || code.redeemed) return
    
    if (confirm(`Are you sure you want to redeem code ${code.code} for ${code.participantName || code.name}?`)) {
      if (onRedeemCode) {
        await onRedeemCode(code)
      }
    }
  }

  return (
    <div className='border border-[#343B4F] rounded-lg overflow-hidden mt-6'>
      <div className='mb-4 pb-4 p-4 flex justify-between items-center border-b border-[#343B4F]'>
        <p className='text-sm'>Codes</p>
        <p className='text-sm'>{users.length} records</p>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full text-sm text-left'>
          <thead>
            <tr className='text-gray-400 text-sm'>
              {renderHeader('Date', 'date')}
              {renderHeader('Player Name', 'name')}
              {renderHeader('Player Email', 'email')}
              {renderHeader('Ticket Code', 'code')}
              {renderHeader('💳 Payment Type', 'paymentType')}
              {renderHeader('💲 Amount Paid', 'amount')}
              {renderHeader('📅 Issued At', 'issuedAt')}
              {renderHeader('🧑‍💻 Issued By', 'issuedBy')}
              {renderHeader('🔖 Status', 'redeemed')}
              {renderHeader('Actions', 'actions')}
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
                <td className='p-4'>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : user.date}</td>
                <td className='p-4' onClick={() => handleFighterClick(user)}>
                  {user.participantName || user.name}
                </td>
                <td className='p-4'>{user.participantEmail || user.email}</td>
                <td className='p-4 font-mono'>{user.code}</td>
                <td className='p-4'>{user.paymentType}</td>
                <td className='p-4'>${user.amount}</td>
                <td className='p-4'>{user.createdAt ? new Date(user.createdAt).toLocaleString() : user.issuedAt}</td>
                <td className='p-4'>{user.issuedBy}</td>
                <td className='p-4'>
                  {formatStatus(user)}
                </td>
                <td className='p-4 flex space-x-4 items-center'>
                  <button
                    className={`block p-2 rounded text-sm transition-colors duration-200 min-w-min ${
                      (user.status === 'redeemed' || user.redeemed)
                        ? 'bg-gray-500 cursor-not-allowed' 
                        : 'bg-violet-500 hover:bg-violet-600'
                    }`}
                    disabled={user.status === 'redeemed' || user.redeemed}
                    onClick={() => handleRedeemClick(user)}
                  >
                    Redeem Code
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}