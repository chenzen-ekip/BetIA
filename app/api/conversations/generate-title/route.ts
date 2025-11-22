import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { client } from '@/lib/openai'

// POST - Générer un titre pour une conversation basé sur le premier message
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { firstMessage } = await request.json()

    if (!firstMessage || typeof firstMessage !== 'string') {
      return NextResponse.json(
        { error: 'Premier message requis' },
        { status: 400 }
      )
    }

    // Générer un titre court avec OpenAI
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Tu es un assistant qui génère des titres courts et descriptifs pour des conversations sur les paris sportifs. Génère UNIQUEMENT le titre, sans guillemets, sans préfixe, maximum 50 caractères. Le titre doit être en français et décrire le sujet principal de la conversation.',
        },
        {
          role: 'user',
          content: `Génère un titre court pour cette conversation qui commence par : "${firstMessage.substring(0, 200)}"`,
        },
      ],
      max_tokens: 20,
      temperature: 0.7,
    })

    const title = completion.choices[0]?.message?.content?.trim() || 'Nouvelle conversation'

    // Limiter à 50 caractères
    const finalTitle = title.length > 50 ? title.substring(0, 47) + '...' : title

    return NextResponse.json({ title: finalTitle })
  } catch (error: any) {
    console.error('Erreur POST /api/conversations/generate-title:', error)
    // En cas d'erreur, retourner un titre par défaut
    return NextResponse.json({ title: 'Nouvelle conversation' })
  }
}

