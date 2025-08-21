'use client'
import React, { useState, useEffect } from 'react'
import { paymentTypes, API_BASE_URL } from '../../../../../constants'
import { ChevronDown, X } from 'lucide-react'
import axios from 'axios'
import moment from 'moment'

export default function RequestCode({
  onBack,
  onAddCode,
  selectedEvent,
  currentUser,
}) {
  const [activeButton, setActiveButton] = useState('spectator')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentType, setPaymentType] = useState('Cash')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState(
    selectedEvent?._id || ''
  )
  const [spectatorForm, setSpectatorForm] = useState({
    name: '',
    email: '',
    mobile: '',
    amount: '',
    paymentNotes: '',
  })
  const [trainerForm, setTrainerForm] = useState({
    name: '',
    email: '',
    mobile: '',
    amount: '',
    paymentNotes: '',
  })
  const [fighterForm, setFighterForm] = useState({
    name: '',
    email: '',
    mobile: '',
    amount: '',
    paymentNotes: '',
  })
  const [codeGenerated, setCodeGenerated] = useState(false)
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (selectedEvent) {
      const eventDay = new Date(selectedEvent.startDate)
        .toISOString()
        .split('T')[0]
      setEventDate(eventDay)
    }
    fetchUsers()
    fetchEvents()
  }, [])

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

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/events`, {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      })
      if (response.data && response.data.data && response.data.data.items) {
        setEvents(response.data.data.items)
      }
    } catch (error) {
      console.error('Error fetching events:', error)
    }
  }

  const handleEventSelect = (eventId) => {
    setSelectedEventId(eventId)
    const selectedEvt = events.find((event) => event._id === eventId)
    if (selectedEvt) {
      const eventDay = new Date(selectedEvt.startDate)
        .toISOString()
        .split('T')[0]
      setEventDate(eventDay)
    }
  }

  const filterUsers = (query) => {
    if (!query.trim()) {
      setFilteredUsers([])
      return
    }
    const filtered = users.filter((user) => {
      const fullName = `${user.firstName || ''} ${user.middleName || ''} ${
        user.lastName || ''
      }`
        .trim()
        .toLowerCase()
      return (
        fullName.includes(query.toLowerCase()) ||
        (user.email && user.email.toLowerCase().includes(query.toLowerCase()))
      )
    })
    setFilteredUsers(filtered)
  }

  const handleNameChange = (value) => {
    // Enforce 50 character limit and alphabetic only for name
    if (value.length > 50) {
      return
    }

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
    const fullName = `${user.firstName || ''} ${user.middleName || ''} ${
      user.lastName || ''
    }`.trim()
    setName(fullName)
    setEmail(user.email || '')
    setMobile(user.phoneNumber || '')
    setSelectedUser(user)
    setShowUserDropdown(false)
    setFieldErrors((prev) => ({ ...prev, name: '', email: '', mobile: '' }))
  }

  const validateField = (fieldName, value) => {
    let error = ''

    switch (fieldName) {
      case 'name':
        if (!value.trim()) {
          error = 'Name is required'
        } else if (!/^[A-Za-z\s'-]+$/.test(value)) {
          error = 'Name must contain only alphabetic characters'
        } else if (value.length > 50) {
          error = 'Name must not exceed 50 characters'
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
        if (value.length > 200) {
          error = 'Description must not exceed 200 characters'
        }
        break
    }

    return error
  }

  const handleFieldChange = (fieldName, value) => {
    const error = validateField(fieldName, value)
    setFieldErrors((prev) => ({ ...prev, [fieldName]: error }))

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
    }
  }

  const handleToggle = (button) => {
    // Save current form data before switching
    const currentFormData = {
      name,
      email,
      mobile,
      amount,
      paymentNotes,
    }

    if (activeButton === 'spectator') {
      setSpectatorForm(currentFormData)
    } else if (activeButton === 'trainer') {
      setTrainerForm(currentFormData)
    } else if (activeButton === 'fighter') {
      setFighterForm(currentFormData)
    }

    // Load form data for the selected button
    let formData
    if (button === 'spectator') {
      formData = spectatorForm
    } else if (button === 'trainer') {
      formData = trainerForm
    } else if (button === 'fighter') {
      formData = fighterForm
    }

    setName(formData.name || '')
    setEmail(formData.email || '')
    setMobile(formData.mobile || '')
    setAmount(formData.amount || '')
    setPaymentNotes(formData.paymentNotes || '')

    setActiveButton(button)
    setSelectedUser(null)
    setShowUserDropdown(false)
    setFieldErrors({})
  }

  const getPreviewData = () => {
    const isRegisteredUser = selectedUser !== null
    const previewData = {
      name: name,
      email: email,
      phoneNumber: parseInt(mobile) || mobile || 9087654321,
      role: activeButton,
      eventId: selectedEventId,
      eventDate: eventDate,
      amountPaid: parseFloat(amount),
      paymentType: paymentType.toLowerCase(),
      paymentNotes: paymentNotes,
    }

    if (isRegisteredUser) {
      previewData.userId = selectedUser._id || selectedUser.id
    }

    return previewData
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate all fields
    const errors = {
      name: validateField('name', name),
      email: validateField('email', email),
      mobile: validateField('mobile', mobile),
      amount: validateField('amount', amount),
      paymentNotes: validateField('paymentNotes', paymentNotes),
    }

    // Add event selection validation
    if (!selectedEventId) {
      errors.event = 'Please select an event'
    }

    setFieldErrors(errors)

    // Check if there are any errors
    const hasErrors = Object.values(errors).some((error) => error)
    if (hasErrors) {
      return
    }

    setIsSubmitting(true)

    try {
      // Use the proper payload structure as per requirements
      const codeData = getPreviewData()

      await onAddCode(codeData)
      setCodeGenerated(true)

      // Reset form only on success
      setName('')
      setEmail('')
      setMobile('')
      setAmount('')
      setPaymentNotes('')
      setSelectedUser(null)
      setFieldErrors({})
      setSpectatorForm({
        name: '',
        email: '',
        mobile: '',
        amount: '',
        paymentNotes: '',
      })
      setTrainerForm({
        name: '',
        email: '',
        mobile: '',
        amount: '',
        paymentNotes: '',
      })
      setFighterForm({
        name: '',
        email: '',
        mobile: '',
        amount: '',
        paymentNotes: '',
      })
    } catch (error) {
      console.error('Error submitting code:', error)
    } finally {
      setIsSubmitting(false)
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

      {/* EVENT SELECTION SECTION */}
      <h2 className='font-bold mb-4 uppercase text-sm border-b border-gray-700 pb-2 mt-8'>
        Event Selection <span className='text-red-500'>*</span>
      </h2>

      <div className='mb-6'>
        <div className='bg-[#00000061] p-2 h-16 rounded'>
          <label className='block text-sm font-medium mb-1'>
            Event Name<span className='text-red-500'>*</span>
          </label>
          <div className='relative'>
            <select
              className={`w-full outline-none appearance-none bg-transparent disabled:cursor-not-allowed ${
                fieldErrors.event ? 'text-red-400' : 'text-white'
              }`}
              value={selectedEventId}
              onChange={(e) => {
                handleEventSelect(e.target.value)
                setFieldErrors((prev) => ({ ...prev, event: '' }))
              }}
              required
              disabled={isSubmitting}
            >
              <option value='' className='text-black'>
                Select an event
              </option>
              {events.map((event) => (
                <option
                  key={event._id}
                  value={event._id}
                  className='text-black'
                >
                  {event.name}
                </option>
              ))}
            </select>
            <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white'>
              <svg
                className='fill-current h-4 w-4'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
              >
                <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
              </svg>
            </div>
          </div>
        </div>
        {fieldErrors.event && (
          <p className='text-red-500 text-xs mt-1'>{fieldErrors.event}</p>
        )}
      </div>

      {/* PARTICIPANT TYPE SELECTION */}
      <h2 className='font-bold mb-4 uppercase text-sm border-b border-gray-700 pb-2 mt-8'>
        Participant Type
      </h2>

      <div className='flex border border-[#343B4F] p-1 rounded-md w-fit mb-6'>
        <button
          onClick={() => handleToggle('spectator')}
          className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${
            activeButton === 'spectator' ? 'bg-[#2E3094] shadow-md' : ''
          } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isSubmitting}
        >
          Spectator
        </button>

        <button
          onClick={() => handleToggle('trainer')}
          className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${
            activeButton === 'trainer' ? 'bg-[#2E3094] shadow-md' : ''
          } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isSubmitting}
        >
          Trainer
        </button>
        <button
          onClick={() => handleToggle('fighter')}
          className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${
            activeButton === 'fighter' ? 'bg-[#2E3094] shadow-md' : ''
          } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isSubmitting}
        >
          Fighter
        </button>
      </div>

      {/* PARTICIPANT DETAILS */}
      <h2 className='font-bold mb-4 uppercase text-sm border-b border-gray-700 pb-2 mt-8'>
        Participant Details
      </h2>

      <form className='space-y-6' onSubmit={handleSubmit}>
        {/* Person Name Field with Dropdown */}
        <div className='relative'>
          <div className='bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>
              {activeButton === 'spectator'
                ? 'Spectator Name'
                : activeButton === 'fighter'
                ? 'Fighter Name'
                : 'Trainer Name'}
              <span className='text-red-500'>*</span>
            </label>
            <div className='relative'>
              <input
                type='text'
                placeholder={`Start typing ${activeButton} name or enter manually`}
                className={`w-full outline-none bg-transparent pr-8 disabled:cursor-not-allowed ${
                  fieldErrors.name ? 'text-red-400' : 'text-white'
                }`}
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim() && filteredUsers?.length > 0) {
                    setShowUserDropdown(true)
                  }
                }}
                disabled={isSubmitting}
                maxLength={50}
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
                    setFieldErrors((prev) => ({ ...prev, name: '' }))
                  }}
                  className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white'
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
          {fieldErrors.name && (
            <p className='text-red-500 text-xs mt-1'>{fieldErrors.name}</p>
          )}

          {/* Dropdown */}
          {showUserDropdown && filteredUsers?.length > 0 && (
            <div className='absolute z-10 w-full mt-1 bg-[#0B1739] border border-[#343B4F] rounded-md shadow-lg max-h-48 overflow-y-auto'>
              {filteredUsers.map((user) => {
                const fullName = `${user.firstName || ''} ${
                  user.middleName || ''
                } ${user.lastName || ''}`.trim()
                return (
                  <div
                    key={user._id}
                    className='p-2 hover:bg-[#2E3094] cursor-pointer text-sm'
                    onClick={() => handleUserSelect(user)}
                  >
                    <div className='font-medium'>{fullName}</div>
                    <div className='text-xs text-gray-400'>{user.email}</div>
                    <div className='text-xs text-gray-400'>
                      {user.phoneNumber}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Email Field */}
        <div className='bg-[#00000061] p-2 h-16 rounded'>
          <label className='block text-sm font-medium mb-1'>
            Email<span className='text-red-500'>*</span>
          </label>
          <input
            type='email'
            placeholder='Enter email address'
            className={`w-full outline-none bg-transparent disabled:cursor-not-allowed ${
              fieldErrors.email ? 'text-red-400' : 'text-white'
            }`}
            value={email}
            onChange={(e) => handleFieldChange('email', e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        {fieldErrors.email && (
          <p className='text-red-500 text-xs mt-1'>{fieldErrors.email}</p>
        )}

        {/* Mobile Field */}
        <div className='bg-[#00000061] p-2 h-16 rounded'>
          <label className='block text-sm font-medium mb-1'>
            Mobile Number<span className='text-red-500'>*</span>
          </label>
          <input
            type='tel'
            placeholder='Enter mobile number'
            className={`w-full outline-none bg-transparent disabled:cursor-not-allowed ${
              fieldErrors.mobile ? 'text-red-400' : 'text-white'
            }`}
            value={mobile}
            onChange={(e) => handleFieldChange('mobile', e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        {fieldErrors.mobile && (
          <p className='text-red-500 text-xs mt-1'>{fieldErrors.mobile}</p>
        )}

        {/* PAYMENT DETAILS */}
        <h2 className='font-bold mb-4 uppercase text-sm border-b border-gray-700 pb-2 mt-8'>
          Payment Details
        </h2>

        {/* Payment Type */}
        <div className='bg-[#00000061] p-2 h-16 rounded'>
          <label className='block text-sm font-medium mb-1'>
            Payment Type<span className='text-red-500'>*</span>
          </label>
          <div className='relative'>
            <select
              className='w-full outline-none appearance-none bg-transparent disabled:cursor-not-allowed text-white'
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
              required
              disabled={isSubmitting}
            >
              {paymentTypes.map((type) => (
                <option key={type} value={type} className='text-black'>
                  {type}
                </option>
              ))}
            </select>
            <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white'>
              <svg
                className='fill-current h-4 w-4'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
              >
                <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
              </svg>
            </div>
          </div>
        </div>

        {/* Amount Field */}
        <div className='bg-[#00000061] p-2 h-16 rounded'>
          <label className='block text-sm font-medium mb-1'>
            Amount Paid (USD)<span className='text-red-500'>*</span>
          </label>
          <input
            type='number'
            placeholder='Enter amount'
            className={`w-full outline-none bg-transparent disabled:cursor-not-allowed ${
              fieldErrors.amount ? 'text-red-400' : 'text-white'
            }`}
            value={amount}
            onChange={(e) => handleFieldChange('amount', e.target.value)}
            min='0'
            step='0.01'
            disabled={isSubmitting}
          />
        </div>
        {fieldErrors.amount && (
          <p className='text-red-500 text-xs mt-1'>{fieldErrors.amount}</p>
        )}

        {/* Payment Description Notes */}
        <div className='bg-[#00000061] p-2 rounded'>
          <label className='block text-sm font-medium mb-1'>
            Payment Description Notes
          </label>
          <textarea
            placeholder='Enter payment details or reason (optional)'
            className={`w-full outline-none resize-none bg-transparent disabled:cursor-not-allowed ${
              fieldErrors.paymentNotes ? 'text-red-400' : 'text-white'
            }`}
            rows='3'
            value={paymentNotes}
            onChange={(e) => handleFieldChange('paymentNotes', e.target.value)}
            maxLength={200}
            disabled={isSubmitting}
          />
          <p className='text-xs text-gray-400 mt-1'>Max 200 characters</p>
        </div>
        {fieldErrors.paymentNotes && (
          <p className='text-red-500 text-xs mt-1'>
            {fieldErrors.paymentNotes}
          </p>
        )}

        {/* Issued By */}
        <div className='bg-[#00000061] p-3 rounded-lg'>
          <label className='block text-sm text-gray-400 mb-1'>Issued By</label>
          <p className='text-white'>
            {currentUser?.firstName + ' ' + currentUser?.lastName || 'Admin'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-center gap-4 mt-12'>
          <button
            type='button'
            onClick={() => {
              if (!codeGenerated) {
                onBack()
              } else {
                onBack()
              }
            }}
            className='text-white font-medium px-6 py-2 rounded-md border border-[#343B4F] hover:bg-[#343B4F] transition-colors'
            title='Closes the form and returns to previous screen'
          >
            Cancel
          </button>
          <button
            type='submit'
            className={`text-white font-medium px-6 py-2 rounded-md transition-colors ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{
              background:
                'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
            }}
            disabled={isSubmitting}
            title='Validates & generates code'
          >
            {isSubmitting ? 'Processing...' : 'Request Code'}
          </button>
        </div>
      </form>
    </div>
  )
}
