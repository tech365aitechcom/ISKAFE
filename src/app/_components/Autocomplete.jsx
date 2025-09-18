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
  readOnly = false,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  // Validate and normalize options
  const validOptions = options
    .filter(opt => opt && typeof opt === 'object' && 'value' in opt && 'label' in opt)
    .map(opt => ({
      value: String(opt.value),
      label: String(opt.label)
    }));

  // Normalize selected values
  const selectedValues = (() => {
    if (multiple) {
      return Array.isArray(selected) 
        ? selected.filter(item => item && 'value' in item)
        : [];
    } else {
      return selected && 'value' in selected ? [selected] : [];
    }
  })();

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }

  const handleSelect = (option) => {
    if (!option || !('value' in option) || disabled) return;

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
    if (!option || !('value' in option) || disabled) return;

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
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (!multiple && !isFocused && selected && 'label' in selected) {
      setInputValue(selected.label || '')
    }
  }, [selected, isFocused, multiple])

  const filteredOptions = validOptions.filter(
    (opt) =>
      opt.label.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedValues.find((sel) => sel.value === opt.value)
  )

  return (
    <div className='w-full bg-[#00000061] p-2 rounded' ref={containerRef}>
      {label && (
        <label className='block font-medium mb-1 text-white'>{label}</label>
      )}
      <div
        className={`flex flex-wrap items-center gap-2 px-3 py-2 rounded min-h-[50px] ${
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-text'
        }`}
        onClick={() => {
          if (!disabled) {
            inputRef.current?.focus()
            setIsFocused(true)
          }
        }}
      >
        {multiple &&
          selectedValues.map((item) => (
            <span
              key={`selected-${item.value}`}
              className='flex items-center bg-blue-700 text-white text-sm px-2 py-1 rounded-full'
            >
              {item.label}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove(item)
                }}
                onMouseDown={(e) => e.preventDefault()}
                disabled={disabled}
                className={`ml-1 text-white ${
                  disabled ? 'cursor-not-allowed' : 'hover:text-red-500'
                }`}
              >
                <X size={12} />
              </button>
            </span>
          ))}

        <div className='flex-1 flex items-center min-w-[100px]'>
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
            onFocus={() => !disabled && setIsFocused(true)}
            disabled={disabled}
            className='flex-1 text-sm text-white placeholder-gray-400 outline-none bg-transparent disabled:text-gray-400 disabled:cursor-not-allowed'
            required={required}
            readOnly={readOnly}
          />
          {!multiple && selected && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRemove(selected)
              }}
              onMouseDown={(e) => e.preventDefault()}
              disabled={disabled}
              className={`ml-2 text-red-500 ${
                disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
              }`}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {isFocused && !disabled && filteredOptions.length > 0 && (
        <div className='absolute z-10 min-w-[100px] mt-1 bg-white border border-gray-300 rounded shadow max-h-48 overflow-y-auto'>
          {filteredOptions.map((option) => (
            <div
              key={`option-${option.value}`}
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