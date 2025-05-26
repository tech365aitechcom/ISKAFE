import { Upload } from 'lucide-react'
import React from 'react'

export default function FormField({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  options = [],
  validation = '',
  children,
  handleFileChange,
}) {
  return (
    <div className='mb-4'>
      <label className='block text-sm font-medium text-gray-300 mb-1'>
        {label} {required && <span className='text-green-500'>*</span>}
      </label>
      {children ||
        (type === 'select' ? (
          <select
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className='w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white'
          >
            <option value=''>Select {label}</option>
            {options.map((option, index) => (
              <option key={index} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className='w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white'
            rows={4}
          />
        ) : type === 'radio' ? (
          <div className='flex gap-4'>
            {options.map((option, index) => (
              <div key={index} className='flex items-center'>
                <input
                  type='radio'
                  id={`${name}-${option.value}`}
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={onChange}
                  required={required}
                  className='mr-1'
                />
                <label
                  htmlFor={`${name}-${option.value}`}
                  className='text-sm text-gray-300'
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        ) : type === 'file' ? (
          <div className='relative'>
            <input
              type='file'
              name={name}
              onChange={handleFileChange}
              required={required}
              className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
            />
            <div className='flex items-center justify-center w-full h-10 bg-gray-700 border border-gray-600 rounded-md text-white'>
              <Upload size={16} className='mr-2' />
              {value ? value.name : placeholder || 'Choose file'}
            </div>
          </div>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className='w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white'
          />
        ))}
      {validation && <p className='text-xs text-gray-400 mt-1'>{validation}</p>}
    </div>
  )
}
