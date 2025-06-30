import { useState } from 'react'

export const CustomMultiSelect = ({ label, options, onChange, disabled }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState([])

  const toggleDropdown = () => {
    if (!disabled) setIsOpen((prev) => !prev)
  }

  const handleSelect = (option) => {
    if (disabled) return
    const alreadySelected = selected.find((u) => u._id === option._id)
    let updated
    if (alreadySelected) {
      updated = selected.filter((u) => u._id !== option._id)
    } else {
      updated = [...selected, option]
    }
    setSelected(updated)
    onChange(updated.map((u) => u._id))
  }

  return (
    <div className='relative w-full'>
      <div
        className={`rounded cursor-pointer px-3  ${
          disabled
            ? 'bg-transparent text-gray-500 cursor-not-allowed'
            : 'bg-[#00000061] text-white'
        }`}
        onClick={toggleDropdown}
      >
        {selected.length > 0
          ? selected.map((u) => u.fullName).join(', ')
          : label}
      </div>

      {isOpen && !disabled && (
        <div className='absolute w-full mt-1 max-h-44 overflow-y-auto border bg-white shadow-lg z-10 rounded'>
          {options.map((option) => (
            <div
              key={option._id}
              className='p-2 hover:bg-gray-200 cursor-pointer flex items-center gap-2'
              onClick={() => handleSelect(option)}
            >
              <span className='text-black'>
                {option.fullName || option.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
