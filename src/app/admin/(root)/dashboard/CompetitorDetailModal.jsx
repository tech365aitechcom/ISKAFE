'use client'

import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  FileCheck,
  AlertTriangle,
} from 'lucide-react'

export default function CompetitorDetailModal({
  competitor,
  onClose,
  calculateAge,
}) {
  if (!competitor) return null

  const formatAddress = () => {
    const parts = [
      competitor.street1,
      competitor.street2,
      competitor.city,
      competitor.state,
      competitor.postalCode,
      competitor.country,
    ].filter(Boolean)

    return parts.join(', ') || 'N/A'
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'text-green-400 bg-green-500/20'
      case 'pending':
        return 'text-yellow-400 bg-yellow-500/20'
      case 'rejected':
        return 'text-red-400 bg-red-500/20'
      default:
        return 'text-gray-400 bg-gray-500/20'
    }
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-[#0B1739] border border-[#343B4F] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='p-6 border-b border-[#343B4F]'>
          <div className='flex justify-between items-start'>
            <div>
              <h2 className='text-xl font-bold text-white mb-2'>
                {competitor.firstName} {competitor.lastName}
              </h2>
              <div className='flex items-center gap-4'>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                    competitor.status
                  )}`}
                >
                  {competitor.status}
                </span>
                <span className='text-sm text-gray-400'>
                  {competitor.registrationType?.charAt(0).toUpperCase() +
                    competitor.registrationType?.slice(1)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-white transition-colors'
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            {/* Personal Information */}
            <div>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                <User size={20} />
                Personal Information
              </h3>
              <div className='space-y-3'>
                <div>
                  <label className='block text-sm text-gray-400 mb-1'>
                    Full Name
                  </label>
                  <p className='text-white'>
                    {competitor.firstName} {competitor.lastName}
                  </p>
                </div>
                <div>
                  <label className='block text-sm text-gray-400 mb-1'>
                    Age
                  </label>
                  <p className='text-white'>
                    {calculateAge(competitor.dateOfBirth)} years old
                  </p>
                </div>
                <div>
                  <label className='block text-sm text-gray-400 mb-1'>
                    Date of Birth
                  </label>
                  <p className='text-white'>
                    {competitor.dateOfBirth
                      ? new Date(competitor.dateOfBirth).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className='block text-sm text-gray-400 mb-1'>
                    Gender
                  </label>
                  <p className='text-white'>{competitor.gender || 'N/A'}</p>
                </div>
                <div>
                  <label className='block text-sm text-gray-400 mb-1'>
                    System Record
                  </label>
                  <p className='text-white font-mono'>
                    {competitor.systemRecord || '0-0-0'}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                <Phone size={20} />
                Contact Information
              </h3>
              <div className='space-y-3'>
                <div>
                  <label className='block text-sm text-gray-400 mb-1'>
                    Email
                  </label>
                  <p className='text-white break-all'>{competitor.email}</p>
                </div>
                <div>
                  <label className='block text-sm text-gray-400 mb-1'>
                    Phone Number
                  </label>
                  <p className='text-white'>
                    {competitor.phoneNumber || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className='block text-sm text-gray-400 mb-1'>
                    Address
                  </label>
                  <p className='text-white'>{formatAddress()}</p>
                </div>
              </div>
            </div>

            {/* Registration Details */}
            <div>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                <FileCheck size={20} />
                Registration Details
              </h3>
              <div className='space-y-3'>
                <div>
                  <label className='block text-sm text-gray-400 mb-1'>
                    Registration Date
                  </label>
                  <p className='text-white'>
                    {competitor.createdAt
                      ? new Date(competitor.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className='block text-sm text-gray-400 mb-1'>
                    Check-in Status
                  </label>
                  <p className='text-white'>
                    {competitor.checkInStatus || 'Not Checked'}
                  </p>
                </div>
                <div>
                  <label className='block text-sm text-gray-400 mb-1'>
                    Medical Exam
                  </label>
                  <p className='text-white'>
                    {competitor.medicalExamDone
                      ? '✅ Completed'
                      : '❌ Not Done'}
                  </p>
                </div>
                <div>
                  <label className='block text-sm text-gray-400 mb-1'>
                    Parental Consent
                  </label>
                  <p className='text-white'>
                    {competitor.parentalConsentUploaded
                      ? '✅ Uploaded'
                      : '❌ Not Uploaded'}
                  </p>
                </div>
                <div>
                  <label className='block text-sm text-gray-400 mb-1'>
                    Waiver Signed
                  </label>
                  <p className='text-white'>
                    {competitor.waiverAgreed ? '✅ Signed' : '❌ Not Signed'}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div>
              <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                <CreditCard size={20} />
                Payment Information
              </h3>
              <div className='space-y-3'>
                <div>
                  <label className='block text-sm text-gray-400 mb-1'>
                    Payment Status
                  </label>
                  <span
                    className={`px-2 py-1 rounded-full text-sm ${getStatusColor(
                      competitor.paymentStatus
                    )}`}
                  >
                    {competitor.paymentStatus}
                  </span>
                </div>
                <div>
                  <label className='block text-sm text-gray-400 mb-1'>
                    Payment Method
                  </label>
                  <p className='text-white capitalize'>
                    {competitor.paymentMethod || 'N/A'}
                  </p>
                </div>
                {competitor.cashCode && (
                  <div>
                    <label className='block text-sm text-gray-400 mb-1'>
                      Cash Code
                    </label>
                    <p className='text-white font-mono'>
                      {competitor.cashCode}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Creator Information */}
            {competitor.createdBy && (
              <div className='md:col-span-2'>
                <h3 className='text-lg font-semibold text-white mb-4 flex items-center gap-2'>
                  <User size={20} />
                  Registered By
                </h3>
                <div className='bg-[#0A1330] p-4 rounded-lg'>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <div>
                      <label className='block text-sm text-gray-400 mb-1'>
                        Name
                      </label>
                      <p className='text-white'>
                        {competitor.createdBy.firstName}{' '}
                        {competitor.createdBy.lastName}
                      </p>
                    </div>
                    <div>
                      <label className='block text-sm text-gray-400 mb-1'>
                        Email
                      </label>
                      <p className='text-white'>{competitor.createdBy.email}</p>
                    </div>
                    <div>
                      <label className='block text-sm text-gray-400 mb-1'>
                        Role
                      </label>
                      <p className='text-white capitalize'>
                        {competitor.createdBy.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information */}
            {competitor.fightersRepresented && (
              <div className='md:col-span-2'>
                <h3 className='text-lg font-semibold text-white mb-4'>
                  Additional Information
                </h3>
                <div>
                  <label className='block text-sm text-gray-400 mb-1'>
                    Fighters Represented
                  </label>
                  <p className='text-white'>{competitor.fightersRepresented}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className='p-6 border-t border-[#343B4F] flex justify-end'>
          <button
            onClick={onClose}
            className='px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
