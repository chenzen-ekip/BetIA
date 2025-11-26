import { prisma } from '@/lib/prisma'
import { createHash } from 'crypto'

export class HistoryService {
    /**
     * Génère un hash pour le cache à partir du message utilisateur nettoyé
     */
    static generateQueryHash(message: string): string {
        const cleanedMessage = message
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ')

        return createHash('sha256').update(cleanedMessage).digest('hex')
    }

    /**
     * Récupère une réponse en cache si elle existe et n'est pas expirée
     */
    static async getCachedResponse(queryHash: string) {
        if (!prisma || !prisma.analysisCache) return null

        try {
            const cachedResponse = await prisma.analysisCache.findUnique({
                where: { queryHash },
            })

            if (cachedResponse && cachedResponse.expiresAt > new Date()) {
                return cachedResponse
            }
        } catch (error) {
            console.warn('⚠️ Erreur lors de la vérification du cache:', error)
        }
        return null
    }

    /**
     * Sauvegarde une réponse dans le cache
     */
    static async cacheResponse(queryHash: string, response: string) {
        if (!prisma || !prisma.analysisCache) return

        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + 12)

        try {
            await prisma.analysisCache.upsert({
                where: { queryHash },
                update: {
                    response,
                    expiresAt,
                    createdAt: new Date(),
                },
                create: {
                    queryHash,
                    response,
                    expiresAt,
                },
            })
        } catch (error) {
            console.error('Erreur sauvegarde cache:', error)
        }
    }

    /**
     * Gère la création ou récupération de la conversation
     */
    static async getOrCreateConversation(userId: string, conversationId: string | null, message: string) {
        if (!conversationId) {
            const title = message.substring(0, 50).trim() || 'Nouvelle conversation'
            return await prisma.conversation.create({
                data: {
                    userId,
                    title,
                },
            })
        }

        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                userId,
            },
        })

        if (!conversation) {
            throw new Error('Conversation non trouvée ou non autorisée')
        }

        return conversation
    }

    /**
     * Sauvegarde un message dans la base de données
     */
    static async saveMessage(conversationId: string, role: 'user' | 'assistant', content: string) {
        try {
            await prisma.message.create({
                data: {
                    conversationId,
                    role,
                    content,
                },
            })

            await prisma.conversation.update({
                where: { id: conversationId },
                data: { updatedAt: new Date() },
            })
        } catch (error) {
            console.error('Erreur sauvegarde message:', error)
        }
    }

    /**
     * Filtre l'historique pour ne garder que les messages pertinents
     */
    static filterHistory(
        history: any[],
        currentMessageHasTeams: boolean,
        extractTeamNameFn: (msg: string) => string | null,
        extractMatchTeamsFn: (msg: string) => { team1: string | null; team2: string | null }
    ) {
        if (!history || !Array.isArray(history) || history.length === 0) return []

        // Détecter si le message précédent mentionnait des équipes
        const lastMsg = history[history.length - 1]
        const previousMessageHadTeams = lastMsg && (
            extractTeamNameFn(lastMsg.content || '') !== null ||
            extractMatchTeamsFn(lastMsg.content || '').team1 !== null
        )

        // Logique de nettoyage du contexte :
        // - Si sujet cohérent (même type : équipes -> équipes, ou général -> général) : garder tout l'historique
        // - Si changement de sujet (équipes -> général, ou général -> équipes) : limiter à 1 seul message pour éviter le mélange
        const isSubjectChange = (currentMessageHasTeams && !previousMessageHadTeams) ||
            (!currentMessageHasTeams && previousMessageHadTeams)

        return isSubjectChange
            ? history.slice(-1)  // Changement de sujet : ne garder que le dernier message
            : history  // Sujet cohérent : garder tout l'historique
    }
}
