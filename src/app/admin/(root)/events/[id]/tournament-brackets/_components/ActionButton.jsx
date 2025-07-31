import React from 'react'

export default function ActionButton({ icon, label, bg, border, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 text-sm rounded flex items-center gap-2 transition-colors ${
        border ? 'border border-white' : ''
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
      style={{ background: bg }}
    >
      {icon}
      <span className='mr-1'>{label}</span>
    </button>
  )
}
