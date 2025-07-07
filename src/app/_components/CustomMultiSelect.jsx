import { useState, useEffect, useRef } from 'react'

export const CustomMultiSelect = ({
  label,
  options,
  onChange,
  disabled,
  value = [],
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null) // Ref to track dropdown container

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on Esc key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const toggleDropdown = () => {
    if (!disabled) setIsOpen((prev) => !prev)
  }

  const handleSelect = (option) => {
    if (disabled) return

    const alreadySelected = value.includes(option._id)
    let updatedIds

    if (alreadySelected) {
      updatedIds = value.filter((id) => id !== option._id)
    } else {
      updatedIds = [...value, option._id]
    }

    onChange(updatedIds)
    setIsOpen(false) // Close dropdown after selection (optional)
  }

  const selectedOptions = options.filter((opt) => value.includes(opt._id))

  return (
    <div className='relative w-full' ref={dropdownRef}>
      <div
        className={`rounded cursor-pointer px-3  bg-transparent ${
          disabled ? 'text-gray-500 cursor-not-allowed' : 'text-white'
        }`}
        onClick={toggleDropdown}
      >
        {selectedOptions.length > 0
          ? selectedOptions.map((u) => u.fullName).join(', ')
          : label}
      </div>

      {isOpen && !disabled && (
        <div className='absolute w-full mt-1 max-h-44 overflow-y-auto border bg-white shadow-lg z-10 rounded'>
          {options.map((option) => {
            const isSelected = value.includes(option._id)
            return (
              <div
                key={option._id}
                className={`p-2 flex items-center gap-2 cursor-pointer hover:bg-gray-200 ${
                  isSelected ? 'bg-gray-100 font-semibold' : ''
                }`}
                onClick={() => handleSelect(option)}
              >
                <span className='text-black'>
                  {option.fullName || option.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
