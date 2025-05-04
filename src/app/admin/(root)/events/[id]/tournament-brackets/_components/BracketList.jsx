'use client'

import { ChevronDown, ChevronRight } from 'lucide-react'
import React, { useState } from 'react'
import Props from './Props'
import Fighters from './Fighters'
import BoutsAndResults from './Bouts&Results'

export default function BracketList({ brackets }) {
  const [activeTab, setActiveTab] = useState('props')
  const [expandedBracket, setExpandedBracket] = useState(brackets[0])

  const handleToggle = (button) => {
    setActiveTab(button)
  }

  const handleClose = () => {
    setExpandedBracket(null)
  }

  return (
    <div className='space-y-4'>
      {brackets.map((bracket, index) => (
        <div
          key={index}
          className='border border-[#C5C5C5] rounded-xl overflow-hidden'
        >
          <div className='p-8 border-b border-white'>
            <div className='flex justify-between items-center'>
              <div>
                <h2 className='font-medium text-xl'>{bracket.title}</h2>
                <p className='mt-2'>{bracket.subtitle}</p>
              </div>
              <span className='text-green-500 text-sm bg-[#05C16833] px-2 py-1 rounded '>
                {bracket.status}
              </span>
            </div>
          </div>
          <div className='px-8 py-5'>
            <button
              className='text-lg flex items-center'
              onClick={() => {
                setExpandedBracket(bracket)
                setActiveTab('props')
              }}
            >
              <span>Check Details</span>
              {expandedBracket.id === bracket.id ? (
                <ChevronDown />
              ) : (
                <ChevronRight />
              )}
            </button>

            {expandedBracket.id === bracket.id && (
              <>
                {/* Tabs */}
                <div className='flex border border-[#797979] px-2 py-1 rounded-md w-fit my-5'>
                  {['props', 'fighters', 'bouts&results'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => handleToggle(tab)}
                      className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${
                        activeTab === tab ? 'bg-[#2E3094] shadow-md' : ''
                      }`}
                    >
                      {tab === 'props' && 'Props'}
                      {tab === 'fighters' && 'Fighters'}
                      {tab === 'bouts&results' && 'Bouts & Results'}
                    </button>
                  ))}
                </div>

                {activeTab === 'props' ? (
                  <Props
                    expandedBracket={expandedBracket}
                    handleClose={handleClose}
                  />
                ) : activeTab === 'fighters' ? (
                  <Fighters expandedBracket={expandedBracket} />
                ) : (
                  <BoutsAndResults />
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
