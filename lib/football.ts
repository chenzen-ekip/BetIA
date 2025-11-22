/**
 * API-Football Integration via RapidAPI
 * Fournit des données officielles sur les équipes, matchs, blessures et cotes
 */

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY
const RAPIDAPI_HOST = 'api-football-v1.p.rapidapi.com'
const BASE_URL = 'https://api-football-v1.p.rapidapi.com/v3'

interface Team {
  id: number
  name: string
  logo: string
}

interface Fixture {
  id: number
  date: string
  teams: {
    home: { id: number; name: string; logo: string }
    away: { id: number; name: string; logo: string }
  }
  league: {
    id: number
    name: string
    country: string
  }
  score: {
    home: number | null
    away: number | null
  }
}

interface Injury {
  player: {
    id: number
    name: string
  }
  team: {
    id: number
    name: string
  }
  fixture: {
    id: number
  }
  type: string
  reason: string
}

interface Odds {
  bookmaker: {
    id: number
    name: string
  }
  bets: Array<{
    id: number
    name: string
    values: Array<{
      value: string
      odd: string
    }>
  }>
}

interface MatchData {
  match: {
    id: number
    date: string
    homeTeam: string
    awayTeam: string
    league: string
    country: string
  }
  odds: {
    homeWin: string | null
    draw: string | null
    awayWin: string | null
    over25: string | null
    under25: string | null
  }
  injuries: Array<{
    team: string
    player: string
    type: string
    reason: string
  }>
  status: 'upcoming' | 'finished' | 'live'
}

/**
 * Effectue une requête à l'API-Football via RapidAPI
 */
async function apiRequest(endpoint: string): Promise<any> {
  if (!RAPIDAPI_KEY) {
    console.warn('RAPIDAPI_KEY non configurée')
    return null
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
      },
    })

    if (!response.ok) {
      console.warn(`API-Football erreur ${response.status}: ${response.statusText}`)
      return null
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    console.warn(`Erreur API-Football (${endpoint}):`, error.message)
    return null
  }
}

/**
 * Cherche l'ID d'une équipe via l'endpoint /teams
 * @param query Nom de l'équipe à rechercher (ex: "Bayern Munich", "PSG")
 * @returns L'ID de l'équipe ou null si non trouvée
 */
export async function searchTeam(query: string): Promise<number | null> {
  try {
    // Nettoyer la requête (enlever accents, normaliser)
    const cleanQuery = query
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

    // Chercher l'équipe
    const data = await apiRequest(`/teams?search=${encodeURIComponent(cleanQuery)}`)

    if (!data || !data.response || data.response.length === 0) {
      return null
    }

    // Prendre le premier résultat (le plus probable)
    const team = data.response[0].team
    return team.id
  } catch (error: any) {
    console.warn(`Erreur searchTeam pour "${query}":`, error.message)
    return null
  }
}

/**
 * Trouve le prochain match d'une équipe
 * @param teamId ID de l'équipe
 * @returns Les détails du prochain match ou null
 */
export async function getNextFixture(teamId: number): Promise<Fixture | null> {
  try {
    const data = await apiRequest(`/fixtures?team=${teamId}&next=1`)

    if (!data || !data.response || data.response.length === 0) {
      return null
    }

    const fixture = data.response[0].fixture
    const teams = data.response[0].teams
    const league = data.response[0].league
    const score = data.response[0].goals

    return {
      id: fixture.id,
      date: fixture.date,
      teams: {
        home: {
          id: teams.home.id,
          name: teams.home.name,
          logo: teams.home.logo,
        },
        away: {
          id: teams.away.id,
          name: teams.away.name,
          logo: teams.away.logo,
        },
      },
      league: {
        id: league.id,
        name: league.name,
        country: league.country,
      },
      score: {
        home: score.home,
        away: score.away,
      },
    }
  } catch (error: any) {
    console.warn(`Erreur getNextFixture pour teamId ${teamId}:`, error.message)
    return null
  }
}

/**
 * Récupère les détails d'un match (blessures, cotes)
 * @param fixtureId ID du match
 * @returns Les détails du match ou null
 */
export async function getFixtureDetails(fixtureId: number): Promise<{
  injuries: Injury[]
  odds: Odds | null
} | null> {
  try {
    // Récupérer les blessures
    const injuriesData = await apiRequest(`/injuries?fixture=${fixtureId}`)
    const injuries: Injury[] = injuriesData?.response || []

    // Récupérer les cotes (premier bookmaker disponible)
    const oddsData = await apiRequest(`/odds?fixture=${fixtureId}`)
    let odds: Odds | null = null

    if (oddsData?.response && oddsData.response.length > 0) {
      // Prendre le premier bookmaker (généralement le plus fiable)
      odds = oddsData.response[0]
    }

    return {
      injuries,
      odds,
    }
  } catch (error: any) {
    console.warn(`Erreur getFixtureDetails pour fixtureId ${fixtureId}:`, error.message)
    return null
  }
}

/**
 * Fonction principale qui orchestre tout et retourne un JSON résumé
 * @param teamName Nom de l'équipe (ex: "Bayern Munich", "PSG")
 * @returns Données du match formatées ou null
 */
export async function getMatchData(teamName: string): Promise<MatchData | null> {
  try {
    // Étape 1 : Chercher l'ID de l'équipe
    const teamId = await searchTeam(teamName)

    if (!teamId) {
      console.warn(`Équipe "${teamName}" non trouvée`)
      return null
    }

    // Étape 2 : Trouver le prochain match
    const fixture = await getNextFixture(teamId)

    if (!fixture) {
      console.warn(`Aucun prochain match trouvé pour "${teamName}"`)
      return null
    }

    // Étape 3 : Récupérer les détails (blessures, cotes)
    const details = await getFixtureDetails(fixture.id)

    // Formater les cotes
    let odds = {
      homeWin: null as string | null,
      draw: null as string | null,
      awayWin: null as string | null,
      over25: null as string | null,
      under25: null as string | null,
    }

    if (details?.odds) {
      // La structure de l'API peut varier, on essaie plusieurs formats
      const oddsData = details.odds as any
      
      // Chercher les cotes 1X2 dans la structure bets
      if (oddsData.bets && Array.isArray(oddsData.bets)) {
        const matchResultBet = oddsData.bets.find((bet: any) => bet.id === 1 || bet.name === 'Match Winner')
        if (matchResultBet && matchResultBet.values) {
          matchResultBet.values.forEach((value: any) => {
            if (value.value === 'Home' || value.value === '1') odds.homeWin = String(value.odd)
            if (value.value === 'Draw' || value.value === 'X') odds.draw = String(value.odd)
            if (value.value === 'Away' || value.value === '2') odds.awayWin = String(value.odd)
          })
        }

        // Chercher les cotes Over/Under 2.5
        const totalsBet = oddsData.bets.find((bet: any) => 
          bet.id === 5 || bet.name === 'Goals Over/Under' || bet.name?.includes('Over/Under')
        )
        if (totalsBet && totalsBet.values) {
          totalsBet.values.forEach((value: any) => {
            if (value.value === 'Over 2.5' || value.value?.includes('Over 2.5')) {
              odds.over25 = String(value.odd)
            }
            if (value.value === 'Under 2.5' || value.value?.includes('Under 2.5')) {
              odds.under25 = String(value.odd)
            }
          })
        }
      }
    }

    // Formater les blessures
    const injuries = (details?.injuries || []).map((injury: any) => ({
      team: injury.team?.name || 'Unknown',
      player: injury.player?.name || 'Unknown',
      type: injury.type || 'Unknown',
      reason: injury.reason || 'Unknown',
    }))

    // Déterminer le statut du match
    const matchDate = new Date(fixture.date)
    const now = new Date()
    let status: 'upcoming' | 'finished' | 'live' = 'upcoming'

    if (fixture.score.home !== null && fixture.score.away !== null) {
      status = 'finished'
    } else if (matchDate <= now) {
      status = 'live'
    }

    return {
      match: {
        id: fixture.id,
        date: fixture.date,
        homeTeam: fixture.teams.home.name,
        awayTeam: fixture.teams.away.name,
        league: fixture.league.name,
        country: fixture.league.country,
      },
      odds,
      injuries,
      status,
    }
  } catch (error: any) {
    console.warn(`Erreur getMatchData pour "${teamName}":`, error.message)
    return null
  }
}

