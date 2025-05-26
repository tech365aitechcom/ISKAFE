'use client'
import React, { useState } from 'react'

export const AddOfficialTitle = ({ setShowAddTitleForm }) => {
  const [formData, setFormData] = useState({
    proClassification: '',
    sport: '',
    ageClass: '',
    weightClass: '',
    title: '',
    date: '',
    notes: '',
    fighters: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  // Options for selects
  const proClassificationOptions = ['Professional', 'Amateur']
  const sportOptions = ['MMA', 'Boxing', 'Kickboxing', 'Wrestling']
  const ageClassOptions = ['Boys', 'Men', , 'Girls', 'Senior Men']
  const weightClassOptions = ['Lightweight', 'Middleweight', 'Heavyweight']
  const fighterOptions = ['Fighter 1', 'Fighter 2', 'Fighter 3']

  const selectOptionsMap = {
    proClassification: proClassificationOptions,
    sport: sportOptions,
    ageClass: ageClassOptions,
    weightClass: weightClassOptions,
    fighter: fighterOptions,
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Add your submission logic here
  }

  return (
    <div className='min-h-screen text-white bg-dark-blue-900'>
      <div className='w-full'>
        <div className='flex items-center gap-4 mb-6'>
          <button
            className='text-white'
            onClick={() => setShowAddTitleForm(false)}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M10 19l-7-7m0 0l7-7m-7 7h18'
              />
            </svg>
          </button>
          <h1 className='text-xl font-medium'>Add New Title</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
            {[
              { label: 'Pro Classification', name: 'proClassification' },
              { label: 'Sport', name: 'sport' },
              { label: 'Age Class', name: 'ageClass' },
              { label: 'Weight Class', name: 'weightClass' },
              { label: 'Title Name', name: 'title' },
              { label: 'Date', name: 'date', type: 'date' },
              { label: 'Fighter', name: 'fighter' },
            ].map(({ label, name, type = 'text' }) => {
              const isSelect = [
                'proClassification',
                'sport',
                'ageClass',
                'weightClass',
                'fighter',
              ].includes(name)
              return (
                <div key={name} className='bg-[#00000061] p-2 rounded'>
                  <label className='block text-sm font-medium mb-1'>
                    {label}
                    <span className='text-red-500'>*</span>
                  </label>
                  {isSelect ? (
                    <select
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      className='w-full bg-transparent outline-none text-white'
                      required
                    >
                      <option value='' className='text-black'>
                        Select {label}
                      </option>
                      {selectOptionsMap[name].map((opt) => (
                        <option key={opt} value={opt} className='text-black'>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={type}
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      className='w-full bg-transparent outline-none'
                      required
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* Notes */}
          <div className='bg-[#00000061] p-2 rounded mb-4'>
            <label className='block text-xs font-medium mb-1'>
              Notes (Optional)
            </label>
            <textarea
              name='notes'
              value={formData.notes}
              onChange={handleChange}
              rows='3'
              className='w-full bg-transparent outline-none resize-none'
              maxLength={500}
            />
          </div>

          <div className='flex justify-center gap-4 mt-6'>
            <button
              type='submit'
              className='bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded transition duration-200'
            >
              Save
            </button>{' '}
          </div>
        </form>
      </div>
    </div>
  )
}
