/**
 * Service de recherche floue pour les équipes de football
 * Utilise Fuse.js pour tolérer les fautes de frappe
 */

import Fuse from 'fuse.js'

/**
 * Interface pour une équipe avec ses alias
 */
export interface Team {
  id: number // ID API-Football
  name: string // Nom officiel
  aliases: string[] // Alias et variantes (ex: "Barça", "Barca", "Barcelone")
}

/**
 * Liste des équipes majeures (Top 5 ligues européennes + grosses équipes)
 * Structure prête pour être complétée avec les IDs API-Football réels
 */
const MAJOR_TEAMS: Team[] = [
  // Ligue 1
  { id: 85, name: 'Paris Saint-Germain', aliases: ['PSG', 'Paris', 'Paris SG', 'Paris Saint Germain', 'París'] },
  { id: 80, name: 'Olympique Lyonnais', aliases: ['Lyon', 'OL', 'Olympique Lyon', 'Lyon OL'] },
  { id: 81, name: 'Olympique de Marseille', aliases: ['Marseille', 'OM', 'Olympique Marseille', 'Marseille OM'] },
  { id: 91, name: 'AS Monaco', aliases: ['Monaco', 'ASM', 'Monaco FC'] },
  { id: 79, name: 'Lille OSC', aliases: ['Lille', 'LOSC', 'Lille OSC'] },
  { id: 94, name: 'Stade Rennais FC', aliases: ['Rennes', 'Stade Rennes', 'SRFC'] },
  { id: 84, name: 'OGC Nice', aliases: ['Nice', 'OGC Nice', 'Nice OGCN'] },
  { id: 116, name: 'RC Lens', aliases: ['Lens', 'RCL', 'RC Lens'] },
  { id: 83, name: 'FC Nantes', aliases: ['Nantes', 'FC Nantes', 'Canaris'] },
  { id: 99, name: 'Toulouse FC', aliases: ['Toulouse', 'TFC', 'Toulouse FC'] },
  { id: 93, name: 'Stade de Reims', aliases: ['Reims', 'Stade Reims', 'SDR'] },
  { id: 97, name: 'Le Havre AC', aliases: ['Le Havre', 'HAC', 'Havre', 'Le Havre AC'] },
  { id: 95, name: 'AJ Auxerre', aliases: ['Auxerre', 'AJA', 'AJ Auxerre'] },
  { id: 96, name: 'RC Strasbourg Alsace', aliases: ['Strasbourg', 'RCSA', 'RC Strasbourg'] },
  { id: 98, name: 'FC Lorient', aliases: ['Lorient', 'FCL', 'FC Lorient'] },
  { id: 82, name: 'Montpellier HSC', aliases: ['Montpellier', 'MHSC', 'Montpellier HSC'] },
  { id: 92, name: 'Clermont Foot 63', aliases: ['Clermont', 'CF63', 'Clermont Foot'] },
  { id: 112, name: 'FC Metz', aliases: ['Metz', 'FCM', 'FC Metz'] },
  { id: 106, name: 'Stade Brestois 29', aliases: ['Brest', 'SB29', 'Stade Brestois', 'Brest 29'] },

  // Premier League
  { id: 50, name: 'Manchester City', aliases: ['Man City', 'City', 'Manchester City', 'MCFC', 'Man City FC'] },
  { id: 42, name: 'Arsenal', aliases: ['Arsenal', 'AFC', 'Arsenal FC', 'Gunners'] },
  { id: 40, name: 'Liverpool', aliases: ['Liverpool', 'LFC', 'Liverpool FC', 'Reds'] },
  { id: 49, name: 'Chelsea', aliases: ['Chelsea', 'CFC', 'Chelsea FC', 'Blues'] },
  { id: 47, name: 'Tottenham Hotspur', aliases: ['Tottenham', 'Spurs', 'Tottenham Hotspur', 'THFC'] },
  { id: 33, name: 'Manchester United', aliases: ['Man United', 'Man Utd', 'Manchester United', 'MUFC', 'Man U'] },
  { id: 34, name: 'Newcastle United', aliases: ['Newcastle', 'NUFC', 'Newcastle United', 'Magpies'] },
  { id: 51, name: 'Brighton & Hove Albion', aliases: ['Brighton', 'BHA', 'Brighton Hove Albion', 'Seagulls'] },
  { id: 48, name: 'West Ham United', aliases: ['West Ham', 'WHUFC', 'West Ham United', 'Hammers'] },
  { id: 66, name: 'Aston Villa', aliases: ['Aston Villa', 'Villa', 'AVFC', 'Villans'] },
  { id: 52, name: 'Crystal Palace', aliases: ['Crystal Palace', 'Palace', 'CPFC', 'Eagles'] },
  { id: 45, name: 'Everton', aliases: ['Everton', 'EFC', 'Everton FC', 'Toffees'] },
  { id: 46, name: 'Leicester City', aliases: ['Leicester', 'LCFC', 'Leicester City', 'Foxes'] },
  { id: 39, name: 'Wolverhampton Wanderers', aliases: ['Wolves', 'Wolverhampton', 'Wolves FC', 'Wanderers'] },
  { id: 55, name: 'Brentford', aliases: ['Brentford', 'BFC', 'Brentford FC', 'Bees'] },
  { id: 35, name: 'Fulham', aliases: ['Fulham', 'FFC', 'Fulham FC', 'Cottagers'] },
  { id: 36, name: 'Nottingham Forest', aliases: ['Nottingham Forest', 'Forest', 'NFFC', 'Reds'] },
  { id: 65, name: 'Sheffield United', aliases: ['Sheffield United', 'Sheffield Utd', 'SUFC', 'Blades'] },
  { id: 62, name: 'Burnley', aliases: ['Burnley', 'BFC', 'Burnley FC', 'Clarets'] },
  { id: 71, name: 'Luton Town', aliases: ['Luton', 'Luton Town', 'LTFC', 'Hatters'] },

  // La Liga
  { id: 541, name: 'Real Madrid', aliases: ['Real Madrid', 'Real', 'Madrid', 'Real M', 'Los Blancos', 'RMCF'] },
  { id: 529, name: 'FC Barcelona', aliases: ['Barcelona', 'Barça', 'Barca', 'Barcelone', 'FCB', 'FC Barcelona', 'Blaugrana'] },
  { id: 530, name: 'Atletico Madrid', aliases: ['Atletico', 'Atlético Madrid', 'Atletico M', 'Atleti', 'Atlético', 'AM'] },
  { id: 543, name: 'Sevilla FC', aliases: ['Sevilla', 'Sevilla FC', 'Sevilla Fútbol Club'] },
  { id: 532, name: 'Valencia CF', aliases: ['Valencia', 'Valencia CF', 'Valencia Club de Fútbol'] },
  { id: 533, name: 'Villarreal CF', aliases: ['Villarreal', 'Villarreal CF', 'Yellow Submarine'] },
  { id: 548, name: 'Real Sociedad', aliases: ['Real Sociedad', 'Sociedad', 'Real Soc', 'La Real'] },
  { id: 531, name: 'Athletic Bilbao', aliases: ['Athletic Bilbao', 'Athletic', 'Bilbao', 'Athletic Club', 'Los Leones'] },
  { id: 536, name: 'Real Betis', aliases: ['Betis', 'Real Betis', 'Betis Sevilla', 'Los Verdiblancos'] },
  { id: 538, name: 'Getafe CF', aliases: ['Getafe', 'Getafe CF', 'Azulones'] },
  { id: 540, name: 'Rayo Vallecano', aliases: ['Rayo Vallecano', 'Rayo', 'Vallecano', 'Rayo V'] },
  { id: 542, name: 'Real Valladolid', aliases: ['Valladolid', 'Real Valladolid', 'Pucela'] },
  { id: 546, name: 'Girona FC', aliases: ['Girona', 'Girona FC', 'Girona Futbol Club'] },
  { id: 547, name: 'Las Palmas', aliases: ['Las Palmas', 'UD Las Palmas', 'UDLP', 'Palmas'] },
  { id: 550, name: 'Osasuna', aliases: ['Osasuna', 'CA Osasuna', 'Rojillos'] },
  { id: 551, name: 'Celta Vigo', aliases: ['Celta Vigo', 'Celta', 'Vigo', 'RC Celta', 'Celestes'] },
  { id: 552, name: 'Alaves', aliases: ['Alaves', 'Deportivo Alavés', 'Alavés', 'Babazorros'] },
  { id: 554, name: 'Cadiz CF', aliases: ['Cadiz', 'Cádiz CF', 'Cádiz', 'Cadiz CF'] },
  { id: 555, name: 'Granada CF', aliases: ['Granada', 'Granada CF', 'Nazaríes'] },

  // Bundesliga
  { id: 157, name: 'Bayern Munich', aliases: ['Bayern', 'Bayern Munich', 'Bayern München', 'FC Bayern', 'Bayern M', 'FCB'] },
  { id: 165, name: 'Borussia Dortmund', aliases: ['Dortmund', 'Borussia Dortmund', 'BVB', 'Dortmund BVB', 'Borussia D', 'Dortumund'] },
  { id: 173, name: 'RB Leipzig', aliases: ['Leipzig', 'RB Leipzig', 'RBL', 'Red Bull Leipzig', 'Leipzig RB'] },
  { id: 168, name: 'Bayer Leverkusen', aliases: ['Leverkusen', 'Bayer Leverkusen', 'Bayer 04', 'Werkself'] },
  { id: 160, name: 'SC Freiburg', aliases: ['Freiburg', 'SC Freiburg', 'Freiburg SC', 'Breisgau-Brasilianer'] },
  { id: 169, name: 'Eintracht Frankfurt', aliases: ['Frankfurt', 'Eintracht Frankfurt', 'Eintracht', 'SGE', 'Frankfurt E'] },
  { id: 161, name: 'VfL Wolfsburg', aliases: ['Wolfsburg', 'VfL Wolfsburg', 'VfL W', 'Wolves'] },
  { id: 162, name: 'TSG Hoffenheim', aliases: ['Hoffenheim', 'TSG Hoffenheim', 'TSG', 'Hoffenheim TSG'] },
  { id: 163, name: '1. FC Union Berlin', aliases: ['Union Berlin', 'Union', 'FC Union Berlin', 'Union B', '1. FC Union'] },
  { id: 164, name: 'Borussia Mönchengladbach', aliases: ['Gladbach', 'Mönchengladbach', 'Borussia M', 'BMG', 'Borussia MG'] },
  { id: 167, name: 'VfL Bochum', aliases: ['Bochum', 'VfL Bochum', 'VfL B', 'Bochum VfL'] },
  { id: 170, name: '1. FC Köln', aliases: ['Köln', 'Koln', '1. FC Köln', 'FC Köln', '1. FC Koln', 'FC Koln'] },
  { id: 172, name: 'Werder Bremen', aliases: ['Bremen', 'Werder Bremen', 'Werder', 'SV Werder'] },
  { id: 174, name: 'VfB Stuttgart', aliases: ['Stuttgart', 'VfB Stuttgart', 'VfB S', 'Stuttgart VfB'] },
  { id: 182, name: '1. FSV Mainz 05', aliases: ['Mainz', 'Mainz 05', 'FSV Mainz', '1. FSV Mainz'] },
  { id: 176, name: 'FC Augsburg', aliases: ['Augsburg', 'FC Augsburg', 'FCA', 'Augsburg FC'] },
  { id: 178, name: 'Darmstadt 98', aliases: ['Darmstadt', 'Darmstadt 98', 'SV Darmstadt', 'Lilien'] },
  { id: 192, name: '1. FC Heidenheim', aliases: ['Heidenheim', '1. FC Heidenheim', 'FC Heidenheim', 'FCH'] },

  // Serie A
  { id: 489, name: 'AC Milan', aliases: ['Milan', 'AC Milan', 'ACM', 'Milan AC', 'Rossoneri'] },
  { id: 108, name: 'Inter Milan', aliases: ['Inter', 'Inter Milan', 'Inter Milano', 'FC Internazionale', 'Nerazzurri'] },
  { id: 99, name: 'Juventus', aliases: ['Juventus', 'Juve', 'Juventus Turin', 'JUV', 'Old Lady'] },
  { id: 98, name: 'AS Roma', aliases: ['Roma', 'AS Roma', 'Roma AS', 'Giallorossi'] },
  { id: 109, name: 'Napoli', aliases: ['Napoli', 'SSC Napoli', 'Napoli SSC', 'Partenopei'] },
  { id: 102, name: 'Atalanta', aliases: ['Atalanta', 'Atalanta BC', 'Atalanta Bergamo', 'La Dea'] },
  { id: 103, name: 'Lazio', aliases: ['Lazio', 'SS Lazio', 'Lazio SS', 'Biancocelesti'] },
  { id: 99, name: 'ACF Fiorentina', aliases: ['Fiorentina', 'ACF Fiorentina', 'Fiorentina ACF', 'Viola'] },
  { id: 107, name: 'Bologna', aliases: ['Bologna', 'Bologna FC', 'Bologna 1909', 'Rossoblù'] },
  { id: 104, name: 'Torino', aliases: ['Torino', 'Torino FC', 'Torino Football Club', 'Il Toro'] },
  { id: 110, name: 'Udinese', aliases: ['Udinese', 'Udinese Calcio', 'Udinese FC', 'Bianconeri'] },
  { id: 471, name: 'Sassuolo', aliases: ['Sassuolo', 'US Sassuolo', 'Sassuolo US', 'Neroverdi'] },
  { id: 106, name: 'Genoa', aliases: ['Genoa', 'Genoa CFC', 'Genoa 1893', 'Grifone'] },
  { id: 105, name: 'Cagliari', aliases: ['Cagliari', 'Cagliari Calcio', 'Cagliari FC', 'Rossoblù'] },
  { id: 100, name: 'Hellas Verona', aliases: ['Verona', 'Hellas Verona', 'Verona FC', 'Gialloblu'] },
  { id: 108, name: 'Empoli', aliases: ['Empoli', 'Empoli FC', 'FC Empoli', 'Azzurri'] },
  { id: 445, name: 'Monza', aliases: ['Monza', 'AC Monza', 'Monza AC', 'Biancorossi'] },
  { id: 450, name: 'Frosinone', aliases: ['Frosinone', 'Frosinone Calcio', 'Frosinone FC', 'Canarini'] },
  { id: 487, name: 'Salernitana', aliases: ['Salernitana', 'US Salernitana', 'Salernitana US', 'Granata'] },
  { id: 488, name: 'Lecce', aliases: ['Lecce', 'US Lecce', 'Lecce US', 'Giallorossi'] },

  // Autres équipes majeures
  { id: 228, name: 'FC Porto', aliases: ['Porto', 'FC Porto', 'FCP', 'Porto FC'] },
  { id: 211, name: 'SL Benfica', aliases: ['Benfica', 'SL Benfica', 'Benfica Lisbonne', 'Eagles'] },
  { id: 212, name: 'Sporting CP', aliases: ['Sporting', 'Sporting CP', 'Sporting Lisbon', 'Sporting Lisbonne', 'Lions'] },
  { id: 197, name: 'Ajax', aliases: ['Ajax', 'Ajax Amsterdam', 'AFC Ajax', 'Ajax AFC'] },
  { id: 194, name: 'PSV Eindhoven', aliases: ['PSV', 'PSV Eindhoven', 'PSV E', 'Boeren'] },
  { id: 201, name: 'Feyenoord', aliases: ['Feyenoord', 'Feyenoord Rotterdam', 'Feyenoord R', 'De Club'] },
  { id: 247, name: 'Celtic', aliases: ['Celtic', 'Celtic Glasgow', 'Celtic FC', 'Bhoys'] },
  { id: 257, name: 'Rangers', aliases: ['Rangers', 'Rangers FC', 'Glasgow Rangers', 'Gers'] },
]

/**
 * Instance Fuse.js configurée pour la recherche floue
 */
const fuse = new Fuse(MAJOR_TEAMS, {
  keys: ['name', 'aliases'],
  threshold: 0.3, // Seuil de similarité (0 = exact, 1 = très permissif)
  includeScore: true,
  minMatchCharLength: 3, // Minimum 3 caractères pour éviter les faux positifs
})

/**
 * Recherche floue d'une équipe
 * @param query Nom de l'équipe recherchée (peut contenir des fautes de frappe)
 * @returns L'équipe trouvée avec son ID API-Football, ou null si aucune correspondance
 */
export function findTeam(query: string): { id: number; name: string } | null {
  if (!query || query.trim().length < 3) {
    return null
  }

  // Normaliser la requête (enlever accents, minuscules)
  const normalizedQuery = query
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  // Recherche avec Fuse.js
  const results = fuse.search(normalizedQuery)

  if (results.length === 0) {
    return null
  }

  // Prendre le premier résultat (le plus proche)
  const bestMatch = results[0]
  const team = bestMatch.item

  // Vérifier que le score est acceptable (plus le score est bas, meilleure est la correspondance)
  // Score < 0.3 = très bonne correspondance
  if (bestMatch.score && bestMatch.score > 0.4) {
    // Score trop élevé = correspondance trop faible
    return null
  }

  return {
    id: team.id,
    name: team.name,
  }
}

/**
 * Recherche exacte d'une équipe (sans fuzzy)
 * @param query Nom exact de l'équipe
 * @returns L'équipe trouvée ou null
 */
export function findTeamExact(query: string): { id: number; name: string } | null {
  if (!query || query.trim().length < 3) {
    return null
  }

  const normalizedQuery = query
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  // Recherche exacte dans les noms et alias
  const team = MAJOR_TEAMS.find((t) => {
    const nameMatch = t.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') === normalizedQuery

    const aliasMatch = t.aliases.some(
      (alias) =>
        alias
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') === normalizedQuery
    )

    return nameMatch || aliasMatch
  })

  if (!team) {
    return null
  }

  return {
    id: team.id,
    name: team.name,
  }
}

