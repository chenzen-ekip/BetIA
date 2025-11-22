'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { sidebarVariants } from '@/lib/animations'
import NewChatButton from './NewChatButton'
import ConversationItem from './ConversationItem'
import { useChatContext } from '@/contexts/ChatContext'

interface Conversation {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  _count: {
    messages: number
  }
}

export default function Sidebar() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { loadConversation, clearMessages, currentConversationId } = useChatContext()

  // Charger les conversations au montage
  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/conversations')
      if (response.ok) {
        const { conversations: convs } = await response.json()
        setConversations(convs)
      }
    } catch (error) {
      console.error('Erreur chargement conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewChat = () => {
    clearMessages()
    loadConversations() // Recharger pour mettre à jour la liste
  }

  const handleConversationClick = async (conversationId: string) => {
    await loadConversation(conversationId)
    loadConversations() // Recharger pour mettre à jour la liste
  }

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        // Si on supprime la conversation actuelle, vider les messages
        if (conversationId === currentConversationId) {
          clearMessages()
        }
        loadConversations()
      }
    } catch (error) {
      console.error('Erreur suppression conversation:', error)
    }
  }

  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      className="hidden md:flex flex-col h-full w-[280px] bg-[#0a0a0a] border-r border-[#2a2a2a] p-4 gap-4"
    >
      {/* Logo/Title */}
      <div className="text-xl font-semibold text-white mb-2">
        Sports Betting
      </div>

      {/* New Chat Button */}
      <NewChatButton onNewChat={handleNewChat} />

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {isLoading ? (
          <p className="text-sm text-[#707070] text-center py-8">
            Chargement...
          </p>
        ) : conversations.length === 0 ? (
          <p className="text-sm text-[#707070] text-center py-8">
            Aucune conversation
          </p>
        ) : (
          conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              id={conv.id}
              title={conv.title}
              isActive={conv.id === currentConversationId}
              onClick={() => handleConversationClick(conv.id)}
              onDelete={() => handleDeleteConversation(conv.id)}
            />
          ))
        )}
      </div>

      {/* Settings */}
      <div className="border-t border-[#2a2a2a] pt-4 space-y-2">
        <motion.button
          whileHover={{ x: 2 }}
          className="w-full text-left text-sm text-[#a0a0a0] hover:text-white p-2 rounded transition-colors duration-200 flex items-center gap-2"
        >
          ⚙️ Paramètres
        </motion.button>
      </div>
    </motion.aside>
  )
}

