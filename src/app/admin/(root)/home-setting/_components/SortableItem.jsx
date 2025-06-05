import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

export default function SortableItem({ id, title }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className='bg-white shadow p-4 border rounded mb-2 cursor-move flex items-center justify-between'
    >
      <span className='text-black'>{title}</span>
      <span className='text-gray-400 text-sm'>☰</span>
    </div>
  )
}
