import React from 'react'

export default function InputBox({ label, required = false, value, onChange }) {
  return (
    <div className='bg-[#00000061] p-3 rounded'>
      <div className='text-xs mb-1'>
        {label} {required && <span className='text-red-500'>*</span>}
      </div>
      <input
        type='text'
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className='w-full bg-transparent text-white text-xl rounded py-1 focus:outline-none focus:border-white'
      />
    </div>
  )
}
