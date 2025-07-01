import { useState } from 'react'

export const CustomMultiSelect = ({
  label,
  options,
  onChange,
  disabled,
  value = [],
}) => {
  const [isOpen, setIsOpen] = useState(false)

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
  }

  const selectedOptions = options.filter((opt) => value.includes(opt._id))

  return (
    <div className='relative w-full'>
      <div
        className={`rounded cursor-pointer px-3 py-2 bg-transparent ${
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
