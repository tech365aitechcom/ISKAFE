import React from 'react'
import BracketCard from './BracketCard'
import { boutsAndResults } from '../../../../../../../constants'

export default function BoutsAndResults() {
  return (
    <div className='grid grid-cols-2 gap-4'>
      {boutsAndResults.map((bout, index) => {
        const isLastOddItem =
          boutsAndResults.length % 2 !== 0 &&
          index === boutsAndResults.length - 1

        return (
          <div
            key={index}
            className={
              isLastOddItem ? 'col-span-2 flex justify-center mt-10' : ''
            }
          >
            <BracketCard
              fighter1={bout.fighters1}
              fighter2={bout.fighter2}
              roundNumber={bout.roundNumber}
            />
          </div>
        )
      })}
    </div>
  )
}
