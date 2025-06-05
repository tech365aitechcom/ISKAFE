'use client'
import React, { useState } from 'react'

export const AddRulesForm = ({ setShowAddRuleForm }) => {
  const [formData, setFormData] = useState({
    // Basic Info
    ruleCategory: '',
    subTabName: '',
    subTabRuleDescription: '',
    ruleTitle: '',
    ruleDescription: '',
    uploadPDF: null,
    videoLink: '',
    sortOrder: '',
    status: 'Active',
  })

  const [errors, setErrors] = useState({})

  const validateField = (name, value) => {
    switch (name) {
      case 'ruleCategory':
        return value.trim() === '' ? 'Rule category is required' : ''
      case 'subTabName':
        return value.trim() === '' ? 'Sub-tab name is required' : ''
      case 'subTabRuleDescription':
        return value.trim() === ''
          ? 'Sub-tab rule description is required'
          : value.length > 1500
          ? 'Maximum 1500 characters allowed'
          : ''
      case 'ruleTitle':
        return value.trim() === ''
          ? 'Rule title is required'
          : value.length > 100
          ? 'Maximum 100 characters allowed'
          : ''
      case 'ruleDescription':
        return value.trim() === ''
          ? 'Rule description is required'
          : value.length > 2000
          ? 'Maximum 2000 characters allowed'
          : ''
      case 'uploadPDF':
        if (value && !value.name.endsWith('.pdf')) {
          return 'Only PDF files are allowed'
        }
        return ''
      case 'videoLink':
        if (value.trim() !== '') {
          const isValidLink =
            value.includes('youtube.com') ||
            value.includes('youtu.be') ||
            value.includes('vimeo.com')
          if (!isValidLink) {
            return 'Only YouTube or Vimeo links are allowed'
          }
        }
        return ''
      case 'sortOrder':
        return value.trim() === ''
          ? 'Sort order is required'
          : isNaN(value) || parseInt(value) < 0
          ? 'Enter a valid number'
          : ''
      case 'status':
        return value.trim() === '' ? 'Status is required' : ''
      default:
        return ''
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target
    const newValue =
      type === 'checkbox' ? checked : type === 'file' ? files[0] || null : value

    setFormData((prevState) => ({
      ...prevState,
      [name]: newValue,
    }))

    // Validate field if it's required
    if (
      [
        'ruleCategory',
        'subTabName',
        'subTabRuleDescription',
        'ruleTitle',
        'ruleDescription',
        'sortOrder',
        'status',
      ].includes(name)
    ) {
      const error = validateField(name, newValue)
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    let isValid = true

    // Validate all required fields
    Object.keys(formData).forEach((field) => {
      if (
        [
          'ruleCategory',
          'subTabName',
          'subTabRuleDescription',
          'ruleTitle',
          'ruleDescription',
          'sortOrder',
          'status',
        ].includes(field)
      ) {
        const error = validateField(field, formData[field])
        if (error) {
          newErrors[field] = error
          isValid = false
        }
      }
    })

    // Validate optional fields with content
    if (formData.uploadPDF) {
      const error = validateField('uploadPDF', formData.uploadPDF)
      if (error) {
        newErrors.uploadPDF = error
        isValid = false
      }
    }

    if (formData.videoLink) {
      const error = validateField('videoLink', formData.videoLink)
      if (error) {
        newErrors.videoLink = error
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      // Handle form submission logic here
      console.log('Form submitted:', formData)
      // You would typically send this data to an API endpoint
    } else {
      console.log('Form has errors')
    }
  }

  const handleCancel = () => {
    setFormData({
      ruleCategory: '',
      subTabName: '',
      subTabRuleDescription: '',
      ruleTitle: '',
      ruleDescription: '',
      uploadPDF: null,
      videoLink: '',
      sortOrder: '',
      status: 'Active',
    })
    setShowAddRuleForm(false)
  }

  return (
    <div className='min-h-screen text-white w-full'>
      <div className='w-full'>
        {/* Header with back button */}
        <div className='flex items-center gap-4 mb-6'>
          <button
            className='mr-2 text-white'
            onClick={() => setShowAddRuleForm(false)}
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
          <h1 className='text-2xl font-bold'>Add New Rule</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Rule Category Section */}
          <div className='mb-6'>
            <h2 className='text-lg font-semibold mb-2'>
              Rule Category Information
            </h2>
            <div className='grid grid-cols-2 gap-4'>
              {/* Rule Category Field */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  Rule Category Tab Name<span className='text-red-500'>*</span>
                </label>
                <div className='flex space-x-2'>
                  <select
                    name='ruleCategory'
                    value={formData.ruleCategory}
                    onChange={handleChange}
                    className='w-full bg-transparent outline-none'
                    required
                  >
                    <option value='' className='text-black'>
                      Select Category
                    </option>
                    <option value='Kickboxing' className='text-black'>
                      Kickboxing
                    </option>
                    <option value='Muay Thai' className='text-black'>
                      Muay Thai
                    </option>
                    <option value='Boxing' className='text-black'>
                      Boxing
                    </option>
                    <option value='MMA' className='text-black'>
                      MMA
                    </option>
                  </select>
                </div>
                {errors.ruleCategory && (
                  <p className='text-red-500 text-xs mt-1'>
                    {errors.ruleCategory}
                  </p>
                )}
              </div>

              {/* Sub-Tab Name */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  Sub-Tab Name<span className='text-red-500'>*</span>
                </label>
                <div className='flex space-x-2'>
                  <select
                    name='subTabName'
                    value={formData.subTabName}
                    onChange={handleChange}
                    className='w-full bg-transparent outline-none'
                    required
                  >
                    <option value='' className='text-black'>
                      Select Sub-Tab
                    </option>
                    <option value='General' className='text-black'>
                      General
                    </option>
                    <option value='Equipment' className='text-black'>
                      Equipment
                    </option>
                    <option value='Judging' className='text-black'>
                      Judging
                    </option>
                    <option value='Other' className='text-black'>
                      Other
                    </option>
                  </select>
                </div>
                {errors.subTabName && (
                  <p className='text-red-500 text-xs mt-1'>
                    {errors.subTabName}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sub-Tab Rule Description */}
          <div className='mb-6'>
            <h2 className='text-lg font-semibold mb-3'>
              Sub-Tab Rule Description
            </h2>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Sub-Tab Rule Description<span className='text-red-500'>*</span>
              </label>
              <textarea
                name='subTabRuleDescription'
                value={formData.subTabRuleDescription}
                onChange={handleChange}
                placeholder='Enter description for this sub-tab'
                className='w-full bg-transparent outline-none min-h-[100px]'
                maxLength={1500}
                required
              />
              <p className='text-xs text-gray-400 mt-1'>
                {formData.subTabRuleDescription.length}/1500 chars (Max
                1000-1500 characters)
              </p>
              {errors.subTabRuleDescription && (
                <p className='text-red-500 text-xs mt-1'>
                  {errors.subTabRuleDescription}
                </p>
              )}
            </div>
          </div>

          {/* Rule Details Section */}
          <div className='mb-6'>
            <h2 className='text-lg font-semibold mb-3'>Rule Details</h2>

            {/* Rule Title */}
            <div className='bg-[#00000061] p-2 rounded mb-4'>
              <label className='block text-sm font-medium mb-1'>
                Rule Title<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                name='ruleTitle'
                value={formData.ruleTitle}
                onChange={handleChange}
                placeholder='Enter rule title'
                maxLength={100}
                className='w-full bg-transparent outline-none'
                required
              />
              <p className='text-xs text-gray-400 mt-1'>
                {formData.ruleTitle.length}/100 chars
              </p>
              {errors.ruleTitle && (
                <p className='text-red-500 text-xs mt-1'>{errors.ruleTitle}</p>
              )}
            </div>

            {/* Rule Description */}
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Rule Description<span className='text-red-500'>*</span>
              </label>
              <textarea
                name='ruleDescription'
                value={formData.ruleDescription}
                onChange={handleChange}
                placeholder='Enter detailed rule description'
                className='w-full bg-transparent outline-none min-h-[150px]'
                maxLength={2000}
                required
              />
              <p className='text-xs text-gray-400 mt-1'>
                {formData.ruleDescription.length}/2000 chars
              </p>
              {errors.ruleDescription && (
                <p className='text-red-500 text-xs mt-1'>
                  {errors.ruleDescription}
                </p>
              )}
            </div>
          </div>

          {/* Media Section */}
          <div className='mb-6'>
            <h2 className='text-lg font-semibold mb-3'>Additional Resources</h2>

            {/* Upload PDF */}
            <div className='bg-[#00000061] p-2 rounded mb-4'>
              <label className='block text-sm font-medium mb-1'>
                Upload PDF (Optional)
              </label>
              <input
                type='file'
                name='uploadPDF'
                onChange={handleChange}
                accept='.pdf'
                className='w-full bg-transparent outline-none'
              />
              <p className='text-xs text-gray-400 mt-1'>
                Only PDF files are allowed
              </p>
              {errors.uploadPDF && (
                <p className='text-red-500 text-xs mt-1'>{errors.uploadPDF}</p>
              )}
            </div>

            {/* Video Link */}
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Video Link (Optional)
              </label>
              <input
                type='url'
                name='videoLink'
                value={formData.videoLink}
                onChange={handleChange}
                placeholder='Paste YouTube or Vimeo URL'
                className='w-full bg-transparent outline-none'
              />
              <p className='text-xs text-gray-400 mt-1'>
                Only YouTube and Vimeo links are supported
              </p>
              {errors.videoLink && (
                <p className='text-red-500 text-xs mt-1'>{errors.videoLink}</p>
              )}
            </div>
          </div>

          {/* Display Settings Section */}
          <div className='mb-6'>
            <h2 className='text-lg font-semibold mb-3'>Display Settings</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Sort Order */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  Sort Order<span className='text-red-500'>*</span>
                </label>
                <input
                  type='number'
                  name='sortOrder'
                  value={formData.sortOrder}
                  onChange={handleChange}
                  placeholder='1'
                  min='0'
                  className='w-full bg-transparent outline-none'
                  required
                />
                <p className='text-xs text-gray-400 mt-1'>
                  Controls display order within category and sub-tab
                </p>
                {errors.sortOrder && (
                  <p className='text-red-500 text-xs mt-1'>
                    {errors.sortOrder}
                  </p>
                )}
              </div>

              {/* Status */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  Status<span className='text-red-500'>*</span>
                </label>
                <select
                  name='status'
                  value={formData.status}
                  onChange={handleChange}
                  className='w-full bg-transparent outline-none'
                  required
                >
                  <option value='Active' className='text-black'>
                    Active
                  </option>
                  <option value='Inactive' className='text-black'>
                    Inactive
                  </option>
                </select>
                <p className='text-xs text-gray-400 mt-1'>
                  Enables or disables rule display on homepage
                </p>
                {errors.status && (
                  <p className='text-red-500 text-xs mt-1'>{errors.status}</p>
                )}
              </div>
            </div>
          </div>

          {/* Admin Controls */}
          <div className='flex justify-center gap-4 mt-8'>
            <button
              type='submit'
              className='bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded transition duration-200'
            >
              Save Rule
            </button>
            <button
              type='button'
              onClick={handleCancel}
              className='bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded transition duration-200'
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
