'use client'

import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

interface ConversationItemProps {
  id: string
  title: string
  preview?: string
  isActive?: boolean
  onClick?: () => void
  onDelete?: () => void
}

export default function ConversationItem({
  title,
  preview,
  isActive = false,
  onClick,
  onDelete,
}: ConversationItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDelete && confirm('Supprimer cette conversation ?')) {
      onDelete()
    }
  }

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ x: 4 }}
      className={`w-full text-left p-3 rounded-lg transition-colors duration-200 group relative ${
        isActive
          ? 'bg-[#1a1a1a] border border-[#10a37f]'
          : 'hover:bg-[#1a1a1a]'
      }`}
    >
      <div className="text-sm font-medium text-white truncate pr-8">{title}</div>
      {preview && (
        <div className="text-xs text-[#707070] truncate mt-1">{preview}</div>
      )}
      {onDelete && isHovered && (
        <button
          onClick={handleDelete}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-[#2a2a2a] opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Supprimer"
        >
          <Trash2 className="w-4 h-4 text-[#707070] hover:text-red-500" />
        </button>
      )}
    </motion.button>
  )
}


