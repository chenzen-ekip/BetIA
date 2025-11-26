import { MatchService } from '../lib/services/matchService'
import { getMatchData } from '../lib/football' // On devra probablement adapter cette fonction ou en créer une nouvelle pour l'ingestion de masse

// Ce script sera exécuté via une tâche cron ou manuellement
async function ingestDailyMatches() {
    console.log('🚀 Démarrage de l\'ingestion des matchs...')

    try {
        // 1. Récupérer les matchs du jour via API-Football
        // Note: Il faudra une fonction pour récupérer tous les matchs d'une date, pas juste un match spécifique
        // const matches = await fetchMatchesForDate(new Date())

        // Simulation de données pour l'exemple
        const matches: any[] = []

        for (const match of matches) {
            // 2. Upsert League
            const league = await MatchService.upsertLeague({
                apiId: match.league.id,
                name: match.league.name,
                country: match.league.country,
                logo: match.league.logo,
                season: match.league.season,
            })

            // 3. Upsert Teams
            const homeTeam = await MatchService.upsertTeam({
                apiId: match.teams.home.id,
                name: match.teams.home.name,
                logo: match.teams.home.logo,
            })

            const awayTeam = await MatchService.upsertTeam({
                apiId: match.teams.away.id,
                name: match.teams.away.name,
                logo: match.teams.away.logo,
            })

            // 4. Upsert Match
            await MatchService.upsertMatch({
                apiId: match.fixture.id,
                date: new Date(match.fixture.date),
                status: match.fixture.status.short,
                leagueId: league.id,
                homeTeamId: homeTeam.id,
                awayTeamId: awayTeam.id,
                homeScore: match.goals.home,
                awayScore: match.goals.away,
            })

            console.log(`✅ Match importé: ${homeTeam.name} vs ${awayTeam.name}`)
        }

        console.log('🎉 Ingestion terminée !')
    } catch (error) {
        console.error('❌ Erreur lors de l\'ingestion:', error)
    }
}

// Pour exécuter ce script, on aura besoin d'un setup spécial (ts-node ou similaire) car il utilise les imports du projet
// ingestDailyMatches()
