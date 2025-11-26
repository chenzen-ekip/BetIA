import { MatchService } from './matchService'

export class PredictionService {
    /**
     * Calcule la probabilité de buts selon la distribution de Poisson
     */
    static calculatePoissonProbability(lambda: number, k: number): number {
        return (Math.pow(lambda, k) * Math.exp(-lambda)) / this.factorial(k)
    }

    private static factorial(n: number): number {
        if (n === 0 || n === 1) return 1
        for (let i = n - 1; i >= 1; i--) {
            n *= i
        }
        return n
    }

    /**
     * Analyse un match pour la stratégie "Goals Only" (Over 2.5, BTTS)
     */
    static analyzeMatch(
        homeStats: { goalsFor: number; goalsAgainst: number; matchesPlayed: number },
        awayStats: { goalsFor: number; goalsAgainst: number; matchesPlayed: number },
        leagueAvgGoals: number = 2.5 // Moyenne de la ligue par défaut
    ) {
        // 1. Calculer les forces d'attaque et de défense
        const homeAttack = (homeStats.goalsFor / homeStats.matchesPlayed) / (leagueAvgGoals / 2)
        const homeDefense = (homeStats.goalsAgainst / homeStats.matchesPlayed) / (leagueAvgGoals / 2)

        const awayAttack = (awayStats.goalsFor / awayStats.matchesPlayed) / (leagueAvgGoals / 2)
        const awayDefense = (awayStats.goalsAgainst / awayStats.matchesPlayed) / (leagueAvgGoals / 2)

        // 2. Calculer les espérances de buts (Lambda)
        const homeExpectedGoals = homeAttack * awayDefense * (leagueAvgGoals / 2)
        const awayExpectedGoals = awayAttack * homeDefense * (leagueAvgGoals / 2)

        // 3. Calculer les probabilités de scores exacts (0-0 à 5-5)
        let probOver25 = 0
        let probBTTS = 0

        for (let h = 0; h <= 5; h++) {
            for (let a = 0; a <= 5; a++) {
                const probScore = this.calculatePoissonProbability(homeExpectedGoals, h) *
                    this.calculatePoissonProbability(awayExpectedGoals, a)

                if (h + a > 2.5) probOver25 += probScore
                if (h > 0 && a > 0) probBTTS += probScore
            }
        }

        return {
            homeExpectedGoals,
            awayExpectedGoals,
            probOver25,
            probBTTS,
            recommendation: this.getRecommendation(probOver25, probBTTS)
        }
    }

    private static getRecommendation(probOver25: number, probBTTS: number) {
        if (probOver25 > 0.65) {
            return {
                type: 'OVER_UNDER',
                selection: 'OVER_2.5',
                confidence: probOver25 > 0.75 ? 'HIGH' : 'MEDIUM',
                probability: probOver25
            }
        }
        if (probBTTS > 0.60) {
            return {
                type: 'BTTS',
                selection: 'YES',
                confidence: probBTTS > 0.70 ? 'HIGH' : 'MEDIUM',
                probability: probBTTS
            }
        }
        return null // Pas de recommandation forte
    }
}
