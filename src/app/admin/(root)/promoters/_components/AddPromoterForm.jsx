'use client'
import { Trash } from 'lucide-react'
import React, { useState } from 'react'

export const AddPromoterForm = ({ setShowAddPromoterForm }) => {
  const [formData, setFormData] = useState({
    // Profile Info
    profilePic: null,
    promoterName: '',
    abbreviations: '',
    websiteURL: '',
    aboutUs: '',

    // Contact Info
    contactPersonName: '',
    mobileNumber: '',
    alternateMobileNumber: '',
    emailAddress: '',

    // Compliance
    sanctioningBody: '',

    // Documents
    licenseCertificate: null,

    // Address Info
    street1: '',
    street2: '',
    country: 'United States',
    state: '',
    city: '',
    zipCode: '',

    // Access
    accountStatus: 'Active',
    username: '',
    password: '',
    confirmPassword: '',
    assignRole: 'Promoter',
    internalNotes: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0]
    if (file) {
      const previewURL = URL.createObjectURL(file)
      setFormData((prevState) => ({
        ...prevState,
        [fieldName]: previewURL,
      }))
    }
  }

  const validateForm = () => {
    // Validation logic would go here
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      console.log('Form submitted:', formData)
      // Submit logic here
    }
  }

  return (
    <div className='min-h-screen text-white bg-dark-blue-900'>
      <div className='w-full'>
        {/* Header with back button */}
        <div className='flex items-center gap-4 mb-6'>
          <button
            className='text-white'
            onClick={() => setShowAddPromoterForm(false)}
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
          <h1 className='text-xl font-medium'>Add New Promoter</h1>
        </div>

        <form onSubmit={handleSubmit}>
          {/* PROFILE INFO Section */}
          <div className='mb-8'>
            <h2 className='text-sm font-bold mb-4'>PROFILE INFO</h2>

            {/* Image Upload */}
            <div className='mb-6'>
              <label className='block text-xs font-medium mb-1'>
                Upload Image (jpg/png)
                <span className='text-gray-400'> - Optional</span>
              </label>
              {formData.profilePic ? (
                <div className='relative w-72 h-52 rounded-lg overflow-hidden border border-[#D9E2F930]'>
                  <img
                    src={formData.profilePic}
                    alt='Selected image'
                    className='w-full h-full object-cover'
                  />
                  <button
                    type='button'
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, profilePic: null }))
                    }
                    className='absolute top-2 right-2 bg-[#14255D] p-1 rounded text-[#AEB9E1] shadow-md z-20'
                  >
                    <Trash className='w-4 h-4' />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor='profile-pic-upload'
                  className='cursor-pointer border-2 border-dashed border-gray-500 rounded-lg flex flex-col items-center justify-center w-72 h-52 relative overflow-hidden'
                >
                  <input
                    id='profile-pic-upload'
                    type='file'
                    accept='image/*'
                    onChange={(e) => handleFileChange(e, 'profilePic')}
                    className='absolute inset-0 opacity-0 cursor-pointer z-50'
                  />

                  <div className='bg-yellow-500 opacity-50 rounded-full p-2 mb-2 z-10'>
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
                        d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                      />
                    </svg>
                  </div>
                  <p className='text-sm text-center text-[#AEB9E1] z-10'>
                    <span className='text-[#FEF200] mr-1'>Click to upload</span>
                    or drag and drop profile pic
                    <br />
                    <span className='text-xs'>Max 5 MB, image only</span>
                  </p>
                </label>
              )}
              <p className='text-xs text-gray-400 mt-1'>
                Logo or profile image for promoter
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
              {/* Promoter Name Field */}
              <div className='bg-[#00000061] p-2 h-16 rounded'>
                <label className='block text-xs font-medium mb-1'>
                  Promoter Name<span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='promoterName'
                  value={formData.promoterName}
                  onChange={handleChange}
                  placeholder='Enter Promoter Name'
                  className='w-full bg-transparent outline-none'
                  required
                />
              </div>

              {/* Abbreviations Field */}
              <div className='bg-[#00000061] p-2 h-16 rounded'>
                <label className='block text-xs font-medium mb-1'>
                  Abbreviations<span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='abbreviations'
                  value={formData.abbreviations}
                  onChange={handleChange}
                  placeholder='e.g. IKF'
                  className='w-full bg-transparent outline-none'
                  maxLength={10}
                  required
                />
              </div>

              {/* Website URL Field */}
              <div className='bg-[#00000061] p-2 h-16 rounded'>
                <label className='block text-xs font-medium mb-1'>
                  Website URL<span className='text-red-500'>*</span>
                </label>
                <input
                  type='url'
                  name='websiteURL'
                  value={formData.websiteURL}
                  onChange={handleChange}
                  placeholder='https://www.example.com'
                  className='w-full bg-transparent outline-none'
                  required
                />
              </div>
            </div>

            {/* About Us Field */}
            <div className='bg-[#00000061] p-2 rounded mb-2'>
              <label className='block text-xs font-medium mb-1'>
                About Us<span className='text-gray-400'> - Optional</span>
              </label>
              <textarea
                name='aboutUs'
                value={formData.aboutUs}
                onChange={handleChange}
                placeholder='Describe the promoter...'
                rows='3'
                className='w-full bg-transparent outline-none resize-none'
                maxLength={500}
              />
            </div>

            {/* URL Note */}
            <div className='mb-4'>
              <p className='text-xs text-gray-400'>
                Note: You MUST enter the full URL including the http or https
                prefix. E.g. 'https://example.com', not just 'example.com'
              </p>
            </div>
          </div>

          {/* CONTACT INFO Section */}
          <div className='mb-8'>
            <h2 className='text-sm font-bold mb-4'>CONTACT INFO</h2>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
              {/* Contact Person Name Field */}
              <div className='bg-[#00000061] p-2 h-16 rounded'>
                <label className='block text-xs font-medium mb-1'>
                  Contact Person Name<span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='contactPersonName'
                  value={formData.contactPersonName}
                  onChange={handleChange}
                  placeholder='John Doe'
                  className='w-full bg-transparent outline-none'
                  required
                />
              </div>

              {/* Mobile Number Field */}
              <div className='bg-[#00000061] p-2 h-16 rounded'>
                <label className='block text-xs font-medium mb-1'>
                  Mobile Number<span className='text-red-500'>*</span>
                </label>
                <input
                  type='tel'
                  name='mobileNumber'
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder='+1-555-123456'
                  className='w-full bg-transparent outline-none'
                  required
                />
              </div>

              {/* Alternate Mobile Number Field */}
              <div className='bg-[#00000061] p-2 h-16 rounded'>
                <label className='block text-xs font-medium mb-1'>
                  Alternate Mobile Number
                  <span className='text-gray-400'> - Optional</span>
                </label>
                <input
                  type='tel'
                  name='alternateMobileNumber'
                  value={formData.alternateMobileNumber}
                  onChange={handleChange}
                  placeholder='+1-555-000000'
                  className='w-full bg-transparent outline-none'
                />
              </div>
            </div>

            {/* Email Address Field */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
              <div className='bg-[#00000061] p-2 h-16 rounded'>
                <label className='block text-xs font-medium mb-1'>
                  Email Address<span className='text-red-500'>*</span>
                </label>
                <input
                  type='email'
                  name='emailAddress'
                  value={formData.emailAddress}
                  onChange={handleChange}
                  placeholder='promoter@event.com'
                  className='w-full bg-transparent outline-none'
                  required
                />
              </div>
            </div>
          </div>

          {/* COMPLIANCE Section */}
          <div className='mb-8'>
            <h2 className='text-sm font-bold mb-4'>COMPLIANCE</h2>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
              {/* Sanctioning Body Field */}
              <div className='bg-[#00000061] p-2 h-16 rounded'>
                <label className='block text-xs font-medium mb-1'>
                  Sanctioning Body<span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <select
                    name='sanctioningBody'
                    value={formData.sanctioningBody}
                    onChange={handleChange}
                    className='w-full bg-transparent outline-none appearance-none'
                    required
                  >
                    <option value='' disabled className='text-black'>
                      Select sanctioning body
                    </option>
                    <option value='IKF' className='text-black'>
                      IKF
                    </option>
                    <option value='WBC' className='text-black'>
                      WBC
                    </option>
                    <option value='USA Boxing' className='text-black'>
                      USA Boxing
                    </option>
                  </select>
                  <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white'>
                    <svg
                      className='fill-current h-4 w-4'
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DOCUMENTS Section */}
          <div className='mb-8'>
            <h2 className='text-sm font-bold mb-4'>DOCUMENTS</h2>

            <div className='mb-6'>
              <label className='block text-xs font-medium mb-1'>
                Upload License/Certificate (.pdf/.jpg/.png)
                <span className='text-red-500'>*</span>
              </label>
              {formData.licenseCertificate ? (
                <div className='relative w-72 h-24 rounded-lg overflow-hidden border border-[#D9E2F930] flex items-center justify-center'>
                  <div className='text-center'>
                    <p>Document uploaded</p>
                    <p className='text-xs text-gray-400'>Click to change</p>
                  </div>
                  <button
                    type='button'
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        licenseCertificate: null,
                      }))
                    }
                    className='absolute top-2 right-2 bg-[#14255D] p-1 rounded text-[#AEB9E1] shadow-md z-20'
                  >
                    <Trash className='w-4 h-4' />
                  </button>
                  <input
                    type='file'
                    accept='.pdf,.jpg,.jpeg,.png'
                    onChange={(e) => handleFileChange(e, 'licenseCertificate')}
                    className='absolute inset-0 opacity-0 cursor-pointer z-50'
                  />
                </div>
              ) : (
                <label
                  htmlFor='license-cert-upload'
                  className='cursor-pointer border-2 border-dashed border-gray-500 rounded-lg flex flex-col items-center justify-center w-72 h-24 relative overflow-hidden'
                >
                  <input
                    id='license-cert-upload'
                    type='file'
                    accept='.pdf,.jpg,.jpeg,.png'
                    onChange={(e) => handleFileChange(e, 'licenseCertificate')}
                    className='absolute inset-0 opacity-0 cursor-pointer z-50'
                    required
                  />

                  <div className='bg-yellow-500 opacity-50 rounded-full p-2 mb-2 z-10'>
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
                        d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                      />
                    </svg>
                  </div>
                  <p className='text-sm text-center text-[#AEB9E1] z-10'>
                    <span className='text-[#FEF200] mr-1'>
                      Upload certification
                    </span>
                    <br />
                    <span className='text-xs'>
                      Max 10 MB, document or image
                    </span>
                  </p>
                </label>
              )}
              <p className='text-xs text-gray-400 mt-1'>
                Proof of licensing or eligibility
              </p>
            </div>
          </div>

          {/* ADDRESS INFO Section */}
          <div className='mb-8'>
            <h2 className='text-sm font-bold mb-4'>ADDRESS INFO</h2>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
              {/* Street 1 Field */}
              <div className='bg-[#00000061] p-2 h-16 rounded'>
                <label className='block text-xs font-medium mb-1'>
                  Street 1<span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='street1'
                  value={formData.street1}
                  onChange={handleChange}
                  placeholder='123 Combat Arena Road'
                  className='w-full bg-transparent outline-none'
                  required
                />
              </div>

              {/* Street 2 Field */}
              <div className='bg-[#00000061] p-2 h-16 rounded'>
                <label className='block text-xs font-medium mb-1'>
                  Street 2<span className='text-gray-400'> - Optional</span>
                </label>
                <input
                  type='text'
                  name='street2'
                  value={formData.street2}
                  onChange={handleChange}
                  placeholder='Suite 400'
                  className='w-full bg-transparent outline-none'
                />
              </div>

              {/* Country Field */}
              <div className='bg-[#00000061] p-2 h-16 rounded'>
                <label className='block text-xs font-medium mb-1'>
                  Country<span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <select
                    name='country'
                    value={formData.country}
                    onChange={handleChange}
                    className='w-full bg-transparent outline-none appearance-none'
                    required
                  >
                    <option value='United States' className='text-black'>
                      United States
                    </option>
                    <option value='Canada' className='text-black'>
                      Canada
                    </option>
                    <option value='UK' className='text-black'>
                      UK
                    </option>
                  </select>
                  <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white'>
                    <svg
                      className='fill-current h-4 w-4'
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
              {/* State Field */}
              <div className='bg-[#00000061] p-2 h-16 rounded'>
                <label className='block text-xs font-medium mb-1'>
                  State<span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <select
                    name='state'
                    value={formData.state}
                    onChange={handleChange}
                    className='w-full bg-transparent outline-none appearance-none'
                    required
                  >
                    <option value='' disabled className='text-black'>
                      Select state
                    </option>
                    <option value='California' className='text-black'>
                      California
                    </option>
                    <option value='New York' className='text-black'>
                      New York
                    </option>
                    <option value='Texas' className='text-black'>
                      Texas
                    </option>
                  </select>
                  <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white'>
                    <svg
                      className='fill-current h-4 w-4'
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* City Field */}
              <div className='bg-[#00000061] p-2 h-16 rounded'>
                <label className='block text-xs font-medium mb-1'>
                  City<span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='city'
                  value={formData.city}
                  onChange={handleChange}
                  placeholder='Los Angeles'
                  className='w-full bg-transparent outline-none'
                  required
                />
              </div>

              {/* ZIP/Postal Code Field */}
              <div className='bg-[#00000061] p-2 h-16 rounded'>
                <label className='block text-xs font-medium mb-1'>
                  ZIP/Postal Code<span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='zipCode'
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder='90001'
                  className='w-full bg-transparent outline-none'
                  pattern='[0-9]{5}'
                  required
                />
              </div>
            </div>
          </div>

          {/* ADMIN ACCESS Section */}
          <div className='mb-8'>
            <h2 className='text-sm font-bold mb-4'>ADMIN ACCESS</h2>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
              {/* Account Status Field */}
              <div className='bg-[#00000061] p-2 h-16 rounded'>
                <label className='block text-xs font-medium mb-1'>
                  Account Status<span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <select
                    name='accountStatus'
                    value={formData.accountStatus}
                    onChange={handleChange}
                    className='w-full bg-transparent outline-none appearance-none'
                    required
                  >
                    <option value='Active' className='text-black'>
                      Active
                    </option>
                    <option value='Suspended' className='text-black'>
                      Suspended
                    </option>
                  </select>
                  <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white'>
                    <svg
                      className='fill-current h-4 w-4'
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Username Field */}
              <div className='bg-[#00000061] p-2 h-16 rounded'>
                <label className='block text-xs font-medium mb-1'>
                  Username<span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  name='username'
                  value={formData.username}
                  onChange={handleChange}
                  placeholder='promoter_admin'
                  className='w-full bg-transparent outline-none'
                  required
                />
              </div>

              {/* Assign Role Field */}
              <div className='bg-[#00000061] p-2 h-16 rounded'>
                <label className='block text-xs font-medium mb-1'>
                  Assign Role<span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <select
                    name='assignRole'
                    value={formData.assignRole}
                    onChange={handleChange}
                    className='w-full bg-transparent outline-none appearance-none'
                    required
                  >
                    <option value='Promoter' className='text-black'>
                      Promoter
                    </option>
                    <option value='Viewer' className='text-black'>
                      Viewer
                    </option>
                    <option value='Admin' className='text-black'>
                      Admin
                    </option>
                  </select>
                  <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white'>
                    <svg
                      className='fill-current h-4 w-4'
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z' />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
              {/* Password Field */}
              <div className='bg-[#00000061] p-2 h-16 rounded'>
                <label className='block text-xs font-medium mb-1'>
                  Password<span className='text-red-500'>*</span>
                </label>
                <input
                  type='password'
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  placeholder='********'
                  className='w-full bg-transparent outline-none'
                  minLength={8}
                  required
                />
              </div>

              {/* Confirm Password Field */}
              <div className='bg-[#00000061] p-2 h-16 rounded'>
                <label className='block text-xs font-medium mb-1'>
                  Confirm Password<span className='text-red-500'>*</span>
                </label>
                <input
                  type='password'
                  name='confirmPassword'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder='********'
                  className='w-full bg-transparent outline-none'
                  minLength={8}
                  required
                />
              </div>
            </div>

            {/* Internal Notes Field */}
            <div className='bg-[#00000061] p-2 rounded mb-4'>
              <label className='block text-xs font-medium mb-1'>
                Internal Notes<span className='text-gray-400'> - Optional</span>
              </label>
              <textarea
                name='internalNotes'
                value={formData.internalNotes}
                onChange={handleChange}
                placeholder='Admin-only remarks'
                rows='3'
                className='w-full bg-transparent outline-none resize-none'
                maxLength={300}
              />
            </div>
          </div>

          {/* Form Controls */}
          <div className='flex justify-center gap-4 mb-8'>
            <button
              type='button'
              onClick={() => setShowAddPromoterForm(false)}
              className='bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded transition duration-200'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='text-white font-medium py-2 px-6 rounded transition duration-200'
              style={{
                background:
                  'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
              }}
            >
              Save Promoter
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
