'use client'

import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

interface ErrorMessageProps {
  message: string
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center items-center py-8"
    >
      <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl px-4 py-3 max-w-2xl">
        <AlertTriangle className="w-5 h-5 text-[#f59e0b] flex-shrink-0" />
        <p className="text-white text-sm">{message}</p>
      </div>
    </motion.div>
  )
}


