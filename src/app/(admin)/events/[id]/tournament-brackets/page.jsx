import { ArrowLeft, ArrowUpDown, Trash } from 'lucide-react'
import BracketList from './_components/BracketList'
import { brackets } from '../../../../../constants/index'

export default function TournamentBrackets() {
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
        <div className=''>
          {/* Header */}
          <div className='flex items-center mb-6'>
            <button className='text-white mr-3'>
              <ArrowLeft size={20} />
            </button>
            <h1 className='text-2xl font-medium'>Tournament Brackets</h1>
            <div className='ml-auto flex space-x-2'>
              <button className='border border-white px-3 py-1 text-sm rounded flex items-center gap-1 cursor-pointer'>
                <ArrowUpDown size={14} />
                <span className='mr-1'>Reorder</span>
              </button>
              <button className='bg-[#F35050] px-3 py-1 text-sm rounded flex items-center gap-1 cursor-pointer'>
                <Trash size={14} color='#fff' />
                <span className='mr-1'>Delete</span>
              </button>
            </div>
          </div>

          {/* Brackets List */}
          <BracketList brackets={brackets} />
        </div>
      </div>
    </div>
  )
}
