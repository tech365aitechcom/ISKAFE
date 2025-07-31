'use client'

import React, { useState } from 'react'
import { Button } from '../../../../../../../components/ui/button'

const GuestDetailsForm = ({ onNext, onBack, onCancel, purchaseData }) => {
  const [formData, setFormData] = useState({
    firstName: purchaseData.guestDetails?.firstName || '',
    lastName: purchaseData.guestDetails?.lastName || '',
    email: purchaseData.guestDetails?.email || purchaseData.email || '',
    phone: purchaseData.guestDetails?.phone || ''
  })
  const [errors, setErrors] = useState({})

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const phone = value.replace(/\D/g, '')
    
    // Format: (xxx) xxx-xxxx
    if (phone.length >= 6) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3, 6)}-${phone.slice(6, 10)}`
    } else if (phone.length >= 3) {
      return `(${phone.slice(0, 3)}) ${phone.slice(3)}`
    } else {
      return phone
    }
  }

  const validatePhone = (phone) => {
    // Remove formatting and check if we have 10 digits
    const cleanPhone = phone.replace(/\D/g, '')
    return cleanPhone.length === 10
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    let formattedValue = value
    if (name === 'phone') {
      formattedValue = formatPhoneNumber(value)
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext('tickets', {
        guestDetails: formData
      })
    }
  }

  return (
    <div className="bg-[#1b0c2e] rounded-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Basic Information</h2>
        <p className="text-gray-400">Please provide your details to continue with the ticket purchase.</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`w-full bg-[#0A1330] border ${
                errors.firstName ? 'border-red-500' : 'border-gray-600'
              } rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500`}
              placeholder="First Name"
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`w-full bg-[#0A1330] border ${
                errors.lastName ? 'border-red-500' : 'border-gray-600'
              } rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500`}
              placeholder="Last Name"
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            className="w-full bg-[#0A1330] border border-gray-600 rounded px-4 py-3 text-gray-400 cursor-not-allowed"
            disabled
          />
          <p className="text-gray-500 text-sm mt-1">Email cannot be changed</p>
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-2">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`w-full bg-[#0A1330] border ${
              errors.phone ? 'border-red-500' : 'border-gray-600'
            } rounded px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500`}
            placeholder="(xxx) xxx-xxxx"
            maxLength={14}
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleNext}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded font-medium"
          >
            Next
          </Button>
        </div>

        <div className="flex justify-center space-x-6">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-white underline"
          >
            Back
          </button>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white underline"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default GuestDetailsForm