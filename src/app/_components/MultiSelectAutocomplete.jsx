import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'

const MultiSelectAutocomplete = ({
  label,
  options,
  selected,
  onChange,
  placeholder = 'Search...',
}) => {
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }

  const handleSelect = (option) => {
    if (!selected.includes(option)) {
      onChange([...selected, option])
      setInputValue('')
      inputRef.current?.focus()
    }
  }

  const handleRemove = (option) => {
    onChange(selected.filter((item) => item !== option))
    inputRef.current?.focus()
  }

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const filteredOptions = options.filter(
    (opt) =>
      opt.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selected.includes(opt)
  )

  return (
    <div className='relative w-full' ref={containerRef}>
      {label && (
        <label className='block text-xs font-medium mb-1'>{label}</label>
      )}

      <div
        className='flex flex-wrap items-center gap-2 bg-[#00000061] px-3 py-2 rounded cursor-text min-h-[44px]'
        onClick={() => {
          inputRef.current?.focus()
          setIsFocused(true)
        }}
      >
        {selected.map((item) => (
          <span
            key={item}
            className='flex items-center bg-blue-700 text-white text-sm px-2 py-1 rounded-full'
          >
            {item}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRemove(item)
              }}
              onMouseDown={(e) => e.preventDefault()} // prevent blur on remove click
              className='ml-1 text-white hover:text-red-500'
            >
              <X size={12} />
            </button>
          </span>
        ))}

        <input
          ref={inputRef}
          type='text'
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          className='flex-1 bg-transparent text-sm text-white placeholder-gray-400 outline-none min-w-[100px]'
        />
      </div>

      {isFocused && filteredOptions.length > 0 && (
        <div className='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow max-h-48 overflow-y-auto'>
          {filteredOptions.map((option) => (
            <div
              key={option}
              onClick={() => handleSelect(option)}
              className='px-4 py-2 text-sm cursor-pointer hover:bg-blue-100 text-black'
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default MultiSelectAutocomplete
