'use client'

import { Settings } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-[60px] border-b border-[#2a2a2a] bg-[#0a0a0a] flex items-center justify-between px-6"
    >
      <h2 className="text-lg font-semibold text-white">Assistant de Paris Sportifs</h2>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors duration-200"
        title="Paramètres"
      >
        <Settings className="w-5 h-5 text-[#a0a0a0] hover:text-white" />
      </motion.button>
    </motion.header>
  )
}


