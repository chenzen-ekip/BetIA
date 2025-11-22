'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useChat } from '@/hooks/useChat'

interface ChatContextType {
  messages: any[]
  isLoading: boolean
  error: string | null
  currentConversationId: string | null
  sendMessage: (content: string) => Promise<void>
  clearMessages: () => void
  loadConversation: (conversationId: string) => Promise<void>
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const chat = useChat()

  return <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within ChatProvider')
  }
  return context
}

