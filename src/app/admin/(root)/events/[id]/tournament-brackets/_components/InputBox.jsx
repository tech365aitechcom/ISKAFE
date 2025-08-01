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
  return (
    <div className='bg-[#00000061] p-3 rounded'>
      <div className='text-xs mb-1'>
        {label} {required && <span className='text-red-500'>*</span>}
      </div>
      <input
        type={type}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className='w-full bg-transparent text-white text-xl rounded py-1 focus:outline-none focus:border-white placeholder-gray-400'
      />
    </div>
  )
}
