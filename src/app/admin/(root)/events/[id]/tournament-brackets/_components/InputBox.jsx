import React from 'react'

export default function InputBox({ 
  label, 
  required = false, 
  value, 
  onChange, 
  type = 'text', 
  placeholder = '',
  min,
  max 
}) {
  const handleChange = (e) => {
    let newValue = e.target.value
    
    // Input restrictions based on type
    if (type === 'number') {
      // Only allow positive numbers
      if (newValue && (isNaN(newValue) || parseFloat(newValue) < 0)) {
        return // Don't update if invalid
      }
    }
    
    onChange(newValue)
  }

  const handleKeyPress = (e) => {
    // Prevent negative numbers for number inputs
    if (type === 'number' && (e.key === '-' || e.key === 'e' || e.key === 'E')) {
      e.preventDefault()
    }
  }

  return (
    <div className='bg-[#00000061] p-3 rounded'>
      <div className='text-xs mb-1'>
        {label} {required && <span className='text-red-500'>*</span>}
      </div>
      <input
        type={type}
        value={value || ''}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        min={min}
        max={max}
        className='w-full bg-transparent text-white text-xl rounded py-1 focus:outline-none focus:border-white placeholder-gray-400'
      />
    </div>
  )
}
