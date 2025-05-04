import React from 'react'

export default function ActionButton({ icon, label, bg, border }) {
  return (
    <button
      className={`px-3 py-2 text-sm rounded flex items-center gap-2 ${
        border ? 'border border-white' : ''
      }`}
      style={{ background: bg }}
    >
      {icon}
      <span className='mr-1'>{label}</span>
    </button>
  )
}
