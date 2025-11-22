'use client'

import { useEffect, useRef } from 'react'
import { Message as MessageType } from '@/lib/types'
import Message from './Message'
import TypingIndicator from './TypingIndicator'

interface MessageListProps {
  messages: MessageType[]
  isLoading: boolean
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-[#a0a0a0]">
          <h3 className="text-2xl font-bold mb-2 text-white">Bienvenue !</h3>
          <p className="mb-4">Posez une question sur un match ou demandez une analyse</p>
          <div className="text-sm space-y-1">
            <p className="text-[#707070]">Exemples :</p>
            <p className="text-[#707070]">• "Analyse PSG vs Lyon samedi"</p>
            <p className="text-[#707070]">• "Quel est le meilleur pari pour Manchester United vs Liverpool ?"</p>
            <p className="text-[#707070]">• "Quels sont les meilleurs matchs de ce weekend ?"</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {messages.map((msg, idx) => (
        <Message key={idx} message={msg} index={idx} />
      ))}
      {isLoading && <TypingIndicator />}
      <div ref={messagesEndRef} />
    </div>
  )
}


