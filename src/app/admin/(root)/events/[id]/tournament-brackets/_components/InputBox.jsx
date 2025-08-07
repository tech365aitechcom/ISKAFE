import React, { useState } from 'react'

export default function InputBox({ 
  label, 
  required = false, 
  value, 
  onChange, 
  type = 'text', 
  placeholder = '',
  min,
  max,
  validation = 'alphanumeric' // 'numeric', 'alphanumeric', 'text'
}) {
  const [error, setError] = useState('')

  const validateInput = (inputValue, validationType) => {
    if (!inputValue || inputValue.trim() === '') {
      if (required) {
        return `${label} is required`
      }
      return ''
    }

    switch (validationType) {
      case 'numeric':
        if (!/^\d+$/.test(inputValue.trim())) {
          return `${label} must contain only numbers`
        }
        const numValue = parseInt(inputValue)
        if (numValue <= 0) {
          return `${label} must be a positive number`
        }
        if (min && numValue < min) {
          return `${label} must be at least ${min}`
        }
        if (max && numValue > max) {
          return `${label} cannot exceed ${max}`
        }
        break
      
      case 'alphanumeric':
        if (!/^[a-zA-Z0-9\s'&.-]+$/.test(inputValue.trim())) {
          return `${label} can only contain letters, numbers, spaces, and common punctuation (', &, ., -)`
        }
        break
      
      case 'text':
        // Allow most characters for text fields
        if (inputValue.trim().length === 0 && required) {
          return `${label} is required`
        }
        break
      
      default:
        break
    }
    
    return ''
  }

  const handleChange = (e) => {
    let newValue = e.target.value
    
    // Real-time validation
    const validationError = validateInput(newValue, validation)
    setError(validationError)
    
    // For numeric inputs, prevent invalid characters completely
    if (validation === 'numeric' || type === 'number') {
      // Only allow digits
      if (newValue && !/^\d*$/.test(newValue)) {
        return // Don't update if invalid characters
      }
    }
    
    // For alphanumeric, filter out invalid characters
    if (validation === 'alphanumeric' && newValue) {
      newValue = newValue.replace(/[^a-zA-Z0-9\s'&.-]/g, '')
    }
    
    onChange(newValue)
  }

  const handleKeyPress = (e) => {
    // Prevent invalid characters
    if (validation === 'numeric' || type === 'number') {
      // Only allow digits
      if (!/\d/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
      }
    } else if (validation === 'alphanumeric') {
      // Allow letters, numbers, spaces, punctuation, and control keys
      if (!/[a-zA-Z0-9\s'&.-]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
      }
    }
  }

  const handleBlur = () => {
    // Final validation on blur
    const validationError = validateInput(value, validation)
    setError(validationError)
  }

  return (
    <div className='bg-[#00000061] p-3 rounded'>
      <div className='text-xs mb-1'>
        {label} {required && <span className='text-red-500'>*</span>}
      </div>
      <input
        type={type === 'number' && validation === 'numeric' ? 'text' : type}
        value={value || ''}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        onBlur={handleBlur}
        placeholder={placeholder}
        min={min}
        max={max}
        className={`w-full bg-transparent text-white text-xl rounded py-1 focus:outline-none placeholder-gray-400 placeholder:text-sm placeholder:font-normal ${
          error ? 'border-b-2 border-red-500 focus:border-red-500' : 'focus:border-white'
        }`}
      />
      {error && (
        <div className='text-red-400 text-xs mt-1 flex items-center'>
          <span className='mr-1'>⚠</span>
          {error}
        </div>
      )}
    </div>
  )
}
