import React from 'react'
import BracketCard from './BracketCard'
import { boutsAndResults } from '../../../../../../constants/index'

export default function BoutsAndResults() {
  return (
    <div className='flex gap-4'>
      {boutsAndResults.map((bout, index) => (
        <BracketCard
          key={index}
          fighter1={bout.fighters1}
          fighter2={bout.fighter2}
          roundNumber={bout.roundNumber}
        />
      ))}
    </div>
  )
}
