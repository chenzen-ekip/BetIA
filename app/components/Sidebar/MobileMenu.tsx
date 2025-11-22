'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
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

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { loadConversation, clearMessages, currentConversationId } = useChatContext()

  // Charger les conversations au montage
  useEffect(() => {
    if (isOpen) {
      loadConversations()
    }
  }, [isOpen])

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
    loadConversations()
    onClose() // Fermer le menu après avoir créé une nouvelle conversation
  }

  const handleConversationClick = async (conversationId: string) => {
    await loadConversation(conversationId)
    loadConversations()
    onClose() // Fermer le menu après avoir sélectionné une conversation
  }

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
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
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />

          {/* Menu Drawer */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-[280px] bg-[#0a0a0a] border-r border-[#2a2a2a] z-50 md:hidden flex flex-col p-4 gap-4"
          >
            {/* Header avec bouton fermer */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-xl font-semibold text-white">
                Sports Betting
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5 text-[#a0a0a0] hover:text-white" />
              </button>
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
        </>
      )}
    </AnimatePresence>
  )
}

