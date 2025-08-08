'use client'
import React, { useState, useEffect } from 'react'
import { paymentTypes, API_BASE_URL } from '../../../../../constants'
import { ChevronDown, X } from 'lucide-react'
import axios from 'axios'

export default function RequestCode({ onBack, onAddCode, selectedEvent, currentUser }) {
  const [activeButton, setActiveButton] = useState('spectator')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentType, setPaymentType] = useState('Cash')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Generate a unique code when component mounts
    const randomCode = Math.random().toString(36).substr(2, 5).toUpperCase();
    setGeneratedCode(randomCode);
    // Set default event date to today
    const today = new Date().toISOString().split('T')[0];
    setEventDate(today);
    // Fetch users for dropdown
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/people?limit=100`, {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      })
      if (response.data && response.data.items) {
        setUsers(response.data.items)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const filterUsers = (query) => {
    if (!query.trim()) {
      setFilteredUsers([])
      return
    }
    const filtered = users.filter(user => {
      const fullName = `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim().toLowerCase()
      return fullName.includes(query.toLowerCase()) || 
             (user.email && user.email.toLowerCase().includes(query.toLowerCase()))
    })
    setFilteredUsers(filtered.slice(0, 10)) // Limit to 10 results
  }

  const handleNameChange = (value) => {
    setName(value)
    setSearchQuery(value)
    setSelectedUser(null)
    
    if (value.trim()) {
      filterUsers(value)
      setShowUserDropdown(true)
    } else {
      setShowUserDropdown(false)
      setEmail('')
      setMobile('')
    }
  }

  const handleUserSelect = (user) => {
    const fullName = `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim()
    setName(fullName)
    setEmail(user.email || '')
    setMobile(user.phoneNumber || '')
    setSelectedUser(user)
    setShowUserDropdown(false)
    setFieldErrors(prev => ({...prev, name: '', email: '', mobile: ''}))
  }

  const validateField = (fieldName, value) => {
    let error = ''
    
    switch (fieldName) {
      case 'name':
        if (!value.trim()) {
          error = 'Name is required'
        } else if (!/^[A-Za-z\s'-]+$/.test(value)) {
          error = 'Name must not contain special characters or numbers'
        }
        break
      case 'email':
        if (!value.trim()) {
          error = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address'
        }
        break
      case 'mobile':
        if (!value.trim()) {
          error = 'Mobile number is required'
        } else if (!/^\+?[0-9]{10,15}$/.test(value.replace(/\s+/g, ''))) {
          error = 'Mobile number must be 10-15 digits'
        }
        break
      case 'amount':
        if (!value || parseFloat(value) <= 0) {
          error = 'Amount must be greater than 0'
        }
        break
      case 'paymentNotes':
        if (!value.trim()) {
          error = 'Payment description is required'
        }
        break
      case 'eventDate':
        if (!value) {
          error = 'Event date is required'
        }
        break
    }
    
    return error
  }

  const handleFieldChange = (fieldName, value) => {
    const error = validateField(fieldName, value)
    setFieldErrors(prev => ({...prev, [fieldName]: error}))
    
    switch (fieldName) {
      case 'email':
        setEmail(value)
        break
      case 'mobile':
        setMobile(value)
        break
      case 'amount':
        setAmount(value)
        break
      case 'paymentNotes':
        setPaymentNotes(value)
        break
      case 'eventDate':
        setEventDate(value)
        break
    }
  }

  const handleToggle = (button) => {
    setActiveButton(button)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const errors = {
      name: validateField('name', name),
      email: validateField('email', email),
      mobile: validateField('mobile', mobile),
      amount: validateField('amount', amount),
      paymentNotes: validateField('paymentNotes', paymentNotes),
      eventDate: validateField('eventDate', eventDate),
    }
    
    setFieldErrors(errors)
    
    // Check if there are any errors
    const hasErrors = Object.values(errors).some(error => error)
    if (hasErrors) {
      return
    }
    
    setIsSubmitting(true);
    
    try {
      const codeData = {
        participantName: name,
        participantEmail: email,
        participantMobile: mobile,
        participantType: activeButton, // 'spectator' or 'trainer'
        code: generatedCode,
        amount: parseFloat(amount),
        paymentType,
        paymentNotes,
        eventDate,
        issuedBy: currentUser?.firstName + ' ' + currentUser?.lastName || 'Admin'
      };
      
      await onAddCode(codeData);
      
      // Reset form only on success
      setName('');
      setEmail('');
      setMobile('');
      setAmount('');
      setPaymentNotes('');
      setSelectedUser(null);
      setFieldErrors({});
      // Generate new code for next use
      const newCode = Math.random().toString(36).substr(2, 5).toUpperCase();
      setGeneratedCode(newCode);
    } catch (error) {
      console.error('Error submitting code:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className='text-white'>
      {/* Header with back button */}
      <div className='flex items-center gap-4 mb-6'>
        <button className='mr-2 text-white' onClick={onBack}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-6 w-6'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M10 19l-7-7m0 0l7-7m-7 7h18'
            />
          </svg>
        </button>
        <h1 className='text-2xl font-bold'>Request Code</h1>
      </div>

      {/* Event Info */}
      {selectedEvent && (
        <div className='mb-6 p-4 bg-[#122046] rounded-lg'>
          <h2 className='text-lg font-bold mb-2'>Selected Event</h2>
          <p className='text-blue-300'>{selectedEvent.name}</p>
          <p className='text-sm text-gray-400'>Date: {selectedEvent.date}</p>
          <p className='text-sm text-gray-400'>Event ID: {selectedEvent.id}</p>
        </div>
      )}

      {/* Toggle buttons */}
      <div className='flex border border-[#343B4F] p-1 rounded-md w-fit mb-6'>
        <button
          onClick={() => handleToggle('spectator')}
          className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${
            activeButton === 'spectator' ? 'bg-[#2E3094] shadow-md' : ''
          }`}
        >
          Spectator
        </button>

        <button
          onClick={() => handleToggle('trainer')}
          className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${
            activeButton === 'trainer' ? 'bg-[#2E3094] shadow-md' : ''
          }`}
        >
          Trainer
        </button>
      </div>

      {/* Form Fields */}
      <form className='space-y-4' onSubmit={handleSubmit}>
        {/* Person Name Field with Dropdown */}
        <div className='relative'>
          <label className='block text-sm mb-2'>
            {activeButton === 'spectator' ? 'Spectator Name' : 'Trainer Name'}
            <span className='text-red-500'>*</span>
          </label>
          <div className='relative'>
            <input
              type='text'
              placeholder={`Start typing ${activeButton} name or enter manually`}
              className={`w-full border rounded-md p-2 text-white text-xs pr-8 bg-transparent ${
                fieldErrors.name ? 'border-red-500' : 'border-[#343B4F]'
              }`}
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim() && filteredUsers.length > 0) {
                  setShowUserDropdown(true)
                }
              }}
            />
            {name && (
              <button
                type='button'
                onClick={() => {
                  setName('')
                  setEmail('')
                  setMobile('')
                  setSelectedUser(null)
                  setShowUserDropdown(false)
                  setFieldErrors(prev => ({...prev, name: ''}))
                }}
                className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white'
              >
                <X size={16} />
              </button>
            )}
          </div>
          {fieldErrors.name && (
            <p className='text-red-500 text-xs mt-1'>{fieldErrors.name}</p>
          )}
          
          {/* Dropdown */}
          {showUserDropdown && filteredUsers.length > 0 && (
            <div className='absolute z-10 w-full mt-1 bg-[#0B1739] border border-[#343B4F] rounded-md shadow-lg max-h-48 overflow-y-auto'>
              {filteredUsers.map((user) => {
                const fullName = `${user.firstName || ''} ${user.middleName || ''} ${user.lastName || ''}`.trim()
                return (
                  <div
                    key={user._id}
                    className='p-2 hover:bg-[#2E3094] cursor-pointer text-sm'
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className='font-medium'>{fullName}</div>
                    <div className='text-xs text-gray-400'>{user.email}</div>
                    <div className='text-xs text-gray-400'>{user.phoneNumber}</div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label className='block text-sm mb-2'>
            Email<span className='text-red-500'>*</span>
          </label>
          <input
            type='email'
            placeholder="Enter email address"
            className={`w-full border rounded-md p-2 text-white text-xs bg-transparent ${
              fieldErrors.email ? 'border-red-500' : 'border-[#343B4F]'
            }`}
            value={email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
          />
          {fieldErrors.email && (
            <p className='text-red-500 text-xs mt-1'>{fieldErrors.email}</p>
          )}
        </div>

        {/* Mobile Field */}
        <div>
          <label className='block text-sm mb-2'>
            Mobile Number<span className='text-red-500'>*</span>
          </label>
          <input
            type='tel'
            placeholder="Enter mobile number"
            className={`w-full border rounded-md p-2 text-white text-xs bg-transparent ${
              fieldErrors.mobile ? 'border-red-500' : 'border-[#343B4F]'
            }`}
            value={mobile}
            onChange={(e) => handleFieldChange('mobile', e.target.value)}
          />
          {fieldErrors.mobile && (
            <p className='text-red-500 text-xs mt-1'>{fieldErrors.mobile}</p>
          )}
        </div>

        {/* Payment Type */}
        <div>
          <label className='block text-sm mb-2'>
            💳 Payment Type<span className='text-red-500'>*</span>
          </label>
          <select
            className='w-full border border-[#343B4F] rounded-md p-2 text-[#AEB9E1] text-xs'
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            required
          >
            {paymentTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* Event Date Field */}
        <div>
          <label className='block text-sm mb-2'>
            📅 Event Date<span className='text-red-500'>*</span>
          </label>
          <input
            type='date'
            className={`w-full border rounded-md p-2 text-white text-xs bg-transparent ${
              fieldErrors.eventDate ? 'border-red-500' : 'border-[#343B4F]'
            }`}
            value={eventDate}
            onChange={(e) => handleFieldChange('eventDate', e.target.value)}
          />
          {fieldErrors.eventDate && (
            <p className='text-red-500 text-xs mt-1'>{fieldErrors.eventDate}</p>
          )}
        </div>

        {/* Amount Field */}
        <div>
          <label className='block text-sm mb-2'>
            💲 Amount Paid (USD)<span className='text-red-500'>*</span>
          </label>
          <input
            type='number'
            placeholder="Enter amount"
            className={`w-full border rounded-md p-2 text-white text-xs bg-transparent ${
              fieldErrors.amount ? 'border-red-500' : 'border-[#343B4F]'
            }`}
            value={amount}
            onChange={(e) => handleFieldChange('amount', e.target.value)}
            min="0"
            step="0.01"
          />
          {fieldErrors.amount && (
            <p className='text-red-500 text-xs mt-1'>{fieldErrors.amount}</p>
          )}
        </div>

        {/* Generated Code Preview */}
        <div className='bg-[#00000061] p-3 rounded-lg'>
          <label className='block text-sm text-gray-400 mb-1'>Generated Ticket Code</label>
          <p className='font-mono text-xl text-purple-400'>{generatedCode}</p>
          <p className='text-xs text-gray-400 mt-1'>This code will be assigned to {name || 'the participant'}</p>
        </div>

        {/* Payment Description Notes */}
        <div>
          <label className='block text-sm mb-2'>
            Payment Description Notes<span className='text-red-500'>*</span>
          </label>
          <textarea
            placeholder="Enter payment details or reason"
            className={`w-full border rounded-md p-2 text-white text-xs h-24 bg-transparent ${
              fieldErrors.paymentNotes ? 'border-red-500' : 'border-[#343B4F]'
            }`}
            value={paymentNotes}
            onChange={(e) => handleFieldChange('paymentNotes', e.target.value)}
          />
          {fieldErrors.paymentNotes && (
            <p className='text-red-500 text-xs mt-1'>{fieldErrors.paymentNotes}</p>
          )}
        </div>

        {/* Issued By */}
        <div className='bg-[#00000061] p-3 rounded-lg'>
          <label className='block text-sm text-gray-400 mb-1'>Issued By</label>
          <p className='text-white'>{currentUser?.firstName + ' ' + currentUser?.lastName || 'Admin'}</p>
        </div>

        {/* Action Buttons */}
        <div className='pt-4 flex justify-center gap-4'>
          <button
            type='button'
            onClick={onBack}
            className='text-white font-medium px-6 py-2 rounded-md border border-[#343B4F] hover:bg-[#343B4F] transition-colors'
          >
            Cancel
          </button>
          <button
            type='submit'
            className={`text-white font-medium px-6 py-2 rounded-md transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{
              background: 'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Request Code'}
          </button>
        </div>
      </form>
    </div>
  )
}