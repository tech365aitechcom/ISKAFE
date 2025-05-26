import React from 'react'

export default function FormSection({
  title,
  color = 'bg-gray-700',
  icon,
  children,
}) {
  return (
    <div className='mb-6'>
      <div className={`flex items-center gap-2 ${color} p-2 rounded-t-lg`}>
        {icon}
        <h2 className='text-lg font-bold text-white'>{title}</h2>
      </div>
      <div className='bg-gray-800 p-4 rounded-b-lg'>{children}</div>
    </div>
  )
}
