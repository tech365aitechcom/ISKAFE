'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
  Users,
  UserCheck,
  Mail,
  FileText,
  ArrowLeft,
  X,
  User,
  MapPin,
  Calendar,
  UserPlus,
} from 'lucide-react'
import Link from 'next/link'
import { API_BASE_URL } from '../../../../../../constants'
import useStore from '../../../../../../stores/useStore'
import Loader from '../../../../../_components/Loader'
import Pagination from '../../../../../_components/Pagination'
import PaginationHeader from '../../../../../_components/PaginationHeader'
import CompetitorTable from './_components/CompetitorTable'
import SearchFilters from './_components/SearchFilters'
import CompetitorDetailModal from './_components/CompetitorDetailModal'
import AddParticipantModal from './_components/AddParticipantModal'

export default function CompetitorList() {
  const params = useParams()
  const user = useStore((state) => state.user)
  const [eventId, setEventId] = useState(null)
  const [event, setEvent] = useState(null)
  const [competitors, setCompetitors] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(1)
  const [limit, setLimit] = useState(10)
  const [error, setError] = useState(null)

  // Filter states
  const [activeTab, setActiveTab] = useState('all') // all, fighters, trainers
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    ageMin: '',
    ageMax: '',
    phone: '',
    email: '',
    type: '',
    eventParticipation: false,
  })

  // Modal state
  const [selectedCompetitor, setSelectedCompetitor] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showAddParticipantModal, setShowAddParticipantModal] = useState(false)

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    pageSize: 10,
  })

  useEffect(() => {
    if (params?.id) {
      setEventId(params.id)
      fetchEvent(params.id)
      fetchCompetitors(params.id, currentPage)
    }
  }, [params, activeTab, searchTerm, filters, currentPage, limit])

  const fetchEvent = async (id) => {
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

  const fetchCompetitors = async (id, page = 1) => {
    try {
      setLoading(true)

      // Build query parameters - only use working backend filters
      const queryParams = new URLSearchParams()

      // Only add filters that work on the backend
      // Priority: Advanced filter type > Tab filter > No filter
      if (filters.type) {
        queryParams.append('registrationType', filters.type)
      } else if (activeTab === 'fighters') {
        queryParams.append('registrationType', 'fighter')
      } else if (activeTab === 'trainers') {
        queryParams.append('registrationType', 'trainer')
      }
      if (filters.eventParticipation) queryParams.append('participated', 'true')
      queryParams.append('page', page.toString())
      queryParams.append('limit', limit.toString())

      const response = await fetch(
        `${API_BASE_URL}/registrations/event/${id}?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      )

      console.log('API Response Status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('API Response Data:', data)
        if (data.success) {
          let allItems = data.data.items || []
          let pagination = data.data.pagination
          console.log('Raw API competitors:', allItems.length)
          let filteredItems = allItems

          // Search filter (name, email, phone)
          if (searchTerm && searchTerm.trim()) {
            console.log('Applying search filter for:', searchTerm)
            const searchLower = searchTerm.trim().toLowerCase()
            const beforeCount = filteredItems.length

            filteredItems = filteredItems.filter((competitor) => {
              const fullName = `${competitor.firstName || ''} ${
                competitor.lastName || ''
              }`.toLowerCase()
              const email = (competitor.email || '').toLowerCase()
              const phone = (competitor.phoneNumber || '').replace(/\D/g, '') // Remove non-digits for phone search
              const searchPhone = searchTerm.replace(/\D/g, '')

              const matches =
                fullName.includes(searchLower) ||
                email.includes(searchLower) ||
                (searchPhone && phone.includes(searchPhone))

              if (matches) {
                console.log(`✓ Search match: ${fullName} (${email})`)
              }

              return matches
            })

            console.log(
              `Search filter: ${beforeCount} → ${filteredItems.length}`
            )
          }

          // Email filter
          if (filters.email && filters.email.trim()) {
            console.log('Applying email filter for:', filters.email)
            const emailFilter = filters.email.trim().toLowerCase()
            const beforeCount = filteredItems.length

            filteredItems = filteredItems.filter((competitor) => {
              const matches = (competitor.email || '')
                .toLowerCase()
                .includes(emailFilter)
              if (matches) {
                console.log(`✓ Email match: ${competitor.email}`)
              }
              return matches
            })

            console.log(
              `Email filter: ${beforeCount} → ${filteredItems.length}`
            )
          }

          // Phone filter
          if (filters.phone && filters.phone.trim()) {
            console.log('Applying phone filter for:', filters.phone)
            const phoneFilter = filters.phone.replace(/\D/g, '') // Remove non-digits
            const beforeCount = filteredItems.length

            filteredItems = filteredItems.filter((competitor) => {
              const phone = (competitor.phoneNumber || '').replace(/\D/g, '')
              const matches = phone.includes(phoneFilter)
              if (matches) {
                console.log(
                  `✓ Phone match: ${competitor.phoneNumber} → ${phone}`
                )
              }
              return matches
            })

            console.log(
              `Phone filter: ${beforeCount} → ${filteredItems.length}`
            )
          }

          // Age filter
          if (filters.ageMin || filters.ageMax) {
            console.log('Applying age filter:', {
              ageMin: filters.ageMin,
              ageMax: filters.ageMax,
            })
            const beforeCount = filteredItems.length

            filteredItems = filteredItems.filter((competitor) => {
              const age = calculateAge(competitor.dateOfBirth)
              if (age === 'N/A' || isNaN(age)) return false

              let matchesAge = true
              if (filters.ageMin && age < parseInt(filters.ageMin))
                matchesAge = false
              if (filters.ageMax && age > parseInt(filters.ageMax))
                matchesAge = false

              if (matchesAge) {
                console.log(
                  `✓ Age match: ${competitor.firstName} ${competitor.lastName} (age ${age})`
                )
              }

              return matchesAge
            })

            console.log(`Age filter: ${beforeCount} → ${filteredItems.length}`)
          }

          console.log('Filtered competitors:', filteredItems.length)
          console.log('Applied filters:', {
            searchTerm: searchTerm,
            email: filters.email,
            phone: filters.phone,
            ageMin: filters.ageMin,
            ageMax: filters.ageMax,
          })

          setCompetitors(filteredItems)
          setTotalPages(pagination.totalPages)
          setTotalItems(pagination.totalItems)
          setPagination({
            currentPage: page,
            totalPages: pagination.totalPages,
            totalItems: pagination.totalItems,
            pageSize: limit,
          })
        } else {
          console.log('API returned unsuccessful response')
          setCompetitors([])
        }
      } else {
        console.log('API request failed with status:', response.status)
        setCompetitors([])
      }
    } catch (err) {
      console.error('Error fetching competitors:', err)
      setError(err.message)
      setCompetitors([])
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A'
    const birth = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--
    }

    return age
  }

  const handleViewRegistration = (competitor) => {
    setSelectedCompetitor(competitor)
    setShowDetailModal(true)
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setCurrentPage(1)
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    setCurrentPage(1)
  }

  const handleFilterChange = (newFilters) => {
    Object.keys(newFilters).forEach((key) => {
      if (filters[key] !== newFilters[key]) {
        console.log(`  - ${key}: "${filters[key]}" → "${newFilters[key]}"`)
      }
    })

    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleParticipantAdded = () => {
    setShowAddParticipantModal(false)
    if (eventId) {
      fetchCompetitors(eventId)
    }
  }

  if (loading && competitors.length === 0) {
    return (
      <div className='flex items-center justify-center h-screen w-full bg-[#07091D]'>
        <Loader />
      </div>
    )
  }

  return (
    <div className='text-white p-8 relative flex justify-center overflow-hidden'>
      <div
        className='absolute -left-10 top-1/2 transform -translate-y-1/2 w-60 h-96 rounded-full opacity-70 blur-xl'
        style={{
          background:
            'linear-gradient(317.9deg, #6F113E 13.43%, rgba(111, 17, 62, 0) 93.61%)',
        }}
      ></div>

      <div className='bg-[#0B1739] bg-opacity-80 rounded-lg p-10 shadow-lg w-full z-50'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-4'>
            <Link href={`/admin/events/view/${eventId}`}>
              <button className='mr-2 hover:bg-gray-700 p-2 rounded'>
                <ArrowLeft className='h-6 w-6' />
              </button>
            </Link>
            <div>
              <h1 className='text-2xl font-bold'>Competitor List</h1>
              {event && (
                <p className='text-sm text-gray-300'>
                  {event.name} (
                  {event.startDate
                    ? new Date(event.startDate).toLocaleDateString()
                    : 'Date not set'}
                  )
                </p>
              )}
            </div>
          </div>

          {/* Toolbar Actions */}
          <div className='flex items-center gap-3'>
            <button
              onClick={() => setShowAddParticipantModal(true)}
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors'
            >
              <UserPlus size={16} />
              Add Participant to Event
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className='flex border border-[#797979] px-2 py-1 rounded-md w-fit mb-6'>
          {[
            { key: 'all', label: 'All Competitors', icon: Users },
            { key: 'fighters', label: 'Fighters Only', icon: UserCheck },
            { key: 'trainers', label: 'Trainers Only', icon: Users },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === tab.key ? 'bg-[#2E3094] shadow-md' : ''
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <SearchFilters
          searchTerm={searchTerm}
          filters={filters}
          onSearchChange={handleSearch}
          onFilterChange={handleFilterChange}
        />

        {/* Results Display - Toggle between table and card view based on search/filter activity */}
        {(searchTerm ||
          Object.values(filters).some(
            (value) => value !== '' && value !== false
          )) &&
        !loading ? (
          /* Detailed Card View for Search Results */
          <div className='space-y-4'>
            {competitors.length === 0 ? (
              <div className='text-center py-12'>
                <Users size={48} className='mx-auto mb-4 text-gray-600' />
                <p className='text-gray-400 mb-2'>
                  No participants found matching your criteria
                </p>
                <p className='text-sm text-gray-500'>
                  Try adjusting your search terms or filters
                </p>
              </div>
            ) : (
              competitors.map((competitor, index) => {
                const age = calculateAge(competitor.dateOfBirth)
                const location =
                  [competitor.city, competitor.state, competitor.country]
                    .filter(Boolean)
                    .join(', ') || 'Location not provided'

                return (
                  <div
                    key={competitor._id || index}
                    className='bg-[#0A1330] border border-gray-600 rounded-lg p-4 hover:bg-[#0D1640] transition-colors'
                  >
                    <div className='flex items-center gap-4'>
                      {/* Thumbnail */}
                      <div className='flex-shrink-0'>
                        {competitor.profilePhoto ? (
                          <img
                            src={competitor.profilePhoto}
                            alt={`${competitor.firstName} ${competitor.lastName}`}
                            className='w-16 h-16 rounded-full object-cover border-2 border-gray-600'
                          />
                        ) : (
                          <div className='w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-gray-600 flex items-center justify-center'>
                            <User className='w-8 h-8 text-gray-300' />
                          </div>
                        )}
                      </div>

                      {/* Main Content */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-start justify-between'>
                          <div className='flex-1'>
                            {/* Name with Link */}
                            <button
                              onClick={() => handleViewRegistration(competitor)}
                              className='text-left hover:text-blue-300 transition-colors group'
                            >
                              <h3 className='text-lg font-semibold text-blue-400 group-hover:underline'>
                                {competitor.firstName} {competitor.lastName}
                              </h3>
                            </button>

                            {/* Auto-fill Info (Type, Status) */}
                            <div className='flex items-center gap-3 mt-1'>
                              <span className='text-sm text-gray-300 bg-gray-700 px-2 py-1 rounded'>
                                {competitor.registrationType
                                  ?.charAt(0)
                                  .toUpperCase() +
                                  competitor.registrationType?.slice(1)}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${
                                  competitor.status === 'Approved'
                                    ? 'bg-green-500/20 text-green-400'
                                    : competitor.status === 'Pending'
                                    ? 'bg-yellow-500/20 text-yellow-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}
                              >
                                {competitor.status}
                              </span>
                            </div>

                            {/* Location and Age */}
                            <div className='flex items-center gap-4 mt-2 text-sm text-gray-400'>
                              <div className='flex items-center gap-1'>
                                <MapPin size={14} />
                                <span
                                  className='truncate max-w-xs'
                                  title={location}
                                >
                                  {location}
                                </span>
                              </div>
                              <div className='flex items-center gap-1'>
                                <Calendar size={14} />
                                <span>Age: {age}</span>
                              </div>
                            </div>

                            {/* Email */}
                            <div className='flex items-center gap-1 mt-1 text-sm text-gray-400'>
                              <Mail size={14} />
                              <span
                                className='truncate max-w-sm'
                                title={competitor.email}
                              >
                                {competitor.email}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className='flex items-center gap-2 ml-4'>
                            <button
                              onClick={() => handleViewRegistration(competitor)}
                              className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors flex items-center gap-2'
                            >
                              <FileText size={16} />
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        ) : (
          /* Default Table View */
          <CompetitorTable
            competitors={competitors}
            calculateAge={calculateAge}
            onViewRegistration={handleViewRegistration}
            loading={loading}
            limit={limit}
            setLimit={setLimit}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalItems={totalItems}
          />
        )}

        {/* Error Display */}
        {error && (
          <div className='mb-4 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg'>
            <p className='text-red-400'>Error: {error}</p>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedCompetitor && (
          <CompetitorDetailModal
            competitor={selectedCompetitor}
            onClose={() => {
              setShowDetailModal(false)
              setSelectedCompetitor(null)
            }}
            calculateAge={calculateAge}
          />
        )}

        {/* Add Participant Modal */}
        {showAddParticipantModal && (
          <AddParticipantModal
            isOpen={showAddParticipantModal}
            onClose={() => setShowAddParticipantModal(false)}
            eventId={eventId}
            onParticipantAdded={handleParticipantAdded}
          />
        )}
      </div>
    </div>
  )
}
