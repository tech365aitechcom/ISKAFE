'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '../../../../../../../components/ui/button'
import { Search, X } from 'lucide-react'
import { API_BASE_URL } from '../../../../../../constants'

const FighterSelectionScreen = ({ eventDetails, onNext, onBack, onCancel, purchaseData }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [fighters, setFighters] = useState([])
  const [selectedFighters, setSelectedFighters] = useState(purchaseData.selectedFighters || [])
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [showAllFighters, setShowAllFighters] = useState(false)

  console.log('FighterSelectionScreen rendered with:', { eventDetails, purchaseData })

  useEffect(() => {
    // Load registered fighters for this event
    if (eventDetails?.registeredFighters) {
      console.log('Loading registered fighters:', eventDetails.registeredFighters)
      // Filter out any invalid or admin entries
      const validFighters = eventDetails.registeredFighters.filter(fighter => 
        fighter && 
        fighter.firstName && 
        fighter.lastName && 
        fighter.firstName.toLowerCase() !== 'admin' &&
        fighter.lastName.toLowerCase() !== 'admin'
      )
      setFighters(validFighters)
    }
  }, [eventDetails])

  const searchFighters = async (term) => {
    if (!term.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      // Filter from registered fighters first
      const localResults = fighters.filter(fighter => 
        `${fighter.firstName} ${fighter.lastName}`.toLowerCase().includes(term.toLowerCase())
      )
      
      setSearchResults(localResults)
    } catch (error) {
      console.error('Error searching fighters:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchFighters(searchTerm)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm])

  const getFighterUniqueId = (fighter) => {
    return fighter.fighterProfileId || fighter._id || `${fighter.firstName}-${fighter.lastName}`
  }

  const addFighter = (fighter) => {
    console.log('Adding fighter:', fighter)
    
    // Validate fighter data
    if (!fighter || !fighter.firstName || !fighter.lastName) {
      console.error('Invalid fighter data:', fighter)
      return
    }
    
    // Prevent adding admin or invalid fighters
    if (fighter.firstName.toLowerCase() === 'admin' || fighter.lastName.toLowerCase() === 'admin') {
      console.error('Cannot add admin fighter:', fighter)
      return
    }
    
    const fighterUniqueId = getFighterUniqueId(fighter)
    
    // Check if fighter is already selected using unique identifier
    const isAlreadySelected = selectedFighters.find(f => 
      getFighterUniqueId(f) === fighterUniqueId
    )
    
    if (!isAlreadySelected) {
      setSelectedFighters(prev => [...prev, fighter])
      console.log('Fighter added successfully:', fighter)
    } else {
      console.log('Fighter already selected:', fighter)
    }
    
    setSearchTerm('')
    setSearchResults([])
  }

  const removeFighter = (fighterUniqueId) => {
    console.log('Removing fighter with ID:', fighterUniqueId)
    setSelectedFighters(prev => prev.filter(f => 
      getFighterUniqueId(f) !== fighterUniqueId
    ))
  }

  const handleNext = () => {
    onNext('payment', {
      selectedFighters
    })
  }

  const handleSkip = () => {
    onNext('payment', {
      selectedFighters: []
    })
  }

  return (
    <div className="bg-[#1b0c2e] rounded-lg p-8">
      <style jsx>{`
        .fighter-scroll-container {
          -webkit-overflow-scrolling: touch;
          overflow-scrolling: touch;
        }
        
        .fighter-scroll-container::-webkit-scrollbar {
          width: 8px;
        }
        
        .fighter-scroll-container::-webkit-scrollbar-track {
          background: #1F2937;
          border-radius: 4px;
        }
        
        .fighter-scroll-container::-webkit-scrollbar-thumb {
          background: #4B5563;
          border-radius: 4px;
        }
        
        .fighter-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #6B7280;
        }
      `}</style>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Support Your Fighters</h2>
        <p className="text-gray-400">
          If you are buying tickets to see specific fighters, please add them here.
        </p>
        <p className="text-gray-500 text-sm mt-2">This step is optional</p>
      </div>

      {/* Search Box */}
      <div className="relative mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0A1330] border border-gray-600 rounded px-10 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            placeholder="Search for fighters..."
          />
        </div>
        
        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-[#0A1330] border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto fighter-scroll-container">
            {searchResults.map((fighter, index) => (
              <div
                key={`search-${getFighterUniqueId(fighter)}-${index}`}
                onClick={() => addFighter(fighter)}
                className="px-4 py-3 hover:bg-[#1b0c2e] cursor-pointer border-b border-gray-700 last:border-b-0"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{fighter.firstName} {fighter.lastName}</p>
                    <p className="text-sm text-gray-400">
                      {fighter.weightClass} • {fighter.country}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {searchTerm && searchResults.length === 0 && !loading && (
          <div className="absolute z-10 w-full mt-1 bg-[#0A1330] border border-gray-600 rounded-lg shadow-lg">
            <div className="px-4 py-3 text-gray-400 text-center">
              No fighters found matching "{searchTerm}"
            </div>
          </div>
        )}
      </div>

      {/* Selected Fighters */}
      {selectedFighters.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Selected Fighters ({selectedFighters.length})</h3>
          <div className="space-y-2">
            {selectedFighters.map((fighter, index) => (
              <div
                key={`selected-${getFighterUniqueId(fighter)}-${index}`}
                className="bg-[#0A1330] rounded-lg p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{fighter.firstName} {fighter.lastName}</p>
                  <p className="text-sm text-gray-400">
                    {fighter.weightClass} • {fighter.country}
                  </p>
                </div>
                <button
                  onClick={() => removeFighter(getFighterUniqueId(fighter))}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <X size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Registered Fighters */}
      {fighters.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">All Registered Fighters ({fighters.length})</h3>
            {fighters.length > 12 && (
              <button
                onClick={() => setShowAllFighters(!showAllFighters)}
                className="text-purple-400 hover:text-purple-300 text-sm underline"
              >
                {showAllFighters ? 'Show Less' : 'Show All'}
              </button>
            )}
          </div>
          <div className="border border-gray-600 rounded-lg bg-[#0A1330] p-2">
            <div 
              className={`fighter-scroll-container grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto ${
                showAllFighters || fighters.length <= 12 ? 'max-h-none' : 'max-h-80'
              }`}
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#4B5563 #1F2937',
                minHeight: '200px',
              }}
            >
              {fighters.map((fighter, index) => {
                const fighterUniqueId = getFighterUniqueId(fighter)
                const isSelected = selectedFighters.find(f => 
                  getFighterUniqueId(f) === fighterUniqueId
                )
                
                return (
                  <div
                    key={`all-${fighterUniqueId}-${index}`}
                    onClick={() => isSelected ? removeFighter(fighterUniqueId) : addFighter(fighter)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors border ${
                      isSelected 
                        ? 'bg-purple-600 hover:bg-purple-700 border-purple-400' 
                        : 'bg-[#1b0c2e] hover:bg-[#2a1540] border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <p className="font-medium text-sm">{fighter.firstName} {fighter.lastName}</p>
                    <p className="text-xs text-gray-400">
                      {fighter.weightClass} • {fighter.country}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="mt-2 text-center">
            <p className="text-xs text-gray-500">
              {fighters.length > 12 && !showAllFighters 
                ? 'Scroll to see more fighters, or click "Show All" above' 
                : `${fighters.length} fighter${fighters.length !== 1 ? 's' : ''} registered`}
            </p>
            {fighters.length > 12 && !showAllFighters && (
              <div className="flex items-center justify-center mt-1">
                <div className="text-purple-400 text-xs">↕️ Scroll or expand to see all</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={handleNext}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded font-medium"
        >
          Next
        </Button>
        
        <Button
          onClick={handleSkip}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded font-medium"
        >
          Skip
        </Button>
      </div>

      <div className="flex justify-center space-x-6 mt-4">
        <button
          onClick={() => {
            console.log('Back button clicked in FighterSelectionScreen')
            onBack()
          }}
          className="text-gray-400 hover:text-white underline"
        >
          Back
        </button>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white underline"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default FighterSelectionScreen