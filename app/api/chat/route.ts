import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { checkRateLimit } from '@/lib/rateLimit'
import { getMatchData } from '@/lib/football'
import {
  extractTeamName,
  extractMatchTeams,
  performWebSearch
} from '@/lib/services/searchService'
import { OpenAIService } from '@/lib/services/openAIService'
import { HistoryService } from '@/lib/services/historyService'
import { VisualScraperService, ExpertPrediction } from '@/lib/services/visualScraperService'

export async function POST(request: NextRequest) {
  try {
    // 1. Authentification & Rate Limiting
    const { userId } = await auth()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Non authentifié. Veuillez vous connecter.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const minuteLimit = await checkRateLimit(userId, 10, 60 * 1000)
    if (!minuteLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Trop de requêtes. Limite de 10 requêtes par minute atteinte.',
          retryAfter: Math.ceil((minuteLimit.resetTime - Date.now()) / 1000),
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const hourLimit = await checkRateLimit(`${userId}:hour`, 100, 60 * 60 * 1000)
    if (!hourLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Trop de requêtes. Limite de 100 requêtes par heure atteinte.',
          retryAfter: Math.ceil((hourLimit.resetTime - Date.now()) / 1000),
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 2. Parsing de la requête
    const { message, conversationHistory, conversationId: existingConversationId } = await request.json()

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 3. Vérification du Cache
    const queryHash = HistoryService.generateQueryHash(message)
    const cachedResponse = await HistoryService.getCachedResponse(queryHash)

    if (cachedResponse) {
      console.log(`✅ Cache hit pour queryHash: ${queryHash.substring(0, 8)}...`)

      // Gérer la conversation
      let conversation
      try {
        conversation = await HistoryService.getOrCreateConversation(userId, existingConversationId, message)
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Conversation non trouvée ou non autorisée' }),
          { status: 404, headers: { 'Content-Type': 'application/json' } }
        )
      }

      // Sauvegarder les messages
      await HistoryService.saveMessage(conversation.id, 'user', message.trim())
      await HistoryService.saveMessage(conversation.id, 'assistant', cachedResponse.response)

      // Streamer la réponse du cache
      const encoder = new TextEncoder()
      const cachedContent = cachedResponse.response
      const chunkSize = 20

      const readable = new ReadableStream({
        async start(controller) {
          try {
            for (let i = 0; i < cachedContent.length; i += chunkSize) {
              const chunk = cachedContent.slice(i, i + chunkSize)
              const data = JSON.stringify({ content: chunk })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
              await new Promise(resolve => setTimeout(resolve, 10))
            }
            controller.enqueue(encoder.encode('data: [DONE]\n\n'))
            controller.close()
          } catch (error) {
            console.error('Streaming error (cache):', error)
            controller.error(error)
          }
        },
      })

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
          'x-conversation-id': conversation.id,
          'x-cache-hit': 'true',
        },
      })
    }

    // 4. Analyse du message (Intent Detection)
    const detectedTeam = extractTeamName(message)
    const matchTeams = extractMatchTeams(message)
    const teamToSearch = detectedTeam || matchTeams.team1 || matchTeams.team2

    // 5. Récupération des données (Parallélisation)
    let apiFootballData: any = null
    let expertPredictions: ExpertPrediction[] = []

    if (teamToSearch) {
      const normalizedTeamName = teamToSearch
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')

      console.log(`📡 Lancement des recherches pour: "${normalizedTeamName}"`)

      // Préparation des promesses
      const apiFootballPromise = getMatchData(normalizedTeamName)
        .catch(error => {
          console.warn(`❌ Erreur API-Football pour "${teamToSearch}":`, error.message)
          return null
        })

      let expertConsensusPromise: Promise<ExpertPrediction[]> = Promise.resolve([])

      // Si on a les deux équipes, on lance le scraper tout de suite
      if (matchTeams.team1 && matchTeams.team2) {
        console.log(`🕵️‍♂️ Lancement parallèle du Visual Scraper pour ${matchTeams.team1} vs ${matchTeams.team2}`)
        expertConsensusPromise = VisualScraperService.getExpertConsensus(matchTeams.team1, matchTeams.team2)
          .catch(error => {
            console.error('Erreur Visual Scraper:', error)
            return []
          })
      }

      // Exécution parallèle
      const [apiData, expertData] = await Promise.all([
        apiFootballPromise,
        expertConsensusPromise
      ])

      apiFootballData = apiData
      expertPredictions = expertData

      // Si le scraper n'a pas tourné (car on avait qu'une seule équipe) mais qu'on a trouvé le match via API
      if (expertPredictions.length === 0 && apiFootballData && apiFootballData.match) {
        // On vérifie qu'on n'a pas déjà essayé (cas où on avait les 2 équipes mais le scraper a échoué ou rien trouvé)
        if (!matchTeams.team1 || !matchTeams.team2) {
          console.log(`🕵️‍♂️ Lancement séquentiel du Visual Scraper (après API) pour ${apiFootballData.match.homeTeam} vs ${apiFootballData.match.awayTeam}`)
          try {
            expertPredictions = await VisualScraperService.getExpertConsensus(
              apiFootballData.match.homeTeam,
              apiFootballData.match.awayTeam
            )
          } catch (error) {
            console.error('Erreur Visual Scraper (via API match):', error)
          }
        }
      }
    }

    // 6. Gestion du contexte historique
    // Pour les questions de suivi, on essaie de retrouver le contexte (équipe)
    let contextTeam: string | null = null
    if (conversationHistory && Array.isArray(conversationHistory)) {
      const recentHistory = conversationHistory.slice(-4)
      for (const msg of recentHistory) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          const team = extractTeamName(msg.content)
          if (team) {
            contextTeam = team
            break
          }
        }
      }
    }

    // 7. Recherche Web (Triangulation)
    const searchResult = await performWebSearch(message, contextTeam, conversationHistory)

    // 8. Préparation de l'historique pour OpenAI
    const currentMessageHasTeams = detectedTeam !== null || matchTeams.team1 !== null
    const filteredHistory = HistoryService.filterHistory(
      conversationHistory,
      currentMessageHasTeams,
      extractTeamName,
      extractMatchTeams
    )

    // 9. Appel OpenAI
    const stream = await OpenAIService.generateResponse(
      message,
      filteredHistory,
      searchResult,
      apiFootballData,
      expertPredictions
    )

    // 10. Gestion de la conversation et Streaming
    let conversation
    try {
      conversation = await HistoryService.getOrCreateConversation(userId, existingConversationId, message)
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Conversation non trouvée ou non autorisée' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Sauvegarder le message utilisateur (sans le contexte web)
    await HistoryService.saveMessage(conversation.id, 'user', message.trim())

    const encoder = new TextEncoder()
    let assistantResponse = ''

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              assistantResponse += content
              const data = JSON.stringify({ content })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }

          // Sauvegarder la réponse complète et mettre en cache
          if (assistantResponse.trim()) {
            await HistoryService.saveMessage(conversation.id, 'assistant', assistantResponse.trim())
            await HistoryService.cacheResponse(queryHash, assistantResponse.trim())
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          console.error('Streaming error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'x-conversation-id': conversation.id,
      },
    })

  } catch (error: any) {
    console.error('API Error:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Une erreur est survenue lors de la génération de la réponse',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
