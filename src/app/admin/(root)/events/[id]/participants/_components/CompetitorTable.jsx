'use client'

import { Phone, Mail, FileText, User } from 'lucide-react'

export default function CompetitorTable({ 
  competitors, 
  calculateAge, 
  onViewRegistration, 
  loading 
}) {
  const formatType = (registrationType) => {
    return registrationType?.charAt(0).toUpperCase() + registrationType?.slice(1) || 'N/A'
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      'Pending': 'bg-yellow-500/20 text-yellow-400',
      'Approved': 'bg-green-500/20 text-green-400',
      'Rejected': 'bg-red-500/20 text-red-400'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[status] || 'bg-gray-500/20 text-gray-400'}`}>
        {status}
      </span>
    )
  }

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'N/A'
    // Format as (XXX) XXX-XXXX if possible
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  return (
    <div className='overflow-x-auto'>
      <table className='w-full border-collapse'>
        <thead>
          <tr className='bg-[#0A1330] text-left border-b border-gray-700'>
            <th className='p-4 text-sm font-medium text-gray-300'>Type</th>
            <th className='p-4 text-sm font-medium text-gray-300'>First Name</th>
            <th className='p-4 text-sm font-medium text-gray-300'>Last Name</th>
            <th className='p-4 text-sm font-medium text-gray-300'>Age</th>
            <th className='p-4 text-sm font-medium text-gray-300'>Phone</th>
            <th className='p-4 text-sm font-medium text-gray-300'>Email</th>
            <th className='p-4 text-sm font-medium text-gray-300'>Status</th>
            <th className='p-4 text-sm font-medium text-gray-300'>Reg Form</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={8} className='p-8 text-center'>
                <div className='flex items-center justify-center'>
                  <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500'></div>
                  <span className='ml-3'>Loading participants...</span>
                </div>
              </td>
            </tr>
          ) : competitors.length === 0 ? (
            <tr>
              <td colSpan={8} className='p-8 text-center text-gray-400'>
                No participants found
              </td>
            </tr>
          ) : (
            competitors.map((competitor, index) => (
              <tr 
                key={competitor._id || index} 
                className='border-b border-gray-700 hover:bg-[#0A1330]/50 transition-colors'
              >
                <td className='p-4'>
                  <div className='flex items-center gap-2'>
                    <User size={16} className='text-gray-400' />
                    <span className='font-medium'>
                      {formatType(competitor.registrationType)}
                    </span>
                  </div>
                </td>
                <td className='p-4 font-medium'>{competitor.firstName || 'N/A'}</td>
                <td className='p-4 font-medium'>{competitor.lastName || 'N/A'}</td>
                <td className='p-4'>{calculateAge(competitor.dateOfBirth)}</td>
                <td className='p-4'>
                  <div className='flex items-center gap-2'>
                    <Phone size={14} className='text-gray-400' />
                    <span className='text-sm'>
                      {formatPhoneNumber(competitor.phoneNumber)}
                    </span>
                  </div>
                </td>
                <td className='p-4'>
                  <div className='flex items-center gap-2'>
                    <Mail size={14} className='text-gray-400' />
                    <span className='text-sm break-all'>
                      {competitor.email || 'N/A'}
                    </span>
                  </div>
                </td>
                <td className='p-4'>
                  {getStatusBadge(competitor.status)}
                </td>
                <td className='p-4'>
                  <button
                    onClick={() => onViewRegistration(competitor)}
                    className='flex items-center gap-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors'
                  >
                    <FileText size={14} />
                    View Details
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}