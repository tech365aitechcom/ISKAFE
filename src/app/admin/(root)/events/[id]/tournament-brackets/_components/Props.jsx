'use client'

import React, { useEffect, useState } from 'react'
import ActionButton from './ActionButton'
import { CircleCheck, Copy, RotateCcw, Trash, X } from 'lucide-react'
import InputBox from './InputBox'

export default function Props({ expandedBracket, handleClose }) {
  const [bracketName, setBracketName] = useState('')
  const [startDayNumber, setStartDayNumber] = useState('')
  const [group, setGroup] = useState('')
  const [ringNumber, setRingNumber] = useState('')
  const [bracketSequence, setBracketSequence] = useState('')
  const [boutRound, setBoutRound] = useState('')
  const [maxCompetitors, setMaxCompetitors] = useState('')

  useEffect(() => {
    if (expandedBracket) {
      setBracketName(expandedBracket.title || expandedBracket.divisionTitle || '')
      setStartDayNumber(expandedBracket.startDayNumber || '')
      setGroup(expandedBracket.group || '')
      setRingNumber(expandedBracket.ringNumber || expandedBracket.ring || '')
      setBracketSequence(expandedBracket.bracketSequence || expandedBracket.bracketNumber || '')
      setBoutRound(expandedBracket.boutRound || '')
      setMaxCompetitors(expandedBracket.maxCompetitors || expandedBracket.fighters?.length || '')
    }
  }, [expandedBracket])

  return (
    <div>
      <div className='flex justify-between items-center mb-6'>
        <div className='bg-[#00000061] p-3 rounded w-2/3 flex items-center justify-between'>
          <div className='w-full'>
            <div className='text-xs mb-1'>
              Bracket name
              <span className='text-red-500'>*</span>
            </div>
            <input
              type='text'
              value={bracketName || ''}
              onChange={(e) => setBracketName(e.target.value)}
              className='w-full bg-transparent text-white text-xl rounded py-1 focus:outline-none focus:border-white'
            />
          </div>
          <button onClick={handleClose} className='ml-2'>
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Properties Content */}
      <div className='space-y-6'>
        <div className='grid grid-cols-4 gap-6'>
          <InputBox
            label='Start on Day Number'
            required={true}
            value={startDayNumber}
            onChange={setStartDayNumber}
          />
          <InputBox label='Group' value={group} onChange={setGroup} />
          <InputBox
            label='Ring Number'
            value={ringNumber}
            onChange={setRingNumber}
          />
          <InputBox
            label='Bracket Sequence Number'
            value={bracketSequence}
            onChange={setBracketSequence}
          />
        </div>

        <div className='grid grid-cols-4 gap-6 mt-4'>
          <InputBox
            label='Bout Round Duration (sec)'
            required
            value={boutRound}
            onChange={setBoutRound}
          />
          <InputBox
            label='Max Competitors'
            required
            value={maxCompetitors}
            onChange={setMaxCompetitors}
          />
        </div>

        <div className='mt-2'>
          Note: The max competitor count for this bracket above only applies to
          online registrations. It does not affect what you can do here.
        </div>

        {/* Action Buttons */}
        <div className='flex space-x-4 my-8 justify-center'>
          <ActionButton
            icon={<CircleCheck size={14} />}
            label='Save Changes'
            bg='linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)'
          />
          <ActionButton
            icon={<Copy size={14} />}
            label='Duplicate'
            bg='#FFCA28'
          />
          <ActionButton icon={<RotateCcw size={14} />} label='Reset' border />
          <ActionButton
            icon={<Trash size={14} color='#fff' />}
            label='Delete'
            bg='#F35050'
          />
        </div>
      </div>
    </div>
  )
}
