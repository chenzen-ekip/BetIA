'use client'

import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { buttonVariants } from '@/lib/animations'

interface InputBoxProps {
  onSend: (message: string) => void
  isLoading: boolean
}

export default function InputBox({ onSend, isLoading }: InputBoxProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    onSend(input)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <motion.textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Poser une question sur un match ou demander une analyse..."
        disabled={isLoading}
        className="flex-1 bg-[#1a1a1a] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#10a37f] focus:ring-opacity-30 border border-[#2a2a2a] transition-all duration-200 placeholder-[#707070] resize-none max-h-32 overflow-y-auto"
        rows={1}
        whileFocus={{
          boxShadow: '0 0 0 3px rgba(16, 163, 127, 0.1)',
        }}
      />
      <motion.button
        type="submit"
        disabled={isLoading || !input.trim()}
        variants={buttonVariants}
        initial="idle"
        whileHover={isLoading || !input.trim() ? "idle" : "hover"}
        whileTap={isLoading || !input.trim() ? "idle" : "tap"}
        className={`bg-[#10a37f] text-white rounded-xl px-4 py-3 transition-all duration-200 flex items-center justify-center ${
          isLoading || !input.trim()
            ? 'opacity-50 cursor-not-allowed pointer-events-none'
            : 'hover:bg-[#0d8a6f] cursor-pointer'
        }`}
        title={isLoading ? 'Envoi en cours...' : !input.trim() ? 'Tapez un message pour envoyer' : 'Envoyer'}
      >
        <Send className="w-5 h-5" />
      </motion.button>
    </form>
  )
}


