import { prisma } from '@/lib/prisma'

export class MatchService {
    /**
     * Récupère ou crée une ligue
     */
    static async upsertLeague(data: { apiId: number; name: string; country: string; logo: string; season: number }) {
        return await prisma.league.upsert({
            where: { apiId: data.apiId },
            update: {
                name: data.name,
                country: data.country,
                logo: data.logo,
                season: data.season,
            },
            create: data,
        })
    }

    /**
     * Récupère ou crée une équipe
     */
    static async upsertTeam(data: { apiId: number; name: string; code?: string; country?: string; logo?: string }) {
        return await prisma.team.upsert({
            where: { apiId: data.apiId },
            update: {
                name: data.name,
                code: data.code,
                country: data.country,
                logo: data.logo,
            },
            create: {
                apiId: data.apiId,
                name: data.name,
                code: data.code,
                country: data.country,
                logo: data.logo,
            },
        })
    }

    /**
     * Récupère ou crée un match
     */
    static async upsertMatch(data: {
        apiId: number
        date: Date
        status: string
        leagueId: string
        homeTeamId: string
        awayTeamId: string
        homeScore?: number
        awayScore?: number
    }) {
        return await prisma.match.upsert({
            where: { apiId: data.apiId },
            update: {
                date: data.date,
                status: data.status,
                homeScore: data.homeScore,
                awayScore: data.awayScore,
            },
            create: data,
        })
    }

    /**
     * Récupère les matchs à venir
     */
    static async getUpcomingMatches(limit = 10) {
        return await prisma.match.findMany({
            where: {
                date: {
                    gte: new Date(),
                },
                status: 'SCHEDULED',
            },
            include: {
                homeTeam: true,
                awayTeam: true,
                league: true,
            },
            orderBy: {
                date: 'asc',
            },
            take: limit,
        })
    }

    /**
     * Enregistre une prédiction
     */
    static async createPrediction(data: {
        matchId: string
        type: string
        selection: string
        probability?: number
        confidence?: string
        analysis?: string
    }) {
        return await prisma.prediction.create({
            data,
        })
    }
}
