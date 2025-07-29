'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Search, Filter, User, Trophy, Award, Calendar, Weight, Ruler, MapPin, Phone, Mail, Camera, Video, ExternalLink, Edit, Eye, Star } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { enqueueSnackbar } from 'notistack'
import { API_BASE_URL } from '../../../../../../constants'
import useStore from '../../../../../../stores/useStore'
import Loader from '../../../../../_components/Loader'

export default function FighterCardPage() {
  const params = useParams()
  const user = useStore((state) => state.user)
  const [eventId, setEventId] = useState(null)
  const [event, setEvent] = useState(null)
  const [fighters, setFighters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedFighter, setSelectedFighter] = useState(null)
  const [showFighterModal, setShowFighterModal] = useState(false)
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    weightClass: '',
    ageCategory: '',
    trainingStyle: '',
    experience: '',
    status: ''
  })

  useEffect(() => {
    if (params?.id) {
      setEventId(params.id)
      fetchEventData(params.id)
      fetchFighters(params.id)
    }
  }, [params])

  const fetchEventData = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setEvent(data.data)
        }
      }
    } catch (err) {
      console.error('Error fetching event:', err)
    }
  }

  const fetchFighters = async (id) => {
    try {
      setLoading(true)
      // Fetch fighters registered for this event
      const response = await fetch(`${API_BASE_URL}/registrations/event/${id}?registrationType=fighter`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setFighters(data.data.items || [])
        } else {
          setFighters([])
        }
      } else {
        setFighters([])
      }
    } catch (err) {
      setError(err.message)
      setFighters([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (fighter) => {
    if (fighter.checkInStatus === 'Checked In') {
      return <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Checked In</span>
    } else if (fighter.paymentStatus === 'Paid') {
      return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">Registered</span>
    } else {
      return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">Pending</span>
    }
  }

  const getExperienceColor = (experience) => {
    switch (experience) {
      case 'Beginner (0-2 years)': return 'text-green-400'
      case 'Intermediate (3-5 years)': return 'text-yellow-400'
      case 'Advanced (6-10 years)': return 'text-orange-400'
      case 'Expert (10+ years)': return 'text-red-400'
      case 'Professional': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A'
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1
    }
    return age
  }

  const filteredFighters = fighters.filter(fighter => {
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const fighterName = `${fighter.firstName || ''} ${fighter.lastName || ''}`.toLowerCase()
      const gym = (fighter.primaryGym || '').toLowerCase()
      
      if (!fighterName.includes(searchTerm) && !gym.includes(searchTerm)) {
        return false
      }
    }

    if (filters.weightClass && fighter.weightClass !== filters.weightClass) {
      return false
    }

    if (filters.trainingStyle && fighter.trainingStyle !== filters.trainingStyle) {
      return false
    }

    if (filters.experience && fighter.trainingExperience !== filters.experience) {
      return false
    }

    return true
  })

  const handleViewFighter = (fighter) => {
    setSelectedFighter(fighter)
    setShowFighterModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[#07091D]">
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-white p-8">
        <div className="bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg">
          <p className="text-red-500">Error: {error}</p>
          <Link href={`/admin/events/view/${eventId}`}>
            <button className="mt-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700">
              Back to Event
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="text-white p-8 relative flex justify-center overflow-hidden">
      <div
        className="absolute -left-10 top-1/2 transform -translate-y-1/2 w-60 h-96 rounded-full opacity-70 blur-xl"
        style={{
          background:
            'linear-gradient(317.9deg, #6F113E 13.43%, rgba(111, 17, 62, 0) 93.61%)',
        }}
      ></div>
      
      <div className="bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href={`/admin/events/view/${eventId}`}>
            <button className="mr-2 hover:bg-gray-700 p-2 rounded">
              <ArrowLeft size={24} />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Fighter Card</h1>
            {event && (
              <p className="text-sm text-gray-300">
                {event.name} ({new Date(event.startDate).toLocaleDateString()})
              </p>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#07091D] p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{fighters.length}</div>
            <div className="text-sm text-gray-400">Total Fighters</div>
          </div>
          <div className="bg-[#07091D] p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              {fighters.filter(f => f.checkInStatus === 'Checked In').length}
            </div>
            <div className="text-sm text-gray-400">Checked In</div>
          </div>
          <div className="bg-[#07091D] p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">
              {fighters.filter(f => f.paymentStatus === 'Paid' && f.checkInStatus !== 'Checked In').length}
            </div>
            <div className="text-sm text-gray-400">Registered</div>
          </div>
          <div className="bg-[#07091D] p-4 rounded-lg">
            <div className="text-2xl font-bold text-gray-400">
              {fighters.filter(f => f.paymentStatus !== 'Paid').length}
            </div>
            <div className="text-sm text-gray-400">Pending</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 p-4 bg-[#07091D] rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search fighters..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pl-10 bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white"
              />
            </div>

            <select
              value={filters.weightClass}
              onChange={(e) => setFilters({...filters, weightClass: e.target.value})}
              className="bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="">All Weight Classes</option>
              <option value="Flyweight (125 lbs)">Flyweight (125 lbs)</option>
              <option value="Bantamweight (135 lbs)">Bantamweight (135 lbs)</option>
              <option value="Featherweight (145 lbs)">Featherweight (145 lbs)</option>
              <option value="Lightweight (155 lbs)">Lightweight (155 lbs)</option>
              <option value="Welterweight (170 lbs)">Welterweight (170 lbs)</option>
              <option value="Middleweight (185 lbs)">Middleweight (185 lbs)</option>
              <option value="Light Heavyweight (205 lbs)">Light Heavyweight (205 lbs)</option>
              <option value="Heavyweight (265 lbs)">Heavyweight (265 lbs)</option>
            </select>

            <select
              value={filters.trainingStyle}
              onChange={(e) => setFilters({...filters, trainingStyle: e.target.value})}
              className="bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="">All Styles</option>
              <option value="Kickboxing">Kickboxing</option>
              <option value="MMA">MMA</option>
              <option value="Muay Thai">Muay Thai</option>
              <option value="Boxing">Boxing</option>
              <option value="BJJ">BJJ</option>
              <option value="Karate">Karate</option>
              <option value="Taekwondo">Taekwondo</option>
            </select>

            <select
              value={filters.experience}
              onChange={(e) => setFilters({...filters, experience: e.target.value})}
              className="bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="">All Experience</option>
              <option value="Beginner (0-2 years)">Beginner (0-2 years)</option>
              <option value="Intermediate (3-5 years)">Intermediate (3-5 years)</option>
              <option value="Advanced (6-10 years)">Advanced (6-10 years)</option>
              <option value="Expert (10+ years)">Expert (10+ years)</option>
              <option value="Professional">Professional</option>
            </select>
          </div>
        </div>

        {/* Fighters Grid */}
        {filteredFighters.length === 0 ? (
          <div className="text-center py-12">
            <User size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-400 mb-4">No fighters found matching your criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFighters.map((fighter) => (
              <div key={fighter._id} className="bg-[#07091D] rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                {/* Fighter Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {fighter.userId?.profilePhoto ? (
                        <Image
                          src={fighter.userId.profilePhoto}
                          alt={`${fighter.firstName} ${fighter.lastName}`}
                          width={60}
                          height={60}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-15 h-15 bg-gray-600 rounded-full flex items-center justify-center">
                          <User size={30} className="text-gray-400" />
                        </div>
                      )}
                      {fighter.globalRank && parseInt(fighter.globalRank) <= 3 && (
                        <div className="absolute -top-1 -right-1">
                          <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">
                        {fighter.firstName} {fighter.lastName}
                      </h3>
                      <p className="text-sm text-gray-400">{fighter.primaryGym || 'No Gym Listed'}</p>
                      {getStatusBadge(fighter)}
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewFighter(fighter)}
                    className="p-2 hover:bg-gray-600 rounded transition-colors"
                  >
                    <Eye size={18} className="text-gray-400" />
                  </button>
                </div>

                {/* Fighter Stats */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span className="text-gray-300">Age: {calculateAge(fighter.userId?.dateOfBirth)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Weight size={14} className="text-gray-400" />
                      <span className="text-gray-300">{fighter.weight || 'N/A'} lbs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Ruler size={14} className="text-gray-400" />
                      <span className="text-gray-300">{fighter.height || 'N/A'} cm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy size={14} className="text-gray-400" />
                      <span className="text-gray-300">Rank: #{fighter.globalRank || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Award size={14} className="text-gray-400" />
                      <span className="text-gray-300">Weight Class:</span>
                    </div>
                    <span className="text-blue-400 text-xs">{fighter.weightClass || 'Not Specified'}</span>
                  </div>

                  <div className="text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={14} className="text-gray-400" />
                      <span className="text-gray-300">Experience:</span>
                    </div>
                    <span className={`text-xs ${getExperienceColor(fighter.trainingExperience)}`}>
                      {fighter.trainingExperience || 'Not Specified'}
                    </span>
                  </div>

                  <div className="text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy size={14} className="text-gray-400" />
                      <span className="text-gray-300">Style:</span>
                    </div>
                    <span className="text-purple-400 text-xs">{fighter.trainingStyle || 'Not Specified'}</span>
                  </div>

                  {fighter.coachName && (
                    <div className="text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <User size={14} className="text-gray-400" />
                        <span className="text-gray-300">Coach:</span>
                      </div>
                      <span className="text-green-400 text-xs">{fighter.coachName}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results showing count */}
        <div className="mt-6 text-sm text-gray-400 text-center">
          Showing {filteredFighters.length} of {fighters.length} fighters
        </div>

        {/* Fighter Detail Modal */}
        {showFighterModal && selectedFighter && (
          <FighterDetailModal
            fighter={selectedFighter}
            onClose={() => {
              setShowFighterModal(false)
              setSelectedFighter(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

// Fighter Detail Modal Component
function FighterDetailModal({ fighter, onClose }) {
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A'
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1
    }
    return age
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-[#0B1739] rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {fighter.firstName} {fighter.lastName}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Photo & Basic Info */}
          <div className="space-y-4">
            <div className="text-center">
              {fighter.userId?.profilePhoto ? (
                <Image
                  src={fighter.userId.profilePhoto}
                  alt={`${fighter.firstName} ${fighter.lastName}`}
                  width={200}
                  height={200}
                  className="rounded-lg object-cover mx-auto"
                />
              ) : (
                <div className="w-48 h-48 bg-gray-600 rounded-lg flex items-center justify-center mx-auto">
                  <User size={80} className="text-gray-400" />
                </div>
              )}
            </div>

            <div className="bg-[#07091D] p-4 rounded-lg">
              <h3 className="font-bold text-white mb-3">Basic Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Age:</span>
                  <span className="text-white">{calculateAge(fighter.userId?.dateOfBirth)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Weight:</span>
                  <span className="text-white">{fighter.weight || 'N/A'} lbs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Height:</span>
                  <span className="text-white">{fighter.height || 'N/A'} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Weight Class:</span>
                  <span className="text-white">{fighter.weightClass || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Global Rank:</span>
                  <span className="text-white">#{fighter.globalRank || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">National Rank:</span>
                  <span className="text-white">#{fighter.nationalRank || 'N/A'}</span>
                </div>
              </div>
            </div>

            {fighter.userId?.email && (
              <div className="bg-[#07091D] p-4 rounded-lg">
                <h3 className="font-bold text-white mb-3">Contact</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    <span className="text-white">{fighter.userId.email}</span>
                  </div>
                  {fighter.userId.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-white">{fighter.userId.phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Middle Column - Training & Experience */}
          <div className="space-y-4">
            <div className="bg-[#07091D] p-4 rounded-lg">
              <h3 className="font-bold text-white mb-3">Training Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-400">Primary Gym:</span>
                  <p className="text-white">{fighter.primaryGym || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Training Style:</span>
                  <p className="text-white">{fighter.trainingStyle || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-gray-400">Experience Level:</span>
                  <p className="text-white">{fighter.trainingExperience || 'Not specified'}</p>
                </div>
                {fighter.coachName && (
                  <div>
                    <span className="text-gray-400">Coach:</span>
                    <p className="text-white">{fighter.coachName}</p>
                  </div>
                )}
                {fighter.affiliations && (
                  <div>
                    <span className="text-gray-400">Affiliations:</span>
                    <p className="text-white">{fighter.affiliations}</p>
                  </div>
                )}
              </div>
            </div>

            {fighter.bio && (
              <div className="bg-[#07091D] p-4 rounded-lg">
                <h3 className="font-bold text-white mb-3">Biography</h3>
                <p className="text-gray-300 text-sm">{fighter.bio}</p>
              </div>
            )}

            {fighter.achievements && (
              <div className="bg-[#07091D] p-4 rounded-lg">
                <h3 className="font-bold text-white mb-3">Achievements</h3>
                <p className="text-gray-300 text-sm">{fighter.achievements}</p>
              </div>
            )}
          </div>

          {/* Right Column - Media & Links */}
          <div className="space-y-4">
            {(fighter.imageGallery && fighter.imageGallery.length > 0) && (
              <div className="bg-[#07091D] p-4 rounded-lg">
                <h3 className="font-bold text-white mb-3">Gallery</h3>
                <div className="grid grid-cols-2 gap-2">
                  {fighter.imageGallery.slice(0, 4).map((image, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={image}
                        alt={`${fighter.firstName} gallery ${index + 1}`}
                        width={100}
                        height={100}
                        className="rounded object-cover w-full h-20"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#07091D] p-4 rounded-lg">
              <h3 className="font-bold text-white mb-3">Social Links</h3>
              <div className="space-y-2">
                {fighter.facebook && (
                  <a href={fighter.facebook} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
                    <ExternalLink size={14} />
                    Facebook
                  </a>
                )}
                {fighter.instagram && (
                  <a href={fighter.instagram} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-2 text-pink-400 hover:text-pink-300 text-sm">
                    <ExternalLink size={14} />
                    Instagram
                  </a>
                )}
                {fighter.youtube && (
                  <a href={fighter.youtube} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm">
                    <Video size={14} />
                    YouTube
                  </a>
                )}
                {fighter.videoHighlight && (
                  <a href={fighter.videoHighlight} target="_blank" rel="noopener noreferrer" 
                     className="flex items-center gap-2 text-green-400 hover:text-green-300 text-sm">
                    <Video size={14} />
                    Highlight Reel
                  </a>
                )}
              </div>
            </div>

            {(fighter.credentials || fighter.licenseDocument || fighter.medicalCertificate) && (
              <div className="bg-[#07091D] p-4 rounded-lg">
                <h3 className="font-bold text-white mb-3">Documents</h3>
                <div className="space-y-2 text-sm">
                  {fighter.credentials && (
                    <div>
                      <span className="text-gray-400">Credentials:</span>
                      <p className="text-white">{fighter.credentials}</p>
                    </div>
                  )}
                  {fighter.licenseDocument && (
                    <a href={fighter.licenseDocument} target="_blank" rel="noopener noreferrer" 
                       className="flex items-center gap-2 text-blue-400 hover:text-blue-300">
                      <ExternalLink size={14} />
                      License Document
                    </a>
                  )}
                  {fighter.medicalCertificate && (
                    <a href={fighter.medicalCertificate} target="_blank" rel="noopener noreferrer" 
                       className="flex items-center gap-2 text-green-400 hover:text-green-300">
                      <ExternalLink size={14} />
                      Medical Certificate
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}