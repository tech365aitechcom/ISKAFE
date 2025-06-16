'use client'
import { API_BASE_URL } from '../../../../constants'
import axios from 'axios'
import { Facebook, Instagram, Video, Youtube } from 'lucide-react'
import React, { use, useEffect, useState } from 'react'

const FighterProfile = ({ params }) => {
  const { id } = use(params)
  const [fighterDetails, setFighterDetails] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchFighterDetails = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_BASE_URL}/fighters/${id}`)
      console.log('Fighter Details:', response)
      setFighterDetails(response.data.data)
    } catch (error) {
      console.error('Error fetching event details:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFighterDetails()
  }, [id])

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A'
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--
    }
    return age
  }

  // Helper function to format name
  const getFullName = (fighter) => {
    if (!fighter?.userId) return 'Unknown Fighter'
    const { firstName, lastName } = fighter.userId
    return `${firstName || ''} ${lastName || ''}`.trim().toUpperCase()
  }

  if (loading) {
    return (
      <div className='bg-gray-900 text-white min-h-screen p-6 flex items-center justify-center'>
        <div className='text-xl'>Loading fighter details...</div>
      </div>
    )
  }

  if (!fighterDetails) {
    return (
      <div className='bg-gray-900 text-white min-h-screen p-6 flex items-center justify-center'>
        <div className='text-xl'>Fighter details not found</div>
      </div>
    )
  }

  const fighter = fighterDetails
  const user = fighter.userId

  return (
    <div className='bg-gray-900 text-white min-h-screen p-6'>
      <div className='max-w-5xl mx-auto'>
        {/* Header Section with Fighter Details */}
        <div className='flex space-x-6 mb-6'>
          {/* Fighter Image */}
          <div className='w-64 h-64 bg-gray-800 rounded-lg overflow-hidden'>
            <img
              src={user?.profilePhoto || '/api/placeholder/256/256'}
              alt={getFullName(fighter)}
              className='w-full h-full object-cover'
            />
          </div>

          {/* Fighter Info */}
          <div className='flex-1'>
            <div className='flex justify-between items-start mb-4'>
              <div>
                <h1 className='text-3xl font-bold'>{getFullName(fighter)}</h1>
                <p className='text-gray-400 text-sm'>
                  {user?.nickName || user?.userName || 'N/A'}
                </p>
              </div>
            </div>

            {/* Fighter Stats Grid */}
            <div className='grid grid-cols-3 gap-4 text-sm'>
              <div>
                <span className='text-gray-400 block'>Record (Summary)</span>
                <p className='font-semibold'>
                  {fighter.recordHighlight || 'N/A'}
                </p>
              </div>
              <div>
                <span className='text-gray-400 block'>Height</span>
                <p className='font-semibold'>
                  {fighter.height ? `${fighter.height} cm` : 'N/A'}
                </p>
              </div>
              <div>
                <span className='text-gray-400 block'>Weight</span>
                <p className='font-semibold'>
                  {fighter.weight ? `${fighter.weight} kg` : 'N/A'}
                </p>
              </div>
              <div>
                <span className='text-gray-400 block'>Age</span>
                <p className='font-semibold'>
                  {calculateAge(user?.dateOfBirth)}
                </p>
              </div>
              <div>
                <span className='text-gray-400 block'>Gender</span>
                <p className='font-semibold'>{user?.gender || 'N/A'}</p>
              </div>
              <div>
                <span className='text-gray-400 block'>Weight Class</span>
                <p className='font-semibold'>{fighter.weightClass || 'N/A'}</p>
              </div>
              <div className='col-span-2'>
                <span className='text-gray-400 block'>Location</span>
                <p className='font-semibold'>
                  {[user?.city, user?.state, user?.country]
                    .filter(Boolean)
                    .join(', ') || 'N/A'}
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div className='flex space-x-4 mt-4 text-sm'>
              <div className='mb-2'>
                <span className='text-gray-400'>Phone: </span>
                <span>{user?.phoneNumber || 'N/A'}</span>
              </div>
              <div>
                <span className='text-gray-400'>Email: </span>
                <span>{user?.email || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Gym Info */}
        <div className='bg-gray-800 p-4 rounded-lg mb-6'>
          <h2 className='text-lg font-semibold mb-2'>Gym Information</h2>
          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <span className='text-gray-400 block'>Primary Gym / Club</span>
              <p>{fighter.primaryGym || 'N/A'}</p>
            </div>
            <div>
              <span className='text-gray-400 block'>Coach Name</span>
              <p>{fighter.coachName || 'N/A'}</p>
            </div>
            <div className='col-span-2'>
              <span className='text-gray-400 block'>
                Secondary Affiliations
              </span>
              <p>{fighter.affiliations || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Compliance Status */}
        <div className='bg-gray-800 p-4 rounded-lg mb-6'>
          <h2 className='text-lg font-semibold mb-2'>Compliance</h2>
          <div className='grid grid-cols-1 gap-4 text-sm'>
            {/* Suspension Status */}
            <div>
              <span className='text-gray-400 block mb-2'>
                Suspension Status
              </span>
              {fighter.suspension ? (
                <div className='bg-red-900/30 border border-red-500 rounded-lg p-3'>
                  <div className='flex items-center mb-2'>
                    <span className='text-red-400 font-semibold'>
                      Active Suspension
                    </span>
                    <span className='ml-2 bg-red-600 text-white px-2 py-1 rounded text-xs'>
                      {fighter.suspension.status}
                    </span>
                  </div>
                  <div className='space-y-1 text-xs'>
                    <div>
                      <span className='text-gray-400'>Type: </span>
                      <span className='text-white'>
                        {fighter.suspension.type}
                      </span>
                    </div>
                    <div>
                      <span className='text-gray-400'>Incident Date: </span>
                      <span className='text-white'>
                        {new Date(
                          fighter.suspension.incidentDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    {fighter.suspension.description && (
                      <div>
                        <span className='text-gray-400'>Description: </span>
                        <span className='text-white'>
                          {fighter.suspension.description}
                        </span>
                      </div>
                    )}
                    <div className='grid grid-cols-2 gap-2 mt-2'>
                      <div>
                        <span className='text-gray-400'>
                          Days before competing:{' '}
                        </span>
                        <span className='text-white'>
                          {fighter.suspension.daysBeforeCompeting}
                        </span>
                      </div>
                    </div>
                    {fighter.suspension.indefinite && (
                      <div className='text-red-400 font-semibold mt-1'>
                        ⚠️ Indefinite Suspension
                      </div>
                    )}
                    {fighter.suspension.medicalClearance && (
                      <div className='text-yellow-400 mt-1'>
                        📋 Medical Clearance Required
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className='text-green-400'>No Active Suspension</p>
              )}
            </div>{' '}
            {/* Medical/License Status */}
            <div>
              <span className='text-gray-400 block'>
                Medical / License Status
              </span>
              <p
                className={
                  fighter.medicalCertificate ? 'text-green-400' : 'text-red-400'
                }
              >
                {fighter.medicalCertificate
                  ? 'Med Form Submitted'
                  : 'Med Form Missing'}
              </p>
            </div>
          </div>
        </div>

        {/* About Fighter Biography */}
        <div className='bg-gray-800 p-4 rounded-lg mb-6'>
          <h2 className='text-lg font-semibold mb-3'>About Fighter</h2>
          <p className='text-sm text-gray-300 leading-relaxed'>
            {fighter.bio || 'No biography available.'}
          </p>
        </div>

        {/* Record Overview */}
        <div className='mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Record Overview</h2>
          <div className='bg-gray-800 p-6 rounded-lg'>
            <div className='text-center mb-4'>
              <p className='text-3xl font-bold text-yellow-400'>
                {fighter.recordHighlight || 'N/A'}
              </p>
              <p className='text-gray-400'>Total Win-Loss-Draw Record</p>
            </div>
          </div>
        </div>

        {/* Achievements */}
        {fighter.achievements && (
          <div className='mb-6'>
            <h2 className='text-xl font-semibold mb-4'>Achievements</h2>
            <div className='bg-gray-800 p-4 rounded-lg'>
              <div className='space-y-3'>
                <div className='flex items-center space-x-3'>
                  <div className='w-2 h-2 bg-yellow-400 rounded-full'></div>
                  <span>{fighter.achievements}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rankings */}
        {(fighter.nationalRank || fighter.globalRank) && (
          <div className='mb-6'>
            <h2 className='text-xl font-semibold mb-4'>Rankings</h2>
            <div className='grid grid-cols-2 gap-4'>
              {fighter.nationalRank && (
                <div className='bg-gray-800 p-4 rounded-lg text-center'>
                  <h3 className='text-lg font-semibold mb-2'>National Rank</h3>
                  <p className='text-3xl font-bold text-yellow-400'>
                    {fighter.nationalRank}
                  </p>
                  <p className='text-gray-400 text-sm'>
                    National ranking by weight class
                  </p>
                </div>
              )}
              {fighter.globalRank && (
                <div className='bg-gray-800 p-4 rounded-lg text-center'>
                  <h3 className='text-lg font-semibold mb-2'>Global Rank</h3>
                  <p className='text-3xl font-bold text-blue-400'>
                    {fighter.globalRank}
                  </p>
                  <p className='text-gray-400 text-sm'>Global placement</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Training Info */}
        <div className='mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Training Info</h2>
          <div className='bg-gray-800 p-4 rounded-lg'>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-gray-400 block'>Training Experience</span>
                <p className='font-semibold'>
                  {fighter.trainingExperience || 'N/A'}
                </p>
              </div>
              <div>
                <span className='text-gray-400 block'>Training Style</span>
                <p className='font-semibold'>
                  {fighter.trainingStyle || 'N/A'}
                </p>
              </div>
              {fighter.credentials && (
                <div className='col-span-2'>
                  <span className='text-gray-400 block'>Credentials</span>
                  <p className='font-semibold'>{fighter.credentials}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Social Media */}
        {(fighter.instagram || fighter.youtube || fighter.facebook) && (
          <div className='mb-6'>
            <h2 className='text-xl font-semibold mb-4'>Social Media</h2>
            <div className='bg-gray-800 p-4 rounded-lg'>
              <div className='flex space-x-6'>
                {fighter.instagram && (
                  <a
                    href={fighter.instagram}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-red-500 hover:text-red-400'
                  >
                    <Instagram />
                  </a>
                )}
                {fighter.youtube && (
                  <a
                    href={fighter.youtube}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-red-400 hover:text-red-300'
                  >
                    <Youtube />
                  </a>
                )}
                {fighter.facebook && (
                  <a
                    href={fighter.facebook}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-500 hover:text-blue-400'
                  >
                    <Facebook />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Media Gallery */}
        {(fighter.imageGallery?.length > 0 || fighter.videoHighlight) && (
          <div className='mb-6'>
            <h2 className='text-xl font-semibold mb-4'>Media Gallery</h2>
            <div className='bg-gray-800 p-4 rounded-lg'>
              {fighter.imageGallery?.length > 0 && (
                <div className='mb-4'>
                  <h3 className='text-lg font-semibold mb-3'>Images Gallery</h3>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    {fighter.imageGallery.map((image, index) => (
                      <div
                        key={index}
                        className='aspect-square bg-gray-700 rounded-lg overflow-hidden'
                      >
                        <img
                          src={image}
                          alt={`Fighter image ${index + 1}`}
                          className='w-full h-full object-cover hover:opacity-80 transition-opacity cursor-pointer'
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {fighter.videoHighlight && (
                <div>
                  <h3 className='text-lg font-semibold mb-3'>
                    Video Highlights
                  </h3>
                  <div className=''>
                    <div className='bg-gray-700 rounded-lg p-4 text-center'>
                      <div className='flex items-center justify-center'>
                        <a
                          href={fighter.videoHighlight}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-400 hover:text-blue-300 flex gap-2'
                        >
                          <Video />
                          Watch Video
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Documents */}
        {(fighter.licenseDocument || fighter.medicalCertificate) && (
          <div className='mb-6'>
            <h2 className='text-xl font-semibold mb-4'>Documents</h2>
            <div className='bg-gray-800 p-4 rounded-lg'>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                {fighter.licenseDocument && (
                  <div>
                    <span className='text-gray-400 block'>
                      License Document
                    </span>
                    <a
                      href={fighter.licenseDocument}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-400 hover:text-blue-300'
                    >
                      View License
                    </a>
                  </div>
                )}
                {fighter.medicalCertificate && (
                  <div>
                    <span className='text-gray-400 block'>
                      Medical Certificate
                    </span>

                    <a
                      href={fighter.medicalCertificate}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-blue-400 hover:text-blue-300'
                    >
                      View Medical Certificate
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FighterProfile
