'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, X, ChevronDown } from 'lucide-react'

export default function SearchFilters({ 
  searchTerm, 
  filters, 
  onSearchChange, 
  onFilterChange 
}) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)

  // Sync localFilters with props when filters change
  useEffect(() => {
    console.log('SearchFilters: filters prop changed:', filters)
    setLocalFilters(filters)
  }, [filters])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    onSearchChange(searchTerm)
  }

  const handleFilterSubmit = () => {
    console.log('=== Applying Filters ===')
    console.log('Local filters being applied:', localFilters)
    console.log('Current form values:')
    console.log('  - ageMin:', localFilters.ageMin)
    console.log('  - ageMax:', localFilters.ageMax) 
    console.log('  - phone:', localFilters.phone)
    console.log('  - email:', localFilters.email)
    console.log('  - type:', localFilters.type)
    console.log('  - eventParticipation:', localFilters.eventParticipation)
    
    onFilterChange(localFilters)
    setShowAdvancedFilters(false)
  }

  const clearFilters = () => {
    const emptyFilters = {
      ageMin: '',
      ageMax: '',
      phone: '',
      email: '',
      type: '',
      eventParticipation: false
    }
    setLocalFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== false
  )

  return (
    <div className='mb-6 space-y-4'>
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className='relative'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => {
              console.log('Search term changed to:', e.target.value)
              onSearchChange(e.target.value)
            }}
            placeholder='Search by name, email, or phone...'
            className='w-full bg-[#0A1330] border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500'
          />
        </div>
      </form>

      {/* Filter Toggle */}
      <div className='flex items-center gap-4'>
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className='flex items-center gap-2 px-4 py-2 bg-[#0A1330] border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors'
        >
          <Filter size={16} />
          Advanced Filters
          <ChevronDown 
            size={16} 
            className={`transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} 
          />
        </button>
        
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className='flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm'
          >
            <X size={14} />
            Clear Filters
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className='bg-[#0A1330] p-6 rounded-lg border border-gray-600'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4'>
            {/* Age Range */}
            <div>
              <label className='block text-sm text-gray-300 mb-2'>Age Range</label>
              <div className='flex gap-2'>
                <input
                  type='number'
                  placeholder='Min'
                  value={localFilters.ageMin}
                  onChange={(e) => setLocalFilters({...localFilters, ageMin: e.target.value})}
                  className='w-full bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white'
                />
                <input
                  type='number'
                  placeholder='Max'
                  value={localFilters.ageMax}
                  onChange={(e) => setLocalFilters({...localFilters, ageMax: e.target.value})}
                  className='w-full bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white'
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className='block text-sm text-gray-300 mb-2'>Phone Number</label>
              <input
                type='text'
                placeholder='Search phone...'
                value={localFilters.phone}
                onChange={(e) => setLocalFilters({...localFilters, phone: e.target.value})}
                className='w-full bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white'
              />
            </div>

            {/* Email */}
            <div>
              <label className='block text-sm text-gray-300 mb-2'>Email</label>
              <input
                type='text'
                placeholder='Search email...'
                value={localFilters.email}
                onChange={(e) => setLocalFilters({...localFilters, email: e.target.value})}
                className='w-full bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white'
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className='block text-sm text-gray-300 mb-2'>Participant Type</label>
              <select
                value={localFilters.type}
                onChange={(e) => setLocalFilters({...localFilters, type: e.target.value})}
                className='w-full bg-[#0B1739] border border-gray-600 rounded px-3 py-2 text-white'
              >
                <option value=''>All Types</option>
                <option value='fighter'>Fighter</option>
                <option value='trainer'>Trainer</option>
                <option value='coach'>Coach</option>
                <option value='official'>Official</option>
              </select>
            </div>

            {/* Event Participation */}
            <div>
              <label className='block text-sm text-gray-300 mb-2'>Event Participation</label>
              <label className='flex items-center gap-2 cursor-pointer'>
                <input
                  type='checkbox'
                  checked={localFilters.eventParticipation}
                  onChange={(e) => setLocalFilters({...localFilters, eventParticipation: e.target.checked})}
                  className='rounded border-gray-600 bg-[#0B1739] text-purple-600 focus:ring-purple-500'
                />
                <span className='text-sm'>Show only participants who fought</span>
              </label>
            </div>
          </div>

          {/* Filter Actions */}
          <div className='flex gap-3'>
            <button
              onClick={handleFilterSubmit}
              className='px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors'
            >
              Apply Filters
            </button>
            <button
              onClick={() => setShowAdvancedFilters(false)}
              className='px-6 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors'
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}