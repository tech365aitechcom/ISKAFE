import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'

const Autocomplete = ({
  label,
  options = [],
  selected,
  onChange,
  multiple = false,
  required = false,
  placeholder = 'Search...',
}) => {
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  const selectedValues = multiple
    ? Array.isArray(selected)
      ? selected
      : []
    : selected
    ? [selected]
    : []

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }

  const handleSelect = (option) => {
    if (multiple) {
      if (!selectedValues.find((item) => item.value === option.value)) {
        onChange([...selectedValues, option])
      }
      setInputValue('')
    } else {
      onChange(option)
      setInputValue(option.label)
      setIsFocused(false)
    }
    inputRef.current?.focus()
  }

  const handleRemove = (option) => {
    if (multiple) {
      onChange(selectedValues.filter((item) => item.value !== option.value))
    } else {
      onChange(null)
      setInputValue('')
    }
    inputRef.current?.focus()
  }

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

  useEffect(() => {
    if (!multiple && !isFocused && selected) {
      setInputValue(selected.label || '')
    }
  }, [selected, isFocused, multiple])

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedValues.find((sel) => sel.value === opt.value)
  )

  return (
    <div className='w-full' ref={containerRef}>
      {label && (
        <label className='block font-medium mb-1 text-white'>{label}</label>
      )}
      <div
        className='flex flex-wrap items-center gap-2 bg-[#00000061] px-3 py-2 rounded cursor-text min-h-[50px]'
        onClick={() => {
          inputRef.current?.focus()
          setIsFocused(true)
        }}
      >
        {multiple &&
          selectedValues.map((item) => (
            <span
              key={item.value}
              className='flex items-center bg-blue-700 text-white text-sm px-2 py-1 rounded-full'
            >
              {item.label}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove(item)
                }}
                onMouseDown={(e) => e.preventDefault()}
                className='ml-1 text-white hover:text-red-500'
              >
                <X size={12} />
              </button>
            </span>
          ))}

        <input
          ref={inputRef}
          type='text'
          value={
            multiple
              ? inputValue
              : isFocused
              ? inputValue
              : selected?.label ?? ''
          }
          onChange={handleInputChange}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          className='flex-1 bg-transparent text-sm text-white placeholder-gray-400 outline-none min-w-[100px]'
          required={required}
        />
      </div>

      {isFocused && filteredOptions.length > 0 && (
        <div className='absolute z-10 min-w-[100px] mt-1 bg-white border border-gray-300 rounded shadow max-h-48 overflow-y-auto'>
          {filteredOptions.map((option) => (
            <div
              key={option.value}
              onClick={() => handleSelect(option)}
              className='px-4 py-2 text-sm cursor-pointer hover:bg-blue-100 text-black'
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Autocomplete
