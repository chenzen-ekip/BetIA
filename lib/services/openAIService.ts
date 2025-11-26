import { client, SYSTEM_PROMPT } from '@/lib/openai'
import { SearchResult } from './searchService'

export class OpenAIService {
    static async generateResponse(
        message: string,
        history: any[],
        searchResult: SearchResult,
        apiFootballData: any = null,
        expertPredictions: any[] = []
    ) {
        // Créer la date actuelle au format lisible
        const today = new Date()
        const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
        const currentDate = `${daysOfWeek[today.getDay()]} ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`

        // Construire le prompt système avec la date et les données API-Football
        let apiFootballSection = ''
        if (apiFootballData) {
            // Formater les xG
            const xgHome = apiFootballData.advancedStats?.xg?.home
            const xgAway = apiFootballData.advancedStats?.xg?.away
            const xgSection = (xgHome !== null || xgAway !== null)
                ? `- xG ${apiFootballData.match.homeTeam} : ${xgHome !== null ? xgHome.toFixed(2) : 'N/A'}
- xG ${apiFootballData.match.awayTeam} : ${xgAway !== null ? xgAway.toFixed(2) : 'N/A'}`
                : 'xG non disponibles pour ce match'

            // Formater les stats de la saison
            const homeStats = apiFootballData.advancedStats?.teamStats?.home
            const awayStats = apiFootballData.advancedStats?.teamStats?.away

            const homeStatsSection = homeStats && homeStats.matchesPlayed !== null
                ? `${apiFootballData.match.homeTeam} (${homeStats.matchesPlayed} matchs) :
  • Buts marqués/match : ${homeStats.goalsForPerMatch !== null ? homeStats.goalsForPerMatch.toFixed(2) : 'N/A'}
  • Buts encaissés/match : ${homeStats.goalsAgainstPerMatch !== null ? homeStats.goalsAgainstPerMatch.toFixed(2) : 'N/A'}
  • Clean sheets : ${homeStats.cleanSheets !== null ? homeStats.cleanSheets : 'N/A'}`
                : `Stats de saison non disponibles pour ${apiFootballData.match.homeTeam}`

            const awayStatsSection = awayStats && awayStats.matchesPlayed !== null
                ? `${apiFootballData.match.awayTeam} (${awayStats.matchesPlayed} matchs) :
  • Buts marqués/match : ${awayStats.goalsForPerMatch !== null ? awayStats.goalsForPerMatch.toFixed(2) : 'N/A'}
  • Buts encaissés/match : ${awayStats.goalsAgainstPerMatch !== null ? awayStats.goalsAgainstPerMatch.toFixed(2) : 'N/A'}
  • Clean sheets : ${awayStats.cleanSheets !== null ? awayStats.cleanSheets : 'N/A'}`
                : `Stats de saison non disponibles pour ${apiFootballData.match.awayTeam}`

            // Formater les confrontations H2H
            const h2hMatches = apiFootballData.advancedStats?.h2h || []
            const h2hSection = h2hMatches.length > 0
                ? h2hMatches.map((match: any) => {
                    const score = match.homeScore !== null && match.awayScore !== null
                        ? `${match.homeScore}-${match.awayScore}`
                        : 'Score non disponible'
                    return `- ${match.date.substring(0, 10)} : ${match.homeTeam} ${score} ${match.awayTeam}`
                }).join('\n')
                : 'Aucune confrontation directe récente trouvée'

            apiFootballSection = `

--- DONNÉES OFFICIELLES API-FOOTBALL (PRIORITAIRES) ---

⚠️ ATTENTION : Ces données proviennent de l'API officielle API-Football. Elles ÉCRASENT toutes les recherches Google/web pour ce match. Base tes calculs de probabilités et tes recommandations sur ces chiffres officiels.

MATCH :
- Date : ${apiFootballData.match.date}
- ${apiFootballData.match.homeTeam} vs ${apiFootballData.match.awayTeam}
- Compétition : ${apiFootballData.match.league} (${apiFootballData.match.country})
- Statut : ${apiFootballData.status === 'upcoming' ? 'À venir' : apiFootballData.status === 'live' ? 'En cours' : 'Terminé'}

COTES OFFICIELLES :
${apiFootballData.odds.homeWin ? `- Victoire ${apiFootballData.match.homeTeam} : ${apiFootballData.odds.homeWin}` : ''}
${apiFootballData.odds.draw ? `- Match nul : ${apiFootballData.odds.draw}` : ''}
${apiFootballData.odds.awayWin ? `- Victoire ${apiFootballData.match.awayTeam} : ${apiFootballData.odds.awayWin}` : ''}
${apiFootballData.odds.over25 ? `- Plus de 2.5 buts : ${apiFootballData.odds.over25}` : ''}
${apiFootballData.odds.under25 ? `- Moins de 2.5 buts : ${apiFootballData.odds.under25}` : ''}

📊 STATISTIQUES AVANCÉES (FotMob-style) :

EXPECTED GOALS (xG) :
${xgSection}

STATS DE LA SAISON (Forme) :
${homeStatsSection}

${awayStatsSection}

HISTORIQUE H2H (5 dernières confrontations) :
${h2hSection}

BLESSURES CONFIRMÉES :
${apiFootballData.injuries.length > 0
                    ? apiFootballData.injuries.map((inj: any) => `- ${inj.player} (${inj.team}) : ${inj.reason}`).join('\n')
                    : 'Aucune blessure confirmée dans les données officielles.'}

---
`
        }

        // Ajouter la section Experts
        let expertSection = ''
        if (expertPredictions && expertPredictions.length > 0) {
            expertSection = `
--- AVIS DES EXPERTS MONDIAUX ---
${expertPredictions.map(p => `${p.site} : ${p.prediction}`).join('\n')}

--- CONSIGNE DE SYNTHÈSE ---
Ta mission est de faire la synthèse.
1. Si ton analyse statistique (API-Football) correspond à l'avis des experts -> C'est un BET EN OR (Confiance Max).
2. Si les experts ne sont pas d'accord entre eux -> Sois prudent.
3. Si tes stats contredisent les experts -> Fais confiance à tes stats mais mentionne le désaccord.

IMPORTANT : Dans ta réponse finale, ajoute TOUJOURS une petite ligne à la fin :
"👀 **L'œil des Experts :** [Résumé de ce que disent Forebet/WinDrawWin/etc. ex: Forebet et WinDrawWin confirment ce choix.]"
`
        }

        const systemPromptWithDate = `NOUS SOMMES LE : ${currentDate}.

RÈGLE ABSOLUE : Tout match ou article trouvé via la recherche qui date de plus de 7 jours doit être IGNORÉ. Ne propose JAMAIS un match qui a déjà eu lieu. Si un match mentionné dans les résultats de recherche a une date antérieure à aujourd'hui, IGNORE-LE COMPLÈTEMENT.

${apiFootballSection}

${expertSection}

${SYSTEM_PROMPT}`

        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
            { role: 'system', content: systemPromptWithDate },
        ]

        // Ajouter l'historique (déjà filtré par le service d'historique ou le contrôleur)
        if (history && Array.isArray(history)) {
            history.forEach((msg: { role: string; content: string }) => {
                if (msg.role === 'user' || msg.role === 'assistant') {
                    messages.push({
                        role: msg.role as 'user' | 'assistant',
                        content: msg.content,
                    })
                }
            })
        }

        // Ajouter le message utilisateur avec le contexte de recherche
        const userMessage = searchResult.context
            ? `${message}\n\n${searchResult.context}`
            : message

        messages.push({ role: 'user', content: userMessage })

        // Créer le stream OpenAI
        return await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: messages as any,
            temperature: 0.0,
            seed: 1234,
            max_tokens: 800,
            top_p: 1.0,
            stream: true,
        })
    }
}
