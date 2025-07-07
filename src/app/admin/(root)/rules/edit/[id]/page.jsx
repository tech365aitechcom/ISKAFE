'use client'
import React, { use, useEffect, useState } from 'react'
import axios from 'axios'
import Loader from '../../../../../_components/Loader'
import { API_BASE_URL, apiConstants } from '../../../../../../constants'
import Link from 'next/link'
import { enqueueSnackbar } from 'notistack'
import { uploadToS3 } from '../../../../../../utils/uploadToS3'

export default function EditRulePage({ params }) {
  const { id } = use(params)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    subTab: '',
    subTabRuleDescription: '',
    ruleTitle: '',
    ruleDescription: '',
    rule: null,
    videoLink: '',
    sortOrder: '',
    status: '',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    const fetchRuleDetails = async () => {
      setLoading(true)
      try {
        const res = await axios.get(`${API_BASE_URL}/rules/${id}`)
        const data = res.data.data
        setFormData({
          category: data.category || '',
          subTab: data.subTab || '',
          subTabRuleDescription: data.subTabRuleDescription || '',
          ruleTitle: data.ruleTitle || '',
          ruleDescription: data.ruleDescription || '',
          rule: data.rule || null,
          videoLink: data.videoLink || '',
          sortOrder: data.sortOrder || '',
          status: data.status || '',
        })
      } catch (err) {
        enqueueSnackbar(err?.response?.data?.message || 'Error fetching rule', {
          variant: 'error',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchRuleDetails()
  }, [id])

  const validateField = (name, value) => {
    // Handle null/undefined values first
    if (value == null) {
      if (
        name === 'category' ||
        name === 'subTab' ||
        name === 'ruleTitle' ||
        name === 'ruleDescription' ||
        name === 'subTabRuleDescription' ||
        name === 'sortOrder' ||
        name === 'status'
      ) {
        return `${name} is required`
      }
      return ''
    }

    switch (name) {
      case 'category':
      case 'subTab':
      case 'ruleTitle':
      case 'status':
        const strValue = String(value).trim()
        return strValue === '' ? `${name} is required` : ''

      case 'subTabRuleDescription':
        const descValue = String(value).trim()
        return descValue === ''
          ? 'Sub-tab rule description is required'
          : descValue.length > 1500
          ? 'Maximum 1500 characters allowed'
          : ''

      case 'ruleDescription':
        const ruleDescValue = String(value).trim()
        return ruleDescValue === ''
          ? 'Rule description is required'
          : ruleDescValue.length > 2000
          ? 'Maximum 2000 characters allowed'
          : ''

      case 'rule':
        if (value) {
          // Handle both File object and string URL cases
          if (value instanceof File) {
            return !value.name?.endsWith('.pdf')
              ? 'Only PDF files are allowed'
              : ''
          } else if (typeof value === 'string') {
            return !value.endsWith('.pdf') ? 'Invalid PDF URL' : ''
          }
        }
        return ''

      case 'videoLink':
        if (typeof value === 'string' && value.trim() !== '') {
          const isValid =
            value.includes('youtube.com') ||
            value.includes('youtu.be') ||
            value.includes('vimeo.com')
          return isValid ? '' : 'Only YouTube or Vimeo links are allowed'
        }
        return ''

      case 'sortOrder':
        const numValue = Number(value)
        return isNaN(numValue) || numValue < 0
          ? 'Enter a valid positive number'
          : ''

      default:
        return ''
    }
  }

  const handleChange = (e) => {
    const { name, value, type, files } = e.target
    const newValue = type === 'file' ? files[0] || null : value

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }))

    if (
      [
        'category',
        'subTab',
        'subTabRuleDescription',
        'ruleTitle',
        'ruleDescription',
        'sortOrder',
        'status',
        'rule',
        'videoLink',
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

    Object.keys(formData).forEach((field) => {
      if (
        [
          'category',
          'subTab',
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

    if (formData.rule) {
      const ruleErr = validateField('rule', formData.rule)
      if (ruleErr) {
        newErrors.rule = ruleErr
        isValid = false
      }
    }

    if (formData.videoLink) {
      const linkErr = validateField('videoLink', formData.videoLink)
      if (linkErr) {
        newErrors.videoLink = linkErr
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (!validateForm()) {
        enqueueSnackbar('Please fix the errors in the form', {
          variant: 'error',
        })
        return
      }

      let ruleUrl = formData.rule
      // Only upload new file if it's a File object (not a string URL)
      if (formData.rule instanceof File) {
        if (!formData.rule.name?.endsWith('.pdf')) {
          enqueueSnackbar('Only PDF files are allowed', { variant: 'error' })
          return
        }
        ruleUrl = await uploadToS3(formData.rule)
      }

      const payload = {
        category: formData.category,
        subTab: formData.subTab,
        subTabRuleDescription: formData.subTabRuleDescription,
        ruleTitle: formData.ruleTitle,
        ruleDescription: formData.ruleDescription,
        rule: ruleUrl || null, // Ensure rule is null if no file is uploaded
        videoLink: formData.videoLink,
        sortOrder: formData.sortOrder,
        status: formData.status,
      }

      const res = await axios.put(`${API_BASE_URL}/rules/${id}`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (res.status === 200) {
        enqueueSnackbar('Rule updated successfully', {
          variant: 'success',
        })
        // Optionally redirect after success
        // router.push('/admin/rules')
      } else {
        throw new Error(res.data.message || 'Failed to update rule')
      }
    } catch (err) {
      console.error('Update error:', err)
      enqueueSnackbar(
        err?.response?.data?.message || err.message || 'Failed to update rule',
        { variant: 'error' }
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Loader />

  return (
    <div className='text-white p-8 flex justify-center relative overflow-hidden'>
      <div
        className='absolute -left-10 top-1/2 transform -translate-y-1/2 w-60 h-96 rounded-full opacity-70 blur-xl'
        style={{
          background:
            'linear-gradient(317.9deg, #6F113E 13.43%, rgba(111, 17, 62, 0) 93.61%)',
        }}
      ></div>
      <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
        <div className='flex items-center gap-4 mb-6'>
          <Link href='/admin/rules'>
            <button className='mr-2 text-white'>
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
          </Link>
          <h1 className='text-2xl font-bold'>Rule Editor</h1>
        </div>
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
                    name='category'
                    value={formData.category}
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
                {errors.category && (
                  <p className='text-red-500 text-xs mt-1'>{errors.category}</p>
                )}
              </div>

              {/* Sub-Tab Name */}
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-sm font-medium mb-1'>
                  Sub-Tab Name<span className='text-red-500'>*</span>
                </label>
                <div className='flex space-x-2'>
                  <select
                    name='subTab'
                    value={formData.subTab}
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
                {errors.subTab && (
                  <p className='text-red-500 text-xs mt-1'>{errors.subTab}</p>
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
                name='rule'
                onChange={handleChange}
                accept='.pdf'
                className='w-full bg-transparent outline-none'
              />
              <p className='text-xs text-gray-400 mt-1'>
                Only PDF files are allowed
              </p>
              {errors.rule && (
                <p className='text-red-500 text-xs mt-1'>{errors.rule}</p>
              )}
            </div>

            {/* PDF Preview */}
            {formData.rule && typeof formData.rule === 'string' && (
              <div className='my-4'>
                <h4 className='text-sm text-gray-300 my-4'>Uploaded PDF :</h4>
                <div className='flex items-center justify-between p-2 border border-gray-700 rounded'>
                  <a
                    href={formData.rule}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-400 underline break-all'
                  >
                    {formData.rule}
                  </a>
                  <button
                    type='button'
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        rule: null,
                      }))
                    }
                    className='text-red-400 text-sm hover:text-red-300 ml-4'
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}

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
            <Link href={`/admin/rules`}>
              <button
                type='button'
                className='bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded transition duration-200'
              >
                Cancel
              </button>
            </Link>{' '}
            <button
              type='submit'
              className='bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded transition duration-200'
              disabled={submitting}
            >
              {submitting ? 'Updating...' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
