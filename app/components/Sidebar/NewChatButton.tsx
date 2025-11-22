'use client'

import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'

interface NewChatButtonProps {
  onClick?: () => void
  onNewChat?: () => void
}

export default function NewChatButton({ onClick, onNewChat }: NewChatButtonProps) {
  const handleClick = () => {
    if (onNewChat) {
      onNewChat()
    } else if (onClick) {
      onClick()
    }
  }

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-lg p-3 transition-colors duration-200 flex items-center gap-2"
    >
      <Plus className="w-4 h-4" />
      <span>Nouvelle conversation</span>
    </motion.button>
  )
}


