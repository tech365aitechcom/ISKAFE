'use client'
import axios from 'axios'
import { API_BASE_URL, apiConstants } from '../../../../../constants/index'
import { Trash } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import useUserStore from '../../../../../stores/userStore'
import { enqueueSnackbar } from 'notistack'

export const AboutForm = () => {
  const user = useUserStore((state) => state.user)
  const [formData, setFormData] = useState({
    pageTitle: '',
    missionStatement: '',
    organizationHistory: '',
    leadershipTeam: [],
    coverImage: null,
    contactURL: '',
    facebookURL: '',
    instagramURL: '',
    twitterURL: '',
    // New footer legal document fields
    termsConditionsPDF: null,
    privacyPolicyPDF: null,
    copyrightNoticePDF: null,
    platformVersion: '',
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentTeamMember, setCurrentTeamMember] = useState({
    name: '',
    position: '',
    photo: null,
  })
  const [teamMemberImagePreview, setTeamMemberImagePreview] = useState(null)
  const [showTeamMemberModal, setShowTeamMemberModal] = useState(false)

  // File previews for legal documents
  const [termsAndConditionsFileName, setTermsAndConditionsFileName] =
    useState(null)
  const [privacyPolicyFileName, setPrivacyPolicyFileName] = useState(null)
  const [copyrightNoticeFileName, setCopyrightNoticeFileName] = useState(null)

  const fetchAboutData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/about/find`)
      console.log('Response:', response.data)
      if (response.data.data) {
        setFormData(response.data.data)
        if (response.data.data.coverImage) {
          setImagePreview(response.data.data?.coverImage)
        }

        // Set filenames for legal documents if they exist
        if (response.data.data.termsConditionsPDF) {
          setTermsAndConditionsFileName(
            response.data.data.termsConditionsPDF.split('/').pop()
          )
        }
        if (response.data.data.privacyPolicyPDF) {
          setPrivacyPolicyFileName(
            response.data.data.privacyPolicyPDF.split('/').pop()
          )
        }
        if (response.data.data.copyrightNoticePDF) {
          setCopyrightNoticeFileName(
            response.data.data.copyrightNoticePDF.split('/').pop()
          )
        }
      }
    } catch (error) {
      console.log('Error fetching about data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAboutData()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTeamMemberChange = (e) => {
    const { name, value } = e.target
    setCurrentTeamMember((prev) => ({ ...prev, [name]: value }))
  }

  const handleTeamMemberImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setTeamMemberImagePreview(URL.createObjectURL(file))
      setCurrentTeamMember((prev) => ({ ...prev, photo: file }))
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImagePreview(URL.createObjectURL(file))
      setFormData((prev) => ({ ...prev, coverImage: file }))
    }
  }

  // Handle legal document file uploads
  const handleLegalDocUpload = (e, fieldName) => {
    const file = e.target.files[0]
    if (file) {
      if (fieldName === 'termsConditionsPDF') {
        setTermsAndConditionsFileName(file.name)
      } else if (fieldName === 'privacyPolicyPDF') {
        setPrivacyPolicyFileName(file.name)
      } else if (fieldName === 'copyrightNoticePDF') {
        setCopyrightNoticeFileName(file.name)
      }
      setFormData((prev) => ({ ...prev, [fieldName]: file }))
    }
  }

  // Remove legal document files
  const handleRemoveLegalDoc = (fieldName) => {
    if (fieldName === 'termsConditionsPDF') {
      setTermsAndConditionsFileName(null)
    } else if (fieldName === 'privacyPolicyPDF') {
      setPrivacyPolicyFileName(null)
    } else if (fieldName === 'copyrightNoticePDF') {
      setCopyrightNoticeFileName(null)
    }
    setFormData((prev) => ({ ...prev, [fieldName]: null }))
  }

  const handleAddTeamMember = () => {
    if (currentTeamMember.name && currentTeamMember.position) {
      setFormData((prev) => ({
        ...prev,
        leadershipTeam: [...prev.leadershipTeam, currentTeamMember],
      }))
      setCurrentTeamMember({
        name: '',
        position: '',
        photo: null,
      })
      setTeamMemberImagePreview(null)
      setShowTeamMemberModal(false)
    } else {
      enqueueSnackbar('Name and position are required for team members', {
        variant: 'error',
      })
    }
  }

  const handleRemoveTeamMember = (index) => {
    setFormData((prev) => ({
      ...prev,
      leadershipTeam: prev.leadershipTeam.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e) => {
    try {
      e.preventDefault()

      // Validate mandatory fields
      if (
        !formData.pageTitle ||
        !formData.missionStatement ||
        !formData.organizationHistory
      ) {
        enqueueSnackbar('Please fill all mandatory fields', {
          variant: 'error',
        })
        return
      }

      // Validate contact link
      if (formData.contactURL && !isValidURL(formData.contactURL)) {
        enqueueSnackbar('Please enter a valid URL for contact link', {
          variant: 'error',
        })
        return
      }
      console.log(formData.leadershipTeam)

      const formPayload = new FormData()
      formPayload.append('pageTitle', formData.pageTitle)
      formPayload.append('missionStatement', formData.missionStatement)
      formPayload.append('organizationHistory', formData.organizationHistory)
      formPayload.append('contactURL', formData.contactURL)
      formPayload.append('facebookURL', formData.facebookURL)
      formPayload.append('instagramURL', formData.instagramURL)
      formPayload.append('twitterURL', formData.twitterURL)
      formPayload.append(
        'leadershipTeam',
        JSON.stringify(formData.leadershipTeam)
      )
      // formPayload.append('updatedBy', user?.id)

      // Add platform version if provided
      if (formData.platformVersion) {
        formPayload.append('platformVersion', formData.platformVersion)
      }

      if (formData.coverImage instanceof File) {
        formPayload.append('coverImage', formData.coverImage)
      }

      // Handle team member images
      formData.leadershipTeam.forEach((member, index) => {
        if (member.photo instanceof File) {
          formPayload.append(`leadershipTeam[${index}].photo`, member.photo)
        }
      })

      // Append legal document files if they exist
      if (formData.termsConditionsPDF instanceof File) {
        formPayload.append('termsConditionsPDF', formData.termsConditionsPDF)
      }

      if (formData.privacyPolicyPDF instanceof File) {
        formPayload.append('privacyPolicyPDF', formData.privacyPolicyPDF)
      }

      if (formData.copyrightNoticePDF instanceof File) {
        formPayload.append('copyrightNoticePDF', formData.copyrightNoticePDF)
      }

      console.log('Form submitted:', Object.fromEntries(formPayload.entries()))

      const response = await axios.post(
        `${API_BASE_URL}/about/admin/add-update`,
        formPayload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )

      console.log('Response:', response)
      if (
        response.status === apiConstants.create ||
        response.status === apiConstants.ok
      ) {
        enqueueSnackbar(
          response.data.message || 'About page updated successfully',
          {
            variant: 'success',
          }
        )
      }
    } catch (error) {
      console.log('Error submitting form:', error)

      enqueueSnackbar(
        error?.response?.data?.message || 'Something went wrong',
        {
          variant: 'error',
        }
      )
    }
  }

  const isValidURL = (url) => {
    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }

  return (
    <div className='min-h-screen text-white bg-dark-blue-900'>
      <div className='w-full'>
        <div className='flex items-center gap-4 mb-6'>
          <h1 className='text-2xl font-bold'>Manage About Page</h1>
        </div>

        <form>
          {/* General Section */}
          <h2 className='font-bold mb-4 uppercase text-sm'>General</h2>
          <div className='mb-6 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>
              Page Title<span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              name='pageTitle'
              value={formData.pageTitle}
              onChange={handleChange}
              className='w-full outline-none'
              placeholder='Enter Page Title'
              required
              autoload='true'
            />
          </div>

          {/* Image Upload */}
          <div className='mb-8'>
            <label className='block text-sm font-medium mb-2'>Image</label>
            {imagePreview ? (
              <div className='relative w-72 h-52 rounded-lg overflow-hidden border border-[#D9E2F930]'>
                <img
                  src={imagePreview}
                  alt='Selected'
                  className='w-full h-full object-cover'
                />
                <button
                  type='button'
                  onClick={() => {
                    setImagePreview(null)
                    setFormData((prev) => ({ ...prev, coverImage: null }))
                  }}
                  className='absolute top-2 right-2 bg-[#14255D] p-1 rounded text-[#AEB9E1]'
                >
                  <Trash className='w-4 h-4' />
                </button>
              </div>
            ) : (
              <label
                htmlFor='header-image-upload'
                className='cursor-pointer border-2 border-dashed border-gray-500 rounded-lg flex flex-col items-center justify-center w-72 h-52 relative'
              >
                <input
                  id='header-image-upload'
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
                <p className='text-sm text-[#AEB9E1] z-10 text-center'>
                  <span className='text-[#FEF200] mr-1'>Click to upload</span>
                  or drag and drop
                  <br />
                  SVG, PNG, JPG or GIF (JPEG/PNG required)
                </p>
              </label>
            )}
          </div>

          {/* Body Editor Section */}
          <h2 className='font-bold mb-4 uppercase text-sm'>Body Content</h2>

          {/* Mission Statement */}
          <div className='mb-6 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>
              Mission Statement<span className='text-red-500'>*</span>
            </label>
            <textarea
              name='missionStatement'
              value={formData.missionStatement}
              onChange={handleChange}
              rows='2'
              className='w-full outline-none resize-none'
              placeholder='Write mission here'
              required
              autoload='true'
            />
          </div>

          {/* History */}
          <div className='mb-6 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>
              Organization History<span className='text-red-500'>*</span>
            </label>
            <textarea
              name='organizationHistory'
              value={formData.organizationHistory}
              onChange={handleChange}
              rows='4'
              className='w-full outline-none resize-none'
              placeholder='Write organization organizationHistory'
              required
              autoload='true'
            />
          </div>

          {/* Team Members Section */}
          <h2 className='font-bold mb-4 uppercase text-sm'>
            Leadership Team Members
          </h2>

          {/* Team Members List */}
          <div className='mb-6'>
            {formData.leadershipTeam?.length > 0 && (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4'>
                {formData.leadershipTeam?.map((member, index) => (
                  <div
                    key={index}
                    className='bg-[#00000061] p-3 rounded relative group'
                  >
                    {member.photoUrl && (
                      <img
                        src={
                          member.photoUrl instanceof File
                            ? URL.createObjectURL(member.photoUrl)
                            : member.photoUrl
                        }
                        alt={member.name}
                        className='w-full h-32 object-cover rounded mb-2'
                      />
                    )}
                    <h3 className='font-medium'>{member.name}</h3>
                    <p className='text-sm text-gray-300'>{member.position}</p>
                    <button
                      type='button'
                      onClick={() => handleRemoveTeamMember(index)}
                      className='absolute top-2 right-2 bg-[#14255D] p-1 rounded text-[#AEB9E1] opacity-0 group-hover:opacity-100 transition-opacity'
                    >
                      <Trash className='w-4 h-4' />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Team Member Button */}
            <button
              type='button'
              onClick={() => setShowTeamMemberModal(true)}
              className='text-white font-medium py-2 px-4 rounded mb-6 border border-[#7F25FB]'
            >
              + Add Team Member
            </button>
          </div>

          {/* Team Member Modal */}
          {showTeamMemberModal && (
            <div className='fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-gray-800/30'>
              <div className='bg-[#1b0c2e] p-6 rounded-lg max-w-3xl w-full relative'>
                <h3 className='text-xl font-bold mb-4'>Add Team Member</h3>

                {/* Name */}
                <div className='mb-4 bg-[#00000061] p-2 rounded'>
                  <label className='block text-sm font-medium mb-1'>
                    Name<span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='name'
                    value={currentTeamMember.name}
                    onChange={handleTeamMemberChange}
                    className='w-full outline-none'
                    placeholder='Name'
                    required
                  />
                </div>

                {/* Title */}
                <div className='mb-4 bg-[#00000061] p-2 rounded'>
                  <label className='block text-sm font-medium mb-1'>
                    Title<span className='text-red-500'>*</span>
                  </label>
                  <input
                    type='text'
                    name='position'
                    value={currentTeamMember.position}
                    onChange={handleTeamMemberChange}
                    className='w-full outline-none'
                    placeholder='Title'
                    required
                  />
                </div>

                {/* Image Upload */}
                <div className='mb-4'>
                  {teamMemberImagePreview ? (
                    <div className='relative w-full h-40 rounded-lg overflow-hidden border border-[#D9E2F930]'>
                      <img
                        src={teamMemberImagePreview}
                        alt='Team Member'
                        className='w-full h-full object-cover'
                      />
                      <button
                        type='button'
                        onClick={() => {
                          setTeamMemberImagePreview(null)
                          setCurrentTeamMember((prev) => ({
                            ...prev,
                            photo: null,
                          }))
                        }}
                        className='absolute top-2 right-2 bg-[#14255D] p-1 rounded text-[#AEB9E1]'
                      >
                        <Trash className='w-4 h-4' />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor='team-member-image'
                      className='cursor-pointer border-2 border-dashed border-gray-500 rounded-lg flex flex-col items-center justify-center h-40 relative'
                    >
                      <input
                        id='team-member-image'
                        type='file'
                        accept='image/*'
                        onChange={handleTeamMemberImageChange}
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
                      <p className='text-sm text-[#AEB9E1] z-10 text-center'>
                        <span className='text-[#FEF200] mr-1'>
                          Click to upload
                        </span>
                        team member image
                      </p>
                    </label>
                  )}
                </div>

                {/* Modal Buttons */}
                <div className='flex justify-end gap-2 mt-4'>
                  <button
                    type='button'
                    onClick={() => setShowTeamMemberModal(false)}
                    className='text-white py-2 px-4 border border-gray-500 rounded'
                  >
                    Cancel
                  </button>
                  <button
                    type='button'
                    onClick={handleAddTeamMember}
                    className='text-white py-2 px-4 rounded'
                    style={{
                      background:
                        'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
                    }}
                  >
                    Add Member
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Section */}
          <h2 className='font-bold mb-4 uppercase text-sm'>Footer</h2>

          {/* Contact Link */}
          <div className='mb-6 bg-[#00000061] p-2 rounded'>
            <label className='block text-sm font-medium mb-1'>
              Contact Link
            </label>
            <input
              type='text'
              name='contactURL'
              value={formData.contactURL}
              onChange={handleChange}
              className='w-full outline-none'
              placeholder='Link to contact form'
            />
          </div>

          {/* Social Media Links */}
          <div className='mb-6'>
            <label className='block text-sm font-medium mb-2'>
              Social Media Links
            </label>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-xs text-gray-400 mb-1'>
                  Facebook
                </label>
                <input
                  type='text'
                  name='facebookURL'
                  value={formData.facebookURL}
                  onChange={handleChange}
                  className='w-full outline-none'
                  placeholder='Enter Facebook URL'
                />
              </div>
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-xs text-gray-400 mb-1'>
                  Instagram
                </label>
                <input
                  type='text'
                  name='instagramURL'
                  value={formData.instagramURL}
                  onChange={handleChange}
                  className='w-full outline-none'
                  placeholder='Enter Instagram URL'
                />
              </div>
              <div className='bg-[#00000061] p-2 rounded'>
                <label className='block text-xs text-gray-400 mb-1'>
                  Twitter
                </label>
                <input
                  type='text'
                  name='twitterURL'
                  value={formData.twitterURL}
                  onChange={handleChange}
                  className='w-full outline-none'
                  placeholder='Enter Twitter URL'
                />
              </div>
            </div>
          </div>

          {/* Legal Documents Section */}
          <div className='mb-6'>
            <h3 className='text-sm font-medium mb-4'>Legal Documents</h3>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {/* Terms & Conditions PDF */}
              <div className='mb-4'>
                <label className='block text-sm font-medium mb-2'>
                  Terms & Conditions PDF
                </label>
                {termsAndConditionsFileName ? (
                  <div className='flex items-center gap-2 bg-[#00000061] p-2 rounded'>
                    <span className='text-sm truncate'>
                      {termsAndConditionsFileName}
                    </span>
                    <button
                      type='button'
                      onClick={() => handleRemoveLegalDoc('termsConditionsPDF')}
                      className='bg-[#14255D] p-1 rounded text-[#AEB9E1] ml-auto'
                    >
                      <Trash className='w-4 h-4' />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor='terms-conditions-upload'
                    className='cursor-pointer border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center h-12 relative'
                  >
                    <input
                      id='terms-conditions-upload'
                      type='file'
                      accept='.pdf'
                      onChange={(e) =>
                        handleLegalDocUpload(e, 'termsConditionsPDF')
                      }
                      className='absolute inset-0 opacity-0 z-50'
                    />
                    <p className='text-sm text-[#AEB9E1] z-10'>
                      <span className='text-[#FEF200] mr-1'>
                        Click to upload
                      </span>
                      Terms & Conditions PDF (Max 5MB)
                    </p>
                  </label>
                )}
              </div>

              {/* Privacy Policy PDF */}
              <div className='mb-4'>
                <label className='block text-sm font-medium mb-2'>
                  Privacy Policy PDF
                </label>
                {privacyPolicyFileName ? (
                  <div className='flex items-center gap-2 bg-[#00000061] p-2 rounded'>
                    <span className='text-sm truncate'>
                      {privacyPolicyFileName}
                    </span>
                    <button
                      type='button'
                      onClick={() => handleRemoveLegalDoc('privacyPolicyPDF')}
                      className='bg-[#14255D] p-1 rounded text-[#AEB9E1] ml-auto'
                    >
                      <Trash className='w-4 h-4' />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor='privacy-policy-upload'
                    className='cursor-pointer border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center h-12 relative'
                  >
                    <input
                      id='privacy-policy-upload'
                      type='file'
                      accept='.pdf'
                      onChange={(e) =>
                        handleLegalDocUpload(e, 'privacyPolicyPDF')
                      }
                      className='absolute inset-0 opacity-0 z-50'
                    />
                    <p className='text-sm text-[#AEB9E1] z-10'>
                      <span className='text-[#FEF200] mr-1'>
                        Click to upload
                      </span>
                      Privacy Policy PDF (Max 5MB)
                    </p>
                  </label>
                )}
              </div>

              {/* Copyright Notice PDF */}
              <div className='mb-4'>
                <label className='block text-sm font-medium mb-2'>
                  Copyright Notice PDF
                </label>
                {copyrightNoticeFileName ? (
                  <div className='flex items-center gap-2 bg-[#00000061] p-2 rounded'>
                    <span className='text-sm truncate'>
                      {copyrightNoticeFileName}
                    </span>
                    <button
                      type='button'
                      onClick={() => handleRemoveLegalDoc('copyrightNoticePDF')}
                      className='bg-[#14255D] p-1 rounded text-[#AEB9E1] ml-auto'
                    >
                      <Trash className='w-4 h-4' />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor='copyright-notice-upload'
                    className='cursor-pointer border-2 border-dashed border-gray-500 rounded-lg flex items-center justify-center h-12 relative'
                  >
                    <input
                      id='copyright-notice-upload'
                      type='file'
                      accept='.pdf'
                      onChange={(e) =>
                        handleLegalDocUpload(e, 'copyrightNoticePDF')
                      }
                      className='absolute inset-0 opacity-0 z-50'
                    />
                    <p className='text-sm text-[#AEB9E1] z-10'>
                      <span className='text-[#FEF200] mr-1'>
                        Click to upload
                      </span>
                      Copyright Notice PDF (Max 5MB)
                    </p>
                  </label>
                )}
              </div>
            </div>

            {/* Platform Version */}
            <div className='mb-6 bg-[#00000061] p-2 rounded'>
              <label className='block text-sm font-medium mb-1'>
                Platform Version (Display Only)
              </label>
              <input
                type='text'
                name='platformVersion'
                value={formData.platformVersion}
                onChange={handleChange}
                className='w-full outline-none'
                placeholder='e.g., v2.5.0'
              />
              <p className='text-xs text-gray-400 mt-1'>
                Displays system or platform version in site footer
              </p>
            </div>
          </div>

          {/* Submission Button */}
          <div className='flex justify-center mt-8 mb-6'>
            <button
              type='submit'
              onClick={handleSubmit}
              className='text-white font-medium py-2 px-6 rounded'
              style={{
                background:
                  'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
              }}
            >
              Save & Publish
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
