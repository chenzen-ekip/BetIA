import { useState, useCallback, useRef, useEffect } from 'react'
import { Message } from '@/lib/types'

interface Conversation {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: content.trim() }
    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    // Créer une nouvelle conversation si nécessaire
    let conversationId = currentConversationId
    if (!conversationId) {
      try {
        // Générer un titre basé sur le premier message
        const titleResponse = await fetch('/api/conversations/generate-title', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstMessage: content }),
        })
        const { title } = await titleResponse.json()

        // Créer la conversation
        const convResponse = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title }),
        })
        const { conversation } = await convResponse.json()
        conversationId = conversation.id
        setCurrentConversationId(conversationId)
      } catch (error) {
        console.error('Erreur création conversation:', error)
        // Continuer sans sauvegarder si erreur
      }
    }

    // Sauvegarder le message utilisateur
    if (conversationId) {
      try {
        await fetch(`/api/conversations/${conversationId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role: 'user',
            content: userMessage.content,
          }),
        })
      } catch (error) {
        console.error('Erreur sauvegarde message:', error)
      }
    }

    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages,
        }),
        signal: abortControllerRef.current.signal,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        if (response.status === 401 || response.status === 403) {
          throw new Error('Vous devez être connecté pour envoyer un message. Veuillez vous connecter via le bouton en haut à droite.')
        }
        throw new Error(errorData.error || `Erreur HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      if (!reader) {
        throw new Error('Impossible de lire la réponse')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              break
            }
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                assistantMessage += parsed.content
                setMessages((prev) => {
                  const newMessages = [...prev]
                  const lastMessage = newMessages[newMessages.length - 1]
                  if (lastMessage?.role === 'assistant') {
                    newMessages[newMessages.length - 1] = {
                      role: 'assistant',
                      content: assistantMessage,
                    }
                  } else {
                    newMessages.push({
                      role: 'assistant',
                      content: assistantMessage,
                    })
                  }
                  return newMessages
                })
              }
            } catch (e) {
              // Ignorer les erreurs de parsing
            }
          }
        }
      }

      // Sauvegarder le message assistant
      if (conversationId && assistantMessage) {
        try {
          await fetch(`/api/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              role: 'assistant',
              content: assistantMessage,
            }),
          })
        } catch (error) {
          console.error('Erreur sauvegarde message assistant:', error)
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return
      }
      console.error('Error:', error)
      const errorMessage = error.message || 'Une erreur est survenue. Veuillez réessayer.'
      setError(errorMessage)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ ${errorMessage}`,
        },
      ])
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [messages, isLoading])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
    setCurrentConversationId(null)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`)
      if (!response.ok) throw new Error('Erreur chargement conversation')
      
      const { conversation } = await response.json()
      setMessages(
        conversation.messages.map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        }))
      )
      setCurrentConversationId(conversationId)
      setError(null)
    } catch (error: any) {
      console.error('Erreur chargement conversation:', error)
      setError('Impossible de charger la conversation')
    }
  }, [])

  return {
    messages,
    isLoading,
    error,
    currentConversationId,
    sendMessage,
    clearMessages,
    loadConversation,
  }
}

