'use server'

import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/**
 * Server Action pour récupérer toutes les conversations de l'utilisateur connecté
 */
export async function getConversations() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { error: 'Non authentifié', conversations: [] }
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: 'desc', // Le plus récent en haut
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            messages: true,
          },
        },
      },
    })

    return { conversations, error: null }
  } catch (error: any) {
    console.error('Erreur getConversations:', error)
    return { error: 'Erreur serveur', conversations: [] }
  }
}

/**
 * Server Action pour récupérer une conversation spécifique avec ses messages
 */
export async function getConversation(conversationId: string) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return { error: 'Non authentifié', conversation: null }
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId, // S'assurer que la conversation appartient à l'utilisateur
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!conversation) {
      return { error: 'Conversation non trouvée', conversation: null }
    }

    return { conversation, error: null }
  } catch (error: any) {
    console.error('Erreur getConversation:', error)
    return { error: 'Erreur serveur', conversation: null }
  }
}

