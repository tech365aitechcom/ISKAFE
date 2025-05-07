import { useState } from 'react'

export const CustomMultiSelect = ({ label, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selected, setSelected] = useState([])

  const toggleDropdown = () => setIsOpen((prev) => !prev)

  const handleSelect = (option) => {
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
        className='text-white rounded cursor-pointer'
        onClick={toggleDropdown}
      >
        {selected.length > 0
          ? selected.map((u) => u.fullName).join(', ')
          : label}
      </div>

      {isOpen && (
        <div className='absolute w-full mt-1 max-h-60 overflow-y-auto border bg-white shadow-lg z-10 rounded'>
          {options.map((option) => (
            <div
              key={option._id}
              className='p-2 hover:bg-gray-200 cursor-pointer flex items-center gap-2'
              onClick={() => handleSelect(option)}
            >
              <span className='text-black'>{option.fullName}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
