import React, { useState } from 'react'
import { ChevronLeft, Upload, Calendar, Trash } from 'lucide-react'

const FighterDetails = ({ fighter, onBack, onUpdate, onRemove }) => {
  const [fighterData, setFighterData] = useState(fighter)

  const handleInputChange = (field, value) => {
    setFighterData((prev) => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const previewURL = URL.createObjectURL(file)
      setFighterData((prevState) => ({
        ...prevState,
        image: previewURL,
      }))
    }
  }

  return (
    <div className='min-h-screen text-white p-6 bg-[#0B1739] m-8 rounded'>
      {/* Header with back button */}
      <div className='flex items-center gap-4 mb-6'>
        <button className='mr-2 text-white' onClick={onBack}>
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
        <h1 className='text-2xl font-bold'>Fighter Details</h1>
      </div>
      <form className='px-4'>
        <div className='mb-8'>
          {fighterData.image ? (
            <div className='relative w-72 h-52 rounded-lg overflow-hidden border border-[#D9E2F930]'>
              <img
                src={fighterData.image}
                alt='Selected image'
                className='w-full h-full object-cover'
              />
              <button
                type='button'
                onClick={() =>
                  setFighterData((prev) => ({ ...prev, image: null }))
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
                onChange={handleFileChange}
                className='absolute inset-0 opacity-0 z-50'
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
                SVG, PNG, JPG or GIF (max. 800 x 400px)
              </p>
            </label>
          )}
        </div>
        <div className='mb-6'>
          <h2 className='text-sm font-medium mb-4 text-gray-300'>
            PERSONAL DETAILS
          </h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-4'>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-xs text-gray-400 mb-1'>
                First Name<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={fighterData.firstName || ''}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className='w-full text-white'
              />
            </div>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-xs text-gray-400 mb-1'>
                Last Name<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={fighterData.lastName || ''}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className='w-full  text-white'
              />
            </div>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-xs text-gray-400 mb-1'>
                Gender<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={fighterData.gender || ''}
                onChange={(e) => handleInputChange('gender', e.target.value)}
                className='w-full  text-white'
              />
            </div>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-xs text-gray-400 mb-1'>
                Age<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={fighterData.age || ''}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className='w-full  text-white'
              />
            </div>
          </div>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-xs text-gray-400 mb-1'>
                Age<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={fighterData.age || ''}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className='w-full  text-white'
              />
            </div>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-xs text-gray-400 mb-1'>
                Weight<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={fighterData.weight || ''}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                className='w-full  text-white'
              />
            </div>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-xs text-gray-400 mb-1'>
                Height<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={fighterData.height || ''}
                onChange={(e) => handleInputChange('height', e.target.value)}
                className='w-full  text-white'
              />
            </div>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-xs text-gray-400 mb-1'>
                Experience<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={fighterData.experience || ''}
                onChange={(e) =>
                  handleInputChange('experience', e.target.value)
                }
                className='w-full  text-white'
              />
            </div>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-xs text-gray-400 mb-1'>
                Training<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={fighterData.training || ''}
                onChange={(e) => handleInputChange('training', e.target.value)}
                className='w-full  text-white'
              />
            </div>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-xs text-gray-400 mb-1'>
                Gym<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={fighterData.gym || ''}
                onChange={(e) => handleInputChange('gym', e.target.value)}
                className='w-full  text-white'
              />
            </div>
          </div>
        </div>
        <div className='mb-6'>
          <h2 className='text-sm font-medium mb-4 text-gray-300'>
            TRAINING DETAILS
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-xs text-gray-400 mb-1'>
                Fighter Physical Renewal Date
                <span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='DD/MM/YYYY'
                  value={fighterData.physicalExamDate || ''}
                  onChange={(e) =>
                    handleInputChange('physicalExamDate', e.target.value)
                  }
                  className='w-full text-white pr-8'
                />
                <Calendar
                  size={16}
                  className='absolute right-2 top-3 text-gray-400'
                />
              </div>
            </div>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-xs text-gray-400 mb-1'>
                Fighter License Renewal Date
                <span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='DD/MM/YYYY'
                  value={fighterData.fighterLicenseRenewalDate || ''}
                  onChange={(e) =>
                    handleInputChange(
                      'fighterLicenseRenewalDate',
                      e.target.value
                    )
                  }
                  className='w-full rounded text-white pr-8'
                />
                <Calendar
                  size={16}
                  className='absolute right-2 top-3 text-gray-400'
                />
              </div>
            </div>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-xs text-gray-400 mb-1'>
                Hotel Confirmation<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={fighterData.hotelConfirmation || ''}
                onChange={(e) =>
                  handleInputChange('hotelConfirmation', e.target.value)
                }
                className='w-full rounded text-white'
              />
            </div>
            <div className='bg-[#00000061] p-2 rounded'>
              <label className='block text-xs text-gray-400 mb-1'>
                Suspension<span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={fighterData.suspended || ''}
                onChange={(e) => handleInputChange('suspended', e.target.value)}
                className='w-full  text-white'
              />
            </div>
          </div>
        </div>
        <div className='mb-6'>
          <h2 className='text-sm font-medium mb-4 text-gray-300'>
            PAYMENT DETAILS
          </h2>
          <div className='flex items-center mb-2'>
            <input
              type='checkbox'
              checked={fighterData.paymentsCompleted || false}
              onChange={(e) =>
                handleInputChange('paymentsCompleted', e.target.checked)
              }
              className='h-4 w-4 text-blue-600 rounded'
            />
            <label className='ml-2 text-sm'>All Required Payments Made</label>
          </div>
        </div>
        <div className='mb-6'>
          <h2 className='text-sm font-medium mb-4 text-gray-300'>
            MEDICAL DETAILS
          </h2>
          <div className='flex items-center mb-2'>
            <input
              type='checkbox'
              checked={fighterData.examDone || false}
              onChange={(e) => handleInputChange('examDone', e.target.checked)}
              className='h-4 w-4 text-blue-600 rounded'
            />
            <label className='ml-2 text-sm'>Exam Done</label>
          </div>
        </div>
        <div className='mb-6 bg-[#00000061] rounded p-2'>
          <label className='block text-xs text-gray-400 mb-1'>Comments</label>
          <textarea
            value={fighterData.comments || ''}
            onChange={(e) => handleInputChange('comments', e.target.value)}
            className='w-full rounded text-white h-20'
          />
        </div>
        <div className='flex justify-center gap-8 py-8'>
          <button
            onClick={() => onRemove(fighterData)}
            className='bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded'
          >
            Remove
          </button>
          <button
            onClick={() => onUpdate(fighterData)}
            className='bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded'
          >
            Update
          </button>
        </div>
      </form>
    </div>
  )
}

export default FighterDetails
