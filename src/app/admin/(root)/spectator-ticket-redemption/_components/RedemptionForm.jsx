import React from 'react'
import { X, Ticket, RefreshCw } from 'lucide-react'

export default function RedemptionForm({
  redeemedByScan,
  redeemCode,
  setRedeemCode,
  quantityToRedeem,
  setQuantityToRedeem,
  loading,
  handleRedeem
}) {
  return (
    <div className='mb-8'>
      <h2 className='text-lg font-medium mb-6'>
        {redeemedByScan ? 'Manual Ticket Entry' : 'Loaded Ticket Code'}
      </h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
        <div className='bg-[#00000061] p-4 rounded-lg'>
          <label className='block text-sm text-gray-400 mb-2'>
            Ticket Code:
          </label>
          <div className='flex items-center'>
            <input
              type='text'
              className='bg-transparent text-white text-lg font-medium focus:outline-none w-full'
              placeholder='Enter 4-6 digit code'
              value={redeemCode}
              onChange={(e) => setRedeemCode(e.target.value)}
              maxLength={6}
            />
            {redeemCode && (
              <button
                onClick={() => setRedeemCode('')}
                className='text-gray-400 hover:text-white ml-2'
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div className='bg-[#00000061] p-4 rounded-lg'>
          <label className='block text-sm text-gray-400 mb-2'>
            Quantity to Redeem:
          </label>
          <input
            type='number'
            min='1'
            className='bg-transparent text-white text-lg font-medium focus:outline-none w-full'
            placeholder='1'
            value={quantityToRedeem}
            onChange={(e) =>
              setQuantityToRedeem(
                Math.max(1, parseInt(e.target.value) || 1)
              )
            }
          />
        </div>
      </div>

      <button
        style={{
          background:
            'linear-gradient(128.49deg, #CB3CFF 19.86%, #7F25FB 68.34%)',
        }}
        className='text-white py-2 px-4 rounded w-full md:w-auto flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'
        onClick={handleRedeem}
        disabled={!redeemCode || loading}
      >
        {loading ? (
          <>
            <RefreshCw size={16} className='animate-spin mr-2' />
            Processing...
          </>
        ) : (
          <>
            <Ticket size={16} className='mr-2' />
            Redeem {quantityToRedeem} Ticket{quantityToRedeem > 1 ? 's' : ''}
          </>
        )}
      </button>
    </div>
  )
}