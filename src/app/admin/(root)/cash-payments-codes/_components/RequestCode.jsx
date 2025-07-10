'use client'
import React, { useState, useEffect } from 'react'
import { paymentTypes } from '../../../../../constants'

export default function RequestCode({ onBack, onAddCode, selectedEvent, currentUser }) {
  const [activeButton, setActiveButton] = useState('fighter')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentType, setPaymentType] = useState('Cash')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Generate a unique code when component mounts
    const randomCode = Math.random().toString(36).substr(2, 5).toUpperCase();
    setGeneratedCode(randomCode);
  }, []);

  const handleToggle = (button) => {
    setActiveButton(button)
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      const newCode = {
        id: Date.now(),
        date: new Date().toLocaleDateString(),
        name,
        email,
        code: generatedCode,
        amount: parseFloat(amount),
        paymentType,
        issuedAt: new Date().toLocaleString(),
        issuedBy: currentUser.name,
        redeemed: false,
        redeemedAt: "",
        notes: paymentNotes
      };
      
      onAddCode(newCode);
      setIsSubmitting(false);
    }, 1000);
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
        </div>
      )}

      {/* Toggle buttons */}
      <div className='flex border border-[#343B4F] p-1 rounded-md w-fit mb-6'>
        <button
          onClick={() => handleToggle('fighter')}
          className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${
            activeButton === 'fighter' ? 'bg-[#2E3094] shadow-md' : ''
          }`}
        >
          Fighter
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
        {/* Payer's Name Field */}
        <div>
          <label className='block text-sm mb-2'>
            {activeButton === 'fighter' ? 'Fighter Name' : 'Trainer Name'}
            <span className='text-red-500'>*</span>
          </label>
          <input
            type='text'
            placeholder={`Start typing ${activeButton} name`}
            className='w-full border border-[#343B4F] rounded-md p-2 text-[#AEB9E1] text-xs'
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Email Field */}
        <div>
          <label className='block text-sm mb-2'>
            Email<span className='text-red-500'>*</span>
          </label>
          <input
            type='email'
            placeholder="Enter email address"
            className='w-full border border-[#343B4F] rounded-md p-2 text-[#AEB9E1] text-xs'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Mobile Field */}
        <div>
          <label className='block text-sm mb-2'>
            Mobile Number<span className='text-red-500'>*</span>
          </label>
          <input
            type='tel'
            placeholder="Enter mobile number"
            className='w-full border border-[#343B4F] rounded-md p-2 text-[#AEB9E1] text-xs'
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />
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

        {/* Amount Field */}
        <div>
          <label className='block text-sm mb-2'>
            💲 Amount Paid (USD)<span className='text-red-500'>*</span>
          </label>
          <input
            type='number'
            placeholder="Enter amount"
            className='w-full border border-[#343B4F] rounded-md p-2 text-[#AEB9E1] text-xs'
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
            required
          />
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
            className='w-full border border-[#343B4F] rounded-md p-2 text-[#AEB9E1] text-xs h-24'
            value={paymentNotes}
            onChange={(e) => setPaymentNotes(e.target.value)}
            required
          />
        </div>

        {/* Issued By */}
        <div className='bg-[#00000061] p-3 rounded-lg'>
          <label className='block text-sm text-gray-400 mb-1'>Issued By</label>
          <p className='text-white'>{currentUser.name}</p>
        </div>

        {/* Request Code Button */}
        <div className='pt-4 flex justify-center'>
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