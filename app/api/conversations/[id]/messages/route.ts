import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// POST - Ajouter un message à une conversation
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { role, content } = await request.json()

    if (!role || !['user', 'assistant'].includes(role)) {
      return NextResponse.json(
        { error: 'Role invalide (doit être "user" ou "assistant")' },
        { status: 400 }
      )
    }

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Contenu requis' },
        { status: 400 }
      )
    }

    // Vérifier que la conversation appartient à l'utilisateur
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.id,
        userId,
      },
    })

    if (!conversation) {
      return NextResponse.json(
        { error: 'Conversation non trouvée' },
        { status: 404 }
      )
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        conversationId: params.id,
        role,
        content: content.trim(),
      },
    })

    // Mettre à jour la date de modification de la conversation
    await prisma.conversation.update({
      where: {
        id: params.id,
      },
      data: {
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ message })
  } catch (error: any) {
    console.error('Erreur POST /api/conversations/[id]/messages:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

