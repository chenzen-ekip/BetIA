import { searchWithSerper, formatSearchResultsWithTriangulation, searchTransfermarktComplete } from '@/lib/serper'

/**
 * Extrait le nom d'équipe du message pour les recherches ciblées
 */
export function extractTeamName(message: string): string | null {
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
export function extractMatchTeams(message: string): { team1: string | null; team2: string | null } {
  // Normaliser le message
  const normalizedMessage = message
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
  
  // Utiliser la même liste d'équipes que extractTeamName
  // Note: Idéalement, on devrait partager cette liste ou la mettre dans une constante
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
export function shouldPerformWebSearch(message: string): boolean {
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

export interface SearchResult {
  context: string
  source: 'web' | 'none'
}

/**
 * Exécute la logique de recherche web complète (Triangulation, Transfermarkt, etc.)
 */
export async function performWebSearch(
  message: string, 
  contextTeam: string | null = null,
  conversationHistory: any[] = []
): Promise<SearchResult> {
  const lowerMessage = message.toLowerCase()
  const currentMessageHasTeams = extractTeamName(message) !== null || extractMatchTeams(message).team1 !== null
  
  // Détecter si c'est une question générale (sans équipes spécifiques)
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
  
  // Si question de suivi sur buteurs/joueurs, utiliser le contexte de l'historique
  const isFollowUpQuestion = !isGeneralQuestion && (lowerMessage.includes('buteur') || 
                              lowerMessage.includes('marquer') || 
                              lowerMessage.includes('but') ||
                              lowerMessage.includes('joueur') ||
                              lowerMessage.includes('effectif')) && 
                             (contextTeam !== null || extractTeamName(message) !== null)
  
  const needsWebSearch = shouldPerformWebSearch(message)
  const shouldSearch = needsWebSearch || isFollowUpQuestion || isGeneralQuestion
  
  if (!shouldSearch) {
    return { context: '', source: 'none' }
  }

  let webSearchContext = ''
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
        .map((result: any, index: number) => {
          return `[${index + 1}] ${result.title}\n${result.link}\n${result.snippet}`
        })
        .join('\n\n')
      
      webSearchContext += formattedResults + '\n\n'
      webSearchContext += `=== FIN RECHERCHE WEB ===`
    }
  } else {
    // CAS 2 : Équipes spécifiques mentionnées - STRATÉGIE DE TRIANGULATION
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
    
    const isButeurQuestion = lowerMessage.includes('buteur') || 
                              lowerMessage.includes('marquer') ||
                              lowerMessage.includes('but')
    
    const isWeekendQuestion = lowerMessage.includes('weekend') || 
                              lowerMessage.includes('week-end') ||
                              lowerMessage.includes('combiné') ||
                              lowerMessage.includes('combo')
    
    let teamName = extractTeamName(message)
    if (!teamName && contextTeam) {
      teamName = contextTeam
    }
    const hasTeam = teamName !== null
    
    const matchTeams = extractMatchTeams(message)
    const hasMatch = matchTeams.team1 !== null && matchTeams.team2 !== null
    
    let transfermarktResults: any = null
    let generalResults: any = null
    let triangulationResults: any = null
    
    if (hasMatch && matchTeams.team1 && matchTeams.team2) {
      // MATCH DÉTECTÉ : STRATÉGIE DE TRIANGULATION
      console.log('🚀 Démarrage des 3 recherches de triangulation pour:', matchTeams.team1, 'vs', matchTeams.team2)
      
      const [searchA, searchB, searchC, team1Data, team2Data] = await Promise.all([
        searchWithSerper(`${matchTeams.team1} vs ${matchTeams.team2} compositions probables blessés absents ${currentYear}`),
        searchWithSerper(`${matchTeams.team1} vs ${matchTeams.team2} statistiques confrontations forme récente`),
        searchWithSerper(`${matchTeams.team1} vs ${matchTeams.team2} conférence de presse déclarations coach`),
        searchTransfermarktComplete(matchTeams.team1, currentYear),
        searchTransfermarktComplete(matchTeams.team2, currentYear)
      ])
      
      triangulationResults = {
        effectif: searchA,
        stats: searchB,
        contexte: searchC
      }
      
      transfermarktResults = {
        team1: team1Data,
        team2: team2Data
      }
    } else if (hasTeam && teamName) {
      transfermarktResults = await searchTransfermarktComplete(teamName, currentYear)
    } else if ((isPlayerQuestion || isButeurQuestion) && teamName) {
      transfermarktResults = await searchTransfermarktComplete(teamName, currentYear)
    } else if (isPlayerQuestion || isButeurQuestion) {
      const transfermarktQuery = `site:transfermarkt.com ${message} effectif actuel ${currentYear} ${currentYear + 1} joueurs squad`
      transfermarktResults = await searchWithSerper(transfermarktQuery)
    }
    
    let generalQuery = `${message} ${currentYear} ${currentYear + 1} prochain match date`
    
    if (isWeekendQuestion) {
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
    
    if (triangulationResults || transfermarktResults || generalResults) {
      webSearchContext = formatSearchResultsWithTriangulation(
        triangulationResults,
        transfermarktResults,
        generalResults,
        hasTeam || isPlayerQuestion || isButeurQuestion,
        hasMatch && matchTeams.team1 && matchTeams.team2 ? { team1: matchTeams.team1, team2: matchTeams.team2 } : null
      )
    }
  }

  return { context: webSearchContext, source: 'web' }
}
