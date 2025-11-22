// Service de recherche web avec Serper API

export interface SerperSearchResult {
  title: string
  link: string
  snippet: string
  position: number
}

export interface SerperResponse {
  searchParameters: {
    q: string
    type: string
    engine: string
  }
  organic: SerperSearchResult[]
  knowledgeGraph?: {
    title: string
    type: string
    description: string
  }
}

/**
 * Recherche web avec Serper API
 * Documentation: https://serper.dev
 */
export async function searchWithSerper(query: string): Promise<SerperResponse | null> {
  const apiKey = process.env.SERPER_API_KEY

  if (!apiKey) {
    console.warn('SERPER_API_KEY n\'est pas configurée. La recherche web sera désactivée.')
    return null
  }

  try {
    const response = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: query,
        num: 10, // Plus de résultats pour avoir plus d'informations sur les dates et joueurs actuels
        // Si la requête contient "site:transfermarkt.com", Serper va prioriser Transfermarkt
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Erreur Serper API:', error)
      return null
    }

    const data: SerperResponse = await response.json()
    return data
  } catch (error) {
    console.error('Erreur lors de la recherche Serper:', error)
    return null
  }
}

/**
 * Formate les résultats de recherche pour les passer à l'IA
 * Priorise les résultats Transfermarkt pour les joueurs
 * Version améliorée avec recherches multiples Transfermarkt
 */
export function formatSearchResults(
  transfermarktResults: SerperResponse | null | { squad: SerperResponse | null; injuries: SerperResponse | null; transfers: SerperResponse | null; players?: SerperResponse | null } | { team1: any; team2: any },
  generalResults: SerperResponse | null,
  isPlayerQuestion: boolean = false
): string {
  let formattedText = '=== RECHERCHE WEB ACTUELLE ===\n\n'
  
  // Vérifier si on a des résultats Transfermarkt complets (nouveau format) ou simples (ancien format)
  // Vérifier aussi si c'est un match avec deux équipes
  const hasMatchTransfermarkt = transfermarktResults && typeof transfermarktResults === 'object' && 'team1' in transfermarktResults && 'team2' in transfermarktResults
  const hasCompleteTransfermarkt = !hasMatchTransfermarkt && transfermarktResults && typeof transfermarktResults === 'object' && 'squad' in transfermarktResults
  const hasSimpleTransfermarkt = !hasMatchTransfermarkt && !hasCompleteTransfermarkt && transfermarktResults && 'organic' in transfermarktResults && (transfermarktResults as SerperResponse).organic && (transfermarktResults as SerperResponse).organic.length > 0
  
  // PRIORITÉ ABSOLUE : Résultats Transfermarkt pour les joueurs
  if (hasMatchTransfermarkt) {
    // MATCH AVEC DEUX ÉQUIPES
    const matchData = transfermarktResults as { team1: { squad: SerperResponse | null; injuries: SerperResponse | null; transfers: SerperResponse | null }; team2: { squad: SerperResponse | null; injuries: SerperResponse | null; transfers: SerperResponse | null } }
    
    formattedText += '🔥 TRANSFERMARKT - MATCH (SOURCE LA PLUS FIABLE - EFFECTIFS ACTUELS) :\n\n'
    formattedText += '⚠️ RÈGLE ABSOLUE : Utilise UNIQUEMENT les joueurs listés dans ces résultats Transfermarkt. '
    formattedText += 'Si un joueur n\'est PAS dans ces résultats, il N\'EST PAS dans l\'effectif actuel. '
    formattedText += 'NE MENTIONNE JAMAIS de joueurs qui ne sont pas explicitement listés ici.\n\n'
    
    // ÉQUIPE 1
    if (matchData.team1.squad && matchData.team1.squad.organic && matchData.team1.squad.organic.length > 0) {
      formattedText += '📋 ÉQUIPE 1 - EFFECTIF ACTUEL :\n\n'
      const squad1Formatted = matchData.team1.squad.organic
        .slice(0, 5)
        .map((result, index) => {
          return `[${index + 1}] ${result.title}\n${result.link}\n${result.snippet}`
        })
        .join('\n\n')
      formattedText += squad1Formatted + '\n\n'
    }
    
    if (matchData.team1.injuries && matchData.team1.injuries.organic && matchData.team1.injuries.organic.length > 0) {
      formattedText += '🏥 ÉQUIPE 1 - BLESSURES/SUSPENSIONS :\n\n'
      const injuries1Formatted = matchData.team1.injuries.organic
        .slice(0, 3)
        .map((result, index) => {
          return `[${index + 1}] ${result.title}\n${result.link}\n${result.snippet}`
        })
        .join('\n\n')
      formattedText += injuries1Formatted + '\n\n'
    }
    
    // ÉQUIPE 2
    if (matchData.team2.squad && matchData.team2.squad.organic && matchData.team2.squad.organic.length > 0) {
      formattedText += '📋 ÉQUIPE 2 - EFFECTIF ACTUEL :\n\n'
      const squad2Formatted = matchData.team2.squad.organic
        .slice(0, 5)
        .map((result, index) => {
          return `[${index + 1}] ${result.title}\n${result.link}\n${result.snippet}`
        })
        .join('\n\n')
      formattedText += squad2Formatted + '\n\n'
    }
    
    if (matchData.team2.injuries && matchData.team2.injuries.organic && matchData.team2.injuries.organic.length > 0) {
      formattedText += '🏥 ÉQUIPE 2 - BLESSURES/SUSPENSIONS :\n\n'
      const injuries2Formatted = matchData.team2.injuries.organic
        .slice(0, 3)
        .map((result, index) => {
          return `[${index + 1}] ${result.title}\n${result.link}\n${result.snippet}`
        })
        .join('\n\n')
      formattedText += injuries2Formatted + '\n\n'
    }
    
    formattedText += '=== FIN TRANSFERMARKT ===\n\n'
  } else if (hasCompleteTransfermarkt) {
    const tmData = transfermarktResults as { squad: SerperResponse | null; injuries: SerperResponse | null; transfers: SerperResponse | null; players?: SerperResponse | null }
    
    formattedText += '🔥 TRANSFERMARKT (SOURCE LA PLUS FIABLE - EFFECTIFS ACTUELS) :\n\n'
    formattedText += '⚠️ RÈGLE ABSOLUE : Utilise UNIQUEMENT les joueurs listés dans ces résultats Transfermarkt. '
    formattedText += 'Si un joueur n\'est PAS dans ces résultats, il N\'EST PAS dans l\'effectif actuel. '
    formattedText += 'NE MENTIONNE JAMAIS de joueurs qui ne sont pas explicitement listés ici.\n\n'
    
    // 1. EFFECTIF ACTUEL
    if (tmData.squad && tmData.squad.organic && tmData.squad.organic.length > 0) {
      formattedText += '📋 EFFECTIF ACTUEL :\n\n'
      const squadFormatted = tmData.squad.organic
        .slice(0, 8)
        .map((result, index) => {
          const isTransfermarkt = result.link.includes('transfermarkt.com')
          const prefix = isTransfermarkt ? '✅' : '[TM]'
          return `${prefix} [${index + 1}] ${result.title}\n${result.link}\n${result.snippet}`
        })
        .join('\n\n')
      formattedText += squadFormatted + '\n\n'
    }
    
    // 1b. JOUEURS SPÉCIFIQUES (ATTAQUANTS/BUTEURS) - PRIORITÉ
    if (tmData.players && tmData.players.organic && tmData.players.organic.length > 0) {
      formattedText += '⚽ ATTAQUANTS ET BUTEURS PROBABLES :\n\n'
      formattedText += '⚠️ IMPORTANT : Extrais TOUS les noms de joueurs mentionnés dans ces résultats. Ce sont les joueurs à mentionner comme buteurs probables.\n\n'
      const playersFormatted = tmData.players.organic
        .slice(0, 8)
        .map((result: SerperSearchResult, index: number) => {
          return `[${index + 1}] ${result.title}\n${result.link}\n${result.snippet}`
        })
        .join('\n\n')
      formattedText += playersFormatted + '\n\n'
    }
    
    // 2. BLESSURES ET SUSPENSIONS
    if (tmData.injuries && tmData.injuries.organic && tmData.injuries.organic.length > 0) {
      formattedText += '🏥 BLESSURES ET SUSPENSIONS :\n\n'
      const injuriesFormatted = tmData.injuries.organic
        .slice(0, 5)
        .map((result, index) => {
          return `[${index + 1}] ${result.title}\n${result.link}\n${result.snippet}`
        })
        .join('\n\n')
      formattedText += injuriesFormatted + '\n\n'
    }
    
    // 3. TRANSFERTS RÉCENTS (pour vérifier les départs)
    if (tmData.transfers && tmData.transfers.organic && tmData.transfers.organic.length > 0) {
      formattedText += '🔄 TRANSFERTS RÉCENTS (VÉRIFIER LES DÉPARTS) :\n\n'
      const transfersFormatted = tmData.transfers.organic
        .slice(0, 5)
        .map((result, index) => {
          return `[${index + 1}] ${result.title}\n${result.link}\n${result.snippet}`
        })
        .join('\n\n')
      formattedText += transfersFormatted + '\n\n'
    }
    
    formattedText += '=== FIN TRANSFERMARKT ===\n\n'
  } else if (hasSimpleTransfermarkt) {
    // Format simple (ancien) pour compatibilité
    formattedText += '🔥 TRANSFERMARKT (SOURCE LA PLUS FIABLE - EFFECTIFS ACTUELS) :\n\n'
    formattedText += '⚠️ RÈGLE ABSOLUE : Utilise UNIQUEMENT les joueurs listés dans ces résultats Transfermarkt. '
    formattedText += 'Si un joueur n\'est PAS dans ces résultats, il N\'EST PAS dans l\'effectif actuel. '
    formattedText += 'NE MENTIONNE JAMAIS de joueurs qui ne sont pas explicitement listés ici.\n\n'
    
    const transfermarktFormatted = (transfermarktResults as SerperResponse).organic
      .slice(0, 10)
      .map((result, index) => {
        const isTransfermarkt = result.link.includes('transfermarkt.com')
        const prefix = isTransfermarkt ? '✅' : '[TM]'
        return `${prefix} [${index + 1}] ${result.title}\n${result.link}\n${result.snippet}`
      })
      .join('\n\n')
    
    formattedText += transfermarktFormatted + '\n\n'
    formattedText += '=== FIN TRANSFERMARKT ===\n\n'
  }
  
  // Résultats généraux pour les matchs/dates
  if (generalResults && generalResults.organic && generalResults.organic.length > 0) {
    if (hasCompleteTransfermarkt || hasSimpleTransfermarkt) {
      formattedText += '📅 RÉSULTATS GÉNÉRAUX (MATCHS/DATES) :\n\n'
    }
    
    const generalFormatted = generalResults.organic
      .slice(0, 10)
      .map((result, index) => {
        return `[${index + 1}] ${result.title}\n${result.link}\n${result.snippet}`
      })
      .join('\n\n')
    
    formattedText += generalFormatted + '\n\n'
  }
  
  // Instructions finales ultra strictes
  formattedText += '=== INSTRUCTIONS CRITIQUES ===\n\n'
  formattedText += '1. Si des résultats Transfermarkt sont fournis, utilise-les EXCLUSIVEMENT pour les joueurs\n'
  formattedText += '2. Ne mentionne QUE les joueurs explicitement listés dans la section "EFFECTIF ACTUEL"\n'
  formattedText += '3. Vérifie la section "TRANSFERTS RÉCENTS" pour confirmer qu\'un joueur n\'a pas quitté le club\n'
  formattedText += '4. Vérifie la section "BLESSURES ET SUSPENSIONS" pour les absences\n'
  formattedText += '5. Si un joueur n\'est PAS dans les résultats Transfermarkt, il N\'EST PAS dans l\'effectif actuel\n'
  formattedText += '6. Ne mentionne JAMAIS de joueurs basés sur tes connaissances si ils ne sont pas dans les résultats\n'
  formattedText += '7. Pour les dates/matchs, utilise les résultats généraux\n'
  formattedText += '8. Si tu n\'es pas CERTAIN qu\'un joueur est dans l\'effectif, NE LE MENTIONNE PAS\n\n'
  formattedText += '=== FIN RECHERCHE WEB ==='
  
  return formattedText
}

/**
 * Recherche Transfermarkt complète pour une équipe
 * Fait plusieurs recherches en parallèle pour avoir toutes les informations
 */
export async function searchTransfermarktComplete(
  teamName: string,
  currentYear: number
): Promise<{
  squad: SerperResponse | null
  injuries: SerperResponse | null
  transfers: SerperResponse | null
  players: SerperResponse | null
}> {
  // Recherches en parallèle pour optimiser le temps
  // Ajout d'une recherche spécifique pour les noms de joueurs
  const [squad, injuries, transfers, players] = await Promise.all([
    // 1. Effectif actuel - recherche plus spécifique
    searchWithSerper(`site:transfermarkt.com ${teamName} squad roster players liste joueurs ${currentYear} ${currentYear + 1}`),
    // 2. Blessures et suspensions récentes
    searchWithSerper(`site:transfermarkt.com ${teamName} injuries suspensions blessures ${currentYear} ${currentYear + 1} latest news`),
    // 3. Transferts récents (pour vérifier les départs)
    searchWithSerper(`site:transfermarkt.com ${teamName} transfers transfers récents ${currentYear} ${currentYear + 1}`),
    // 4. Recherche spécifique pour les attaquants et buteurs
    searchWithSerper(`site:transfermarkt.com ${teamName} attackers forwards strikers buteurs attaquants ${currentYear} ${currentYear + 1}`)
  ])

  return { squad, injuries, transfers, players }
}

/**
 * Formate les résultats avec stratégie de triangulation
 * Combine les 3 recherches de triangulation + Transfermarkt + résultats généraux
 */
export function formatSearchResultsWithTriangulation(
  triangulationResults: { effectif: SerperResponse | null; stats: SerperResponse | null; contexte: SerperResponse | null } | null,
  transfermarktResults: SerperResponse | null | { squad: SerperResponse | null; injuries: SerperResponse | null; transfers: SerperResponse | null; players?: SerperResponse | null } | { team1: any; team2: any },
  generalResults: SerperResponse | null,
  isPlayerQuestion: boolean = false,
  matchTeams: { team1: string; team2: string } | null = null
): string {
  let formattedText = '=== RECHERCHE WEB ACTUELLE (TRIANGULATION) ===\n\n'
  
  // SECTION TRIANGULATION (si disponible)
  if (triangulationResults) {
    formattedText += '🔺 TRIANGULATION - 3 SOURCES CROISÉES :\n\n'
    formattedText += '⚠️ INSTRUCTION CRITIQUE : Tu disposes de 3 sources d\'infos. Si la section EFFECTIF mentionne des blessés majeurs, cela doit PRIMER sur les STATS passées. Sois critique et croise les informations.\n\n'
    
    // --- EFFECTIF ---
    if (triangulationResults.effectif && triangulationResults.effectif.organic && triangulationResults.effectif.organic.length > 0) {
      formattedText += '--- EFFECTIF ---\n'
      formattedText += 'Compositions probables, blessés, absents :\n\n'
      const effectifFormatted = triangulationResults.effectif.organic
        .slice(0, 8)
        .map((result, index) => {
          return `[${index + 1}] ${result.title}\n${result.link}\n${result.snippet}`
        })
        .join('\n\n')
      formattedText += effectifFormatted + '\n\n'
    }
    
    // --- STATS ---
    if (triangulationResults.stats && triangulationResults.stats.organic && triangulationResults.stats.organic.length > 0) {
      formattedText += '--- STATS ---\n'
      formattedText += 'Statistiques, confrontations, forme récente :\n\n'
      const statsFormatted = triangulationResults.stats.organic
        .slice(0, 8)
        .map((result, index) => {
          return `[${index + 1}] ${result.title}\n${result.link}\n${result.snippet}`
        })
        .join('\n\n')
      formattedText += statsFormatted + '\n\n'
    }
    
    // --- CONTEXTE ---
    if (triangulationResults.contexte && triangulationResults.contexte.organic && triangulationResults.contexte.organic.length > 0) {
      formattedText += '--- CONTEXTE ---\n'
      formattedText += 'Conférences de presse, déclarations coach :\n\n'
      const contexteFormatted = triangulationResults.contexte.organic
        .slice(0, 8)
        .map((result, index) => {
          return `[${index + 1}] ${result.title}\n${result.link}\n${result.snippet}`
        })
        .join('\n\n')
      formattedText += contexteFormatted + '\n\n'
    }
    
    formattedText += '=== FIN TRIANGULATION ===\n\n'
  }
  
  // Ajouter les résultats Transfermarkt (formatage existant)
  if (transfermarktResults) {
    const transfermarktFormatted = formatSearchResults(transfermarktResults, null, isPlayerQuestion)
    // Nettoyer le formatage pour éviter les doublons
    const cleaned = transfermarktFormatted.replace('=== RECHERCHE WEB ACTUELLE ===\n\n', '').replace('=== FIN RECHERCHE WEB ===', '').trim()
    if (cleaned) {
      formattedText += cleaned + '\n\n'
    }
  }
  
  // Ajouter les résultats généraux
  if (generalResults && generalResults.organic && generalResults.organic.length > 0) {
    formattedText += '📅 RÉSULTATS GÉNÉRAUX (MATCHS/DATES) :\n\n'
    const generalFormatted = generalResults.organic
      .slice(0, 10)
      .map((result, index) => {
        return `[${index + 1}] ${result.title}\n${result.link}\n${result.snippet}`
      })
      .join('\n\n')
    formattedText += generalFormatted + '\n\n'
  }
  
  // Instructions finales
  formattedText += '=== INSTRUCTIONS CRITIQUES ===\n\n'
  formattedText += '1. PRIORITÉ : Si la section EFFECTIF mentionne des blessés majeurs, cela PRIME sur les STATS passées\n'
  formattedText += '2. Croise les 3 sources (EFFECTIF, STATS, CONTEXTE) pour une analyse complète\n'
  formattedText += '3. Sois critique : si les sources se contredisent, privilégie les informations les plus récentes\n'
  formattedText += '4. Utilise Transfermarkt pour les effectifs actuels\n'
  formattedText += '5. Les déclarations du coach (CONTEXTE) peuvent révéler des informations tactiques importantes\n\n'
  formattedText += '=== FIN RECHERCHE WEB ==='
  
  return formattedText
}

/**
 * Recherche spécifique pour les matchs de football
 */
export async function searchMatchInfo(
  team1: string,
  team2: string,
  date?: string
): Promise<string> {
  const query = `${team1} vs ${team2} ${date || 'prochain match'} football`
  const results = await searchWithSerper(query)
  // Utiliser la nouvelle signature avec null pour Transfermarkt (pas de recherche spécifique)
  return formatSearchResults(null, results, false)
}

