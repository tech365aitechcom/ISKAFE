'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'

export default function CustomDialog({ open, onOpenChange, title, children }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className='bg-[#1b0c2e] p-0 text-white w-full'
        style={{ maxWidth: '1000px' }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
