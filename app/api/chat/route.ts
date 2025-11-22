import { NextRequest } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { client, SYSTEM_PROMPT } from '@/lib/openai'
import { searchWithSerper, formatSearchResults, formatSearchResultsWithTriangulation, searchTransfermarktComplete } from '@/lib/serper'
import { getMatchData } from '@/lib/football'
import { checkRateLimit } from '@/lib/rateLimit'

/**
 * Extrait le nom d'équipe du message pour les recherches ciblées
 */
function extractTeamName(message: string): string | null {
  // Normaliser le message : enlever accents, convertir en minuscules
  const normalizedMessage = message
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever accents
    .replace(/[^\w\s]/g, ' ') // Remplacer ponctuation par espaces
  
  const teams = [
    // Ligue 1
    'psg', 'paris saint-germain', 'paris', 'paris sg',
    'lyon', 'olympique lyonnais', 'ol',
    'marseille', 'om', 'olympique marseille',
    'monaco', 'as monaco',
    'lille', 'losc',
    'rennes', 'stade rennais',
    'nice', 'ogc nice',
    'lens', 'rc lens',
    'nantes', 'fc nantes',
    'toulouse', 'tfc',
    'reims', 'stade de reims',
    'le havre', 'havre', 'hac',
    'auxerre', 'aja',
    'strasbourg', 'rc strasbourg',
    'lorient', 'fc lorient',
    'montpellier', 'mhsc',
    'clermont', 'clermont foot',
    'metz', 'fc metz',
    'brest', 'stade brestois',
    
    // Liga
    'barcelona', 'barca', 'fc barcelona',
    'real madrid', 'real', 'madrid',
    'atletico madrid', 'atletico', 'atletico de madrid',
    'sevilla', 'sevilla fc',
    'valencia', 'valencia cf',
    'villarreal', 'villarreal cf',
    'real sociedad', 'sociedad',
    'athletic bilbao', 'athletic', 'bilbao',
    'betis', 'real betis',
    
    // Premier League
    'manchester united', 'manchester city', 'manchester', 'man utd', 'man city',
    'liverpool', 'lfc',
    'arsenal', 'afc',
    'chelsea', 'cfc',
    'tottenham', 'spurs', 'tottenham hotspur',
    'newcastle', 'newcastle united',
    'brighton', 'brighton & hove albion',
    'west ham', 'west ham united',
    'aston villa', 'villa',
    'crystal palace', 'palace',
    
    // Bundesliga
    'bayern', 'bayern munich', 'bayern munchen', 'fc bayern',
    'dortmund', 'borussia dortmund', 'bvb',
    'leipzig', 'rb leipzig',
    'leverkusen', 'bayer leverkusen',
    'fribourg', 'sc freiburg', 'freiburg',
    'eintracht frankfurt', 'frankfurt',
    'wolfsburg', 'vfl wolfsburg',
    'hoffenheim', 'tsg hoffenheim',
    'union berlin', 'union',
    'gladbach', 'borussia monchengladbach',
    
    // Serie A
    'juventus', 'juve', 'juventus turin',
    'milan', 'ac milan',
    'inter', 'inter milan', 'inter milano',
    'napoli', 'ssc napoli',
    'roma', 'as roma',
    'atalanta', 'atalanta bergamo',
    'lazio', 'ss lazio',
    'fiorentina', 'acf fiorentina',
    
    // Autres
    'porto', 'fc porto',
    'benfica', 'sl benfica',
    'ajax', 'ajax amsterdam',
    'psv', 'psv eindhoven',
    'celtic', 'celtic glasgow',
    'rangers', 'rangers fc'
  ]
  
  // Chercher d'abord les noms complets (plus longs) pour éviter les faux positifs
  const sortedTeams = teams.sort((a, b) => b.length - a.length)
  
  for (const team of sortedTeams) {
    // Normaliser aussi le nom de l'équipe
    const normalizedTeam = team
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    
    if (normalizedMessage.includes(normalizedTeam)) {
      return team
    }
  }
  
  return null
}

/**
 * Extrait les noms des deux équipes d'un match (vs, contre, etc.)
 */
function extractMatchTeams(message: string): { team1: string | null; team2: string | null } {
  // Normaliser le message
  const normalizedMessage = message
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
  
  // Utiliser la même liste d'équipes que extractTeamName
  const teams = [
    // Ligue 1
    'psg', 'paris saint-germain', 'paris', 'paris sg',
    'lyon', 'olympique lyonnais', 'ol',
    'marseille', 'om', 'olympique marseille',
    'monaco', 'as monaco',
    'lille', 'losc',
    'rennes', 'stade rennais',
    'nice', 'ogc nice',
    'lens', 'rc lens',
    'nantes', 'fc nantes',
    'toulouse', 'tfc',
    'reims', 'stade de reims',
    'le havre', 'havre', 'hac',
    'auxerre', 'aja',
    'strasbourg', 'rc strasbourg',
    'lorient', 'fc lorient',
    'montpellier', 'mhsc',
    'clermont', 'clermont foot',
    'metz', 'fc metz',
    'brest', 'stade brestois',
    
    // Liga
    'barcelona', 'barca', 'fc barcelona',
    'real madrid', 'real', 'madrid',
    'atletico madrid', 'atletico', 'atletico de madrid',
    'sevilla', 'sevilla fc',
    'valencia', 'valencia cf',
    'villarreal', 'villarreal cf',
    'real sociedad', 'sociedad',
    'athletic bilbao', 'athletic', 'bilbao',
    'betis', 'real betis',
    
    // Premier League
    'manchester united', 'manchester city', 'manchester', 'man utd', 'man city',
    'liverpool', 'lfc',
    'arsenal', 'afc',
    'chelsea', 'cfc',
    'tottenham', 'spurs', 'tottenham hotspur',
    'newcastle', 'newcastle united',
    'brighton', 'brighton & hove albion',
    'west ham', 'west ham united',
    'aston villa', 'villa',
    'crystal palace', 'palace',
    
    // Bundesliga
    'bayern', 'bayern munich', 'bayern munchen', 'fc bayern',
    'dortmund', 'borussia dortmund', 'bvb',
    'leipzig', 'rb leipzig',
    'leverkusen', 'bayer leverkusen',
    'fribourg', 'sc freiburg', 'freiburg',
    'eintracht frankfurt', 'frankfurt',
    'wolfsburg', 'vfl wolfsburg',
    'hoffenheim', 'tsg hoffenheim',
    'union berlin', 'union',
    'gladbach', 'borussia monchengladbach',
    
    // Serie A
    'juventus', 'juve', 'juventus turin',
    'milan', 'ac milan',
    'inter', 'inter milan', 'inter milano',
    'napoli', 'ssc napoli',
    'roma', 'as roma',
    'atalanta', 'atalanta bergamo',
    'lazio', 'ss lazio',
    'fiorentina', 'acf fiorentina',
    
    // Autres
    'porto', 'fc porto',
    'benfica', 'sl benfica',
    'ajax', 'ajax amsterdam',
    'psv', 'psv eindhoven',
    'celtic', 'celtic glasgow',
    'rangers', 'rangers fc'
  ]
  
  // Trier par longueur (plus longs en premier)
  const sortedTeams = teams.sort((a, b) => b.length - a.length)
  
  // Détecter les séparateurs de match (plus flexibles)
  const matchSeparators = [' vs ', ' contre ', ' - ', ' / ', ' v ', ' x ']
  let team1: string | null = null
  let team2: string | null = null
  
  for (const separator of matchSeparators) {
    if (normalizedMessage.includes(separator)) {
      const parts = normalizedMessage.split(separator)
      if (parts.length >= 2) {
        // Chercher la première équipe dans la première partie
        for (const team of sortedTeams) {
          const normalizedTeam = team.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          if (parts[0].includes(normalizedTeam)) {
            team1 = team
            break
          }
        }
        // Chercher la deuxième équipe dans la deuxième partie
        for (const team of sortedTeams) {
          const normalizedTeam = team.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          if (parts[1].includes(normalizedTeam) && team !== team1) {
            team2 = team
            break
          }
        }
        if (team1 && team2) break
      }
    }
  }
  
  return { team1, team2 }
}

/**
 * Détermine si une recherche web est nécessaire basée sur le message
 */
function shouldPerformWebSearch(message: string): boolean {
  const lowerMessage = message.toLowerCase()
  
  // Mots-clés qui indiquent un besoin de données actuelles
  const searchKeywords = [
    'aujourd\'hui',
    'demain',
    'ce weekend',
    'ce week-end',
    'weekend',
    'week-end',
    'cette semaine',
    'prochain match',
    'match du jour',
    'résultats',
    'cotes',
    'actualités',
    'récent',
    'dernier',
    'vs',
    'contre',
    'psg',
    'paris',
    'lyon',
    'marseille',
    'monaco',
    'lille',
    'rennes',
    'nice',
    'lens',
    'nantes',
    'toulouse',
    'reims',
    'le havre',
    'auxerre',
    'ligue 1',
    'match',
    'analyse',
    'combiné',
    'combo',
    // Questions sur les joueurs (même courtes)
    'buteur',
    'buteurs',
    'marquer',
    'but',
    'joueur',
    'joueurs',
    'effectif',
    'composition',
  ]

  // Toujours faire une recherche pour les matchs (pour avoir les dates et joueurs actuels)
  // Vérifier si le message contient des mots-clés de recherche
  return searchKeywords.some(keyword => lowerMessage.includes(keyword))
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification avec Clerk
    const { userId } = await auth()
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Non authentifié. Veuillez vous connecter.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Rate limiting : 10 requêtes par minute, 100 par heure
    const minuteLimit = await checkRateLimit(userId, 10, 60 * 1000)
    if (!minuteLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Trop de requêtes. Limite de 10 requêtes par minute atteinte.',
          retryAfter: Math.ceil((minuteLimit.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((minuteLimit.resetTime - Date.now()) / 1000)),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': String(minuteLimit.remaining),
            'X-RateLimit-Reset': String(minuteLimit.resetTime),
          },
        }
      )
    }

    const hourLimit = await checkRateLimit(`${userId}:hour`, 100, 60 * 60 * 1000)
    if (!hourLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Trop de requêtes. Limite de 100 requêtes par heure atteinte.',
          retryAfter: Math.ceil((hourLimit.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((hourLimit.resetTime - Date.now()) / 1000)),
            'X-RateLimit-Limit': '100',
            'X-RateLimit-Remaining': String(hourLimit.remaining),
            'X-RateLimit-Reset': String(hourLimit.resetTime),
          },
        }
      )
    }

    const { message, conversationHistory } = await request.json()

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Créer la date actuelle au format lisible
    const today = new Date()
    const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
    const currentDate = `${daysOfWeek[today.getDay()]} ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`
    
    // Détecter si le message mentionne une équipe pour appeler l'API-Football
    const detectedTeam = extractTeamName(message)
    const matchTeams = extractMatchTeams(message)
    const teamToSearch = detectedTeam || matchTeams.team1 || matchTeams.team2
    
    // Log de débogage pour voir ce qui est détecté
    console.log(`🔍 Détection d'équipe - Message: "${message.substring(0, 50)}..."`)
    console.log(`   detectedTeam: ${detectedTeam || 'null'}`)
    console.log(`   matchTeams: team1=${matchTeams.team1 || 'null'}, team2=${matchTeams.team2 || 'null'}`)
    console.log(`   teamToSearch: ${teamToSearch || 'null'}`)
    
    // Appeler l'API-Football si une équipe est clairement identifiée
    let apiFootballData: any = null
    if (teamToSearch) {
      console.log(`🔍 Équipe détectée: "${teamToSearch}" - Appel de l'API-Football...`)
      try {
        // Normaliser le nom de l'équipe pour l'API
        const normalizedTeamName = teamToSearch
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ')
        
        console.log(`📡 Appel API-Football pour: "${normalizedTeamName}"`)
        apiFootballData = await getMatchData(normalizedTeamName)
        
        if (apiFootballData) {
          console.log(`✅ API-Football: Données récupérées pour ${normalizedTeamName}`)
          console.log(`   Match: ${apiFootballData.match.homeTeam} vs ${apiFootballData.match.awayTeam}`)
        } else {
          console.log(`⚠️ API-Football: Aucune donnée retournée pour ${normalizedTeamName}`)
        }
      } catch (error: any) {
        console.warn(`❌ Erreur API-Football pour "${teamToSearch}":`, error.message)
        // Continuer sans les données API-Football
      }
    } else {
      console.log(`ℹ️ Aucune équipe détectée dans le message - API-Football non appelée`)
    }
    
    // Construire le prompt système avec la date et les données API-Football
    let apiFootballSection = ''
    if (apiFootballData) {
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

BLESSURES CONFIRMÉES :
${apiFootballData.injuries.length > 0 
  ? apiFootballData.injuries.map((inj: any) => `- ${inj.player} (${inj.team}) : ${inj.reason}`).join('\n')
  : 'Aucune blessure confirmée dans les données officielles.'}

---
`
    }
    
    const systemPromptWithDate = `NOUS SOMMES LE : ${currentDate}.

RÈGLE ABSOLUE : Tout match ou article trouvé via la recherche qui date de plus de 7 jours doit être IGNORÉ. Ne propose JAMAIS un match qui a déjà eu lieu. Si un match mentionné dans les résultats de recherche a une date antérieure à aujourd'hui, IGNORE-LE COMPLÈTEMENT.

${apiFootballSection}

${SYSTEM_PROMPT}`

    // Construire l'historique des messages
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPromptWithDate },
    ]

    // Détecter si le message actuel mentionne des équipes spécifiques
    const currentMessageHasTeams = extractTeamName(message) !== null || extractMatchTeams(message).team1 !== null
    
    // Nettoyer le contexte précédent : ne garder l'historique que si le sujet est cohérent
    // Si le nouveau message change de sujet (pas d'équipes alors que l'historique en avait), limiter l'historique
    if (conversationHistory && Array.isArray(conversationHistory)) {
      // Détecter si le message précédent mentionnait des équipes
      const previousMessageHadTeams = conversationHistory.length > 0 && 
        (extractTeamName(conversationHistory[conversationHistory.length - 1]?.content || '') !== null ||
         extractMatchTeams(conversationHistory[conversationHistory.length - 1]?.content || '').team1 !== null)
      
      // Logique de nettoyage du contexte :
      // - Si sujet cohérent (même type : équipes -> équipes, ou général -> général) : garder tout l'historique
      // - Si changement de sujet (équipes -> général, ou général -> équipes) : limiter à 1 seul message pour éviter le mélange
      const isSubjectChange = (currentMessageHasTeams && !previousMessageHadTeams) || 
                              (!currentMessageHasTeams && previousMessageHadTeams)
      
      const historyToUse = isSubjectChange
        ? conversationHistory.slice(-1)  // Changement de sujet : ne garder que le dernier message
        : conversationHistory  // Sujet cohérent : garder tout l'historique
      
      historyToUse.forEach((msg: { role: string; content: string }) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
          })
        }
      })
    }

    // Détecter si une recherche web est nécessaire
    const needsWebSearch = shouldPerformWebSearch(message)
    
    // Détecter si c'est une question générale (sans équipes spécifiques)
    const lowerMessage = message.toLowerCase()
    const isGeneralQuestion = !currentMessageHasTeams && (
      lowerMessage.includes('meilleurs paris') ||
      lowerMessage.includes('meilleur pari') ||
      lowerMessage.includes('matchs sûrs') ||
      lowerMessage.includes('matchs surs') ||
      lowerMessage.includes('opportunités') ||
      lowerMessage.includes('opportunites') ||
      lowerMessage.includes('conseils') ||
      lowerMessage.includes('recommandations') ||
      lowerMessage.includes('tips') ||
      lowerMessage.includes('pronostics') ||
      lowerMessage.includes('weekend') ||
      lowerMessage.includes('week-end') ||
      lowerMessage.includes('ce soir') ||
      lowerMessage.includes('aujourd\'hui')
    )
    
    // Pour les questions de suivi sur un match spécifique, vérifier l'historique
    let contextTeam: string | null = null
    if (!isGeneralQuestion && conversationHistory && Array.isArray(conversationHistory)) {
      // Chercher dans l'historique récent (3-4 derniers messages) pour trouver une équipe mentionnée
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
    
    // Si question de suivi sur buteurs/joueurs, utiliser le contexte de l'historique
    const isFollowUpQuestion = !isGeneralQuestion && (lowerMessage.includes('buteur') || 
                                lowerMessage.includes('marquer') || 
                                lowerMessage.includes('but') ||
                                lowerMessage.includes('joueur') ||
                                lowerMessage.includes('effectif')) && 
                               (contextTeam !== null || extractTeamName(message) !== null)
    
    // Forcer la recherche si nécessaire
    const shouldSearch = needsWebSearch || isFollowUpQuestion || isGeneralQuestion
    let webSearchContext = ''

    if (shouldSearch) {
      // Effectuer une recherche web avec Serper pour obtenir les données actuelles
      // Recherche spécifique pour les matchs, dates, compositions d'équipe et buteurs
      const currentYear = new Date().getFullYear()
      
      // CAS 1 : Question générale (pas d'équipes spécifiques)
      if (isGeneralQuestion) {
        console.log('🔍 Question générale détectée - Recherche globale')
        
        // Calculer les dates du week-end si mentionné
        let searchQuery = 'Best value football betting tips and predictions'
        if (lowerMessage.includes('weekend') || lowerMessage.includes('week-end')) {
          const today = new Date()
          const dayOfWeek = today.getDay()
          const daysUntilSaturday = (6 - dayOfWeek) % 7
          const saturday = new Date(today)
          saturday.setDate(today.getDate() + daysUntilSaturday)
          const sunday = new Date(saturday)
          sunday.setDate(saturday.getDate() + 1)
          
          const saturdayStr = saturday.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
          const sundayStr = sunday.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })
          
          searchQuery = `Best value football betting tips and predictions for this weekend ${saturdayStr} ${sundayStr} ${currentYear}`
        } else if (lowerMessage.includes('ce soir') || lowerMessage.includes('aujourd\'hui')) {
          const today = new Date()
          const todayStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          searchQuery = `Best value football betting tips and predictions for today ${todayStr}`
        } else {
          searchQuery = `Best value football betting tips and predictions ${currentYear}`
        }
        
        const generalSearchResults = await searchWithSerper(searchQuery)
        console.log('✅ Recherche globale terminée:', generalSearchResults?.organic?.length || 0, 'résultats')
        
        if (generalSearchResults && generalSearchResults.organic && generalSearchResults.organic.length > 0) {
          webSearchContext = `=== RECHERCHE WEB - OPPORTUNITÉS DE PARIS ===\n\n`
          webSearchContext += `Tu disposes de résultats de recherche web sur les meilleurs paris et opportunités. `
          webSearchContext += `Analyse ces résultats et liste 3 opportunités potentielles trouvées sur le web.\n\n`
          
          const formattedResults = generalSearchResults.organic
            .slice(0, 10)
            .map((result, index) => {
              return `[${index + 1}] ${result.title}\n${result.link}\n${result.snippet}`
            })
            .join('\n\n')
          
          webSearchContext += formattedResults + '\n\n'
          webSearchContext += `=== FIN RECHERCHE WEB ===`
        }
      } else {
        // CAS 2 : Équipes spécifiques mentionnées - STRATÉGIE DE TRIANGULATION
        // Détecter si la question concerne les joueurs (effectifs, transferts, blessures)
        const isPlayerQuestion = lowerMessage.includes('joueur') || 
                                  lowerMessage.includes('effectif') ||
                                  lowerMessage.includes('composition') ||
                                  lowerMessage.includes('transfert') ||
                                  lowerMessage.includes('blessure') ||
                                  lowerMessage.includes('blessé') ||
                                  lowerMessage.includes('suspension') ||
                                  lowerMessage.includes('suspendu') ||
                                  lowerMessage.includes('buteur') ||
                                  lowerMessage.includes('marquer') ||
                                  lowerMessage.includes('but') ||
                                  lowerMessage.includes('titulaire') ||
                                  lowerMessage.includes('remplaçant')
        
        // Si la question concerne les buteurs, ajouter des mots-clés spécifiques
        const isButeurQuestion = lowerMessage.includes('buteur') || 
                                  lowerMessage.includes('marquer') ||
                                  lowerMessage.includes('but')
        
        // Détecter si c'est une demande de combiné ou de matchs du week-end
        const isWeekendQuestion = lowerMessage.includes('weekend') || 
                                  lowerMessage.includes('week-end') ||
                                  lowerMessage.includes('combiné') ||
                                  lowerMessage.includes('combo')
        
        // Détecter si une équipe est mentionnée (pour forcer Transfermarkt)
        // Utiliser le contexte de l'historique si pas d'équipe dans le message actuel
        let teamName = extractTeamName(message)
        if (!teamName && contextTeam) {
          teamName = contextTeam
        }
        const hasTeam = teamName !== null
        
        // Détecter si c'est un match avec deux équipes
        const matchTeams = extractMatchTeams(message)
        const hasMatch = matchTeams.team1 !== null && matchTeams.team2 !== null
        
        // STRATÉGIE AMÉLIORÉE : Recherches multiples Transfermarkt en parallèle
        // 1. Si match détecté : STRATÉGIE DE TRIANGULATION (3 recherches + Transfermarkt)
        // 2. Si une seule équipe : recherche Transfermarkt COMPLÈTE (effectif + blessures + transferts)
        // 3. Recherche Transfermarkt simple si question sur joueurs sans équipe
        // 4. Recherche générale pour les matchs/dates
        let transfermarktResults: any = null
        let generalResults: any = null
        let triangulationResults: any = null
        
        // TOUJOURS chercher sur Transfermarkt si une équipe est mentionnée OU si question sur joueurs/buteurs
        // Même si pas de mot-clé "joueur", si une équipe est mentionnée, on cherche l'effectif pour éviter les erreurs
        // Si question sur buteurs/joueurs, forcer la recherche même sans équipe explicite
        if (hasMatch && matchTeams.team1 && matchTeams.team2) {
        // MATCH DÉTECTÉ : STRATÉGIE DE TRIANGULATION
        console.log('🚀 Démarrage des 3 recherches de triangulation pour:', matchTeams.team1, 'vs', matchTeams.team2)
        
        // Triangulation : 3 recherches en parallèle
        const [searchA, searchB, searchC, team1Data, team2Data] = await Promise.all([
          // Recherche A : Compositions probables, blessés, absents
          searchWithSerper(`${matchTeams.team1} vs ${matchTeams.team2} compositions probables blessés absents ${currentYear}`),
          // Recherche B : Statistiques, confrontations, forme récente
          searchWithSerper(`${matchTeams.team1} vs ${matchTeams.team2} statistiques confrontations forme récente`),
          // Recherche C : Conférence de presse, déclarations coach
          searchWithSerper(`${matchTeams.team1} vs ${matchTeams.team2} conférence de presse déclarations coach`),
          // Transfermarkt pour équipe 1
          searchTransfermarktComplete(matchTeams.team1, currentYear),
          // Transfermarkt pour équipe 2
          searchTransfermarktComplete(matchTeams.team2, currentYear)
        ])
        
        // Logging des résultats
        if (searchA) {
          console.log('✅ Recherche A (EFFECTIF) terminée:', searchA.organic?.length || 0, 'résultats')
        }
        if (searchB) {
          console.log('✅ Recherche B (STATS) terminée:', searchB.organic?.length || 0, 'résultats')
        }
        if (searchC) {
          console.log('✅ Recherche C (CONTEXTE) terminée:', searchC.organic?.length || 0, 'résultats')
        }
        
        // Assemblage des résultats de triangulation
        triangulationResults = {
          effectif: searchA,
          stats: searchB,
          contexte: searchC
        }
        
        transfermarktResults = {
          team1: team1Data,
          team2: team2Data
        }
        console.log('Recherche Transfermarkt pour match:', matchTeams.team1, 'vs', matchTeams.team2)
        console.log(`- ${matchTeams.team1}:`, team1Data.squad?.organic?.length || 0, 'résultats effectif,', team1Data.players?.organic?.length || 0, 'résultats joueurs')
        console.log(`- ${matchTeams.team2}:`, team2Data.squad?.organic?.length || 0, 'résultats effectif,', team2Data.players?.organic?.length || 0, 'résultats joueurs')
      } else if (hasTeam && teamName) {
        // NOUVELLE APPROCHE : Recherche complète Transfermarkt (effectif + blessures + transferts + joueurs)
        transfermarktResults = await searchTransfermarktComplete(teamName, currentYear)
        console.log('Recherche Transfermarkt complète effectuée pour:', teamName)
        console.log('- Effectif:', transfermarktResults.squad?.organic?.length || 0, 'résultats')
        console.log('- Joueurs/Attaquants:', transfermarktResults.players?.organic?.length || 0, 'résultats')
        console.log('- Blessures:', transfermarktResults.injuries?.organic?.length || 0, 'résultats')
        console.log('- Transferts:', transfermarktResults.transfers?.organic?.length || 0, 'résultats')
      } else if ((isPlayerQuestion || isButeurQuestion) && teamName) {
        // Si question sur joueurs/buteurs avec équipe détectée (dans message ou historique), recherche complète
        transfermarktResults = await searchTransfermarktComplete(teamName, currentYear)
        console.log('Recherche Transfermarkt complète effectuée pour question buteurs/joueurs:', teamName)
      } else if (isPlayerQuestion || isButeurQuestion) {
        // Si question sur joueurs mais pas d'équipe détectée, recherche simple avec le message
        const transfermarktQuery = `site:transfermarkt.com ${message} effectif actuel ${currentYear} ${currentYear + 1} joueurs squad`
        transfermarktResults = await searchWithSerper(transfermarktQuery)
        console.log('Recherche Transfermarkt simple effectuée (sans équipe spécifique)')
      }
      
        // Recherche générale pour les matchs/dates (uniquement si pas de question générale)
        let generalQuery = `${message} ${currentYear} ${currentYear + 1} prochain match date`
        
        if (isWeekendQuestion) {
          // Pour les combinés de week-end, chercher spécifiquement les matchs du week-end
          const today = new Date()
          const dayOfWeek = today.getDay()
          const daysUntilSaturday = (6 - dayOfWeek) % 7
          const saturday = new Date(today)
          saturday.setDate(today.getDate() + daysUntilSaturday)
          const sunday = new Date(saturday)
          sunday.setDate(saturday.getDate() + 1)
          
          const saturdayStr = saturday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
          const sundayStr = sunday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
          
          generalQuery = `${message} ${saturdayStr} ${sundayStr} ${currentYear} matchs football ligue 1 premier league`
        }
        
        generalResults = await searchWithSerper(generalQuery)
        
        // Combiner les résultats : Triangulation + Transfermarkt + résultats généraux
        if (triangulationResults || transfermarktResults || generalResults) {
          webSearchContext = formatSearchResultsWithTriangulation(
            triangulationResults,
            transfermarktResults,
            generalResults,
            hasTeam || isPlayerQuestion || isButeurQuestion,
            hasMatch && matchTeams.team1 && matchTeams.team2 ? { team1: matchTeams.team1, team2: matchTeams.team2 } : null
          )
          console.log('🧠 Envoi des données à OpenAI')
          console.log('Recherche web effectuée pour:', message)
          if (triangulationResults) {
            console.log('Triangulation: Effectif', triangulationResults.effectif?.organic?.length || 0, '| Stats', triangulationResults.stats?.organic?.length || 0, '| Contexte', triangulationResults.contexte?.organic?.length || 0)
          }
          console.log('Résultats Transfermarkt:', transfermarktResults?.organic?.length || 0)
          console.log('Résultats généraux:', generalResults?.organic?.length || 0)
        } else {
          console.warn('Aucun résultat de recherche web pour:', message)
        }
      }
    }

    // Construire le message utilisateur avec contexte de recherche si disponible
    const userMessage = webSearchContext
      ? `${message}\n\n${webSearchContext}`
      : message

    // Ajouter le nouveau message
    messages.push({ role: 'user', content: userMessage })

    // Vérifier que la clé API est configurée
    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY n\'est pas configurée. Veuillez créer un fichier .env.local avec votre clé API.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Créer le stream OpenAI
    // Temperature réduite pour plus de cohérence dans les pronostics
    const stream = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as any,
      temperature: 0.3, // Réduit de 0.7 à 0.3 pour plus de cohérence et moins de variabilité
      max_tokens: 800, // Réduit pour des réponses plus concises
      top_p: 0.8, // Réduit de 0.9 à 0.8 pour plus de déterminisme
      stream: true,
    })

    // Créer un ReadableStream pour le streaming
    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              const data = JSON.stringify({ content })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
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
      },
    })
  } catch (error: any) {
    console.error('API Error:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'Une erreur est survenue lors de la génération de la réponse',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

