import { searchWithSerper } from '@/lib/serper'
import { client } from '@/lib/openai'

export interface ExpertPrediction {
    site: string
    prediction: string
    confidence: string
    imageUrl?: string
    found: boolean
}

export class VisualScraperService {
    private static readonly EXPERT_SITES = [
        { name: 'Forebet', domain: 'forebet.com' },
        { name: 'WinDrawWin', domain: 'windrawwin.com' },
        { name: 'PredictZ', domain: 'predictz.com' }
    ]

    /**
     * Orchestre la récupération des avis d'experts pour un match
     */
    static async getExpertConsensus(homeTeam: string, awayTeam: string): Promise<ExpertPrediction[]> {
        console.log(`🕵️‍♂️ Démarrage du Visual Scraper pour ${homeTeam} vs ${awayTeam}`)

        const promises = this.EXPERT_SITES.map(site => this.analyzeSite(site, homeTeam, awayTeam))
        const results = await Promise.all(promises)

        return results.filter(r => r.found)
    }

    /**
     * Analyse un site spécifique : Recherche URL -> Capture -> Vision
     */
    private static async analyzeSite(site: { name: string; domain: string }, homeTeam: string, awayTeam: string): Promise<ExpertPrediction> {
        try {
            // 1. Trouver l'URL du match (Deep Link) avec des requêtes spécifiques
            // Nettoyer les noms d'équipes (enlever FC, CF, etc.)
            const cleanHome = homeTeam.replace(/\s+(FC|CF|United|City|Madrid|Barcelona)$/i, '').trim()
            const cleanAway = awayTeam.replace(/\s+(FC|CF|United|City|Madrid|Barcelona)$/i, '').trim()

            let query = ''
            switch (site.name) {
                case 'Forebet':
                    query = `site:forebet.com "${homeTeam}" "${awayTeam}" prediction`
                    break
                case 'WinDrawWin':
                    // WinDrawWin utilise souvent des URLs avec des tirets
                    query = `site:windrawwin.com "${cleanHome}" "${cleanAway}" prediction`
                    break
                case 'PredictZ':
                    query = `site:predictz.com "${homeTeam}" "${awayTeam}" prediction`
                    break
                default:
                    query = `site:${site.domain} "${homeTeam}" "${awayTeam}" prediction`
            }

            console.log(`🔍 Recherche Google pour ${site.name}: "${query}"`)
            const searchResults = await searchWithSerper(query)

            const matchUrl = searchResults?.organic?.[0]?.link

            if (!matchUrl) {
                console.warn(`⚠️ Pas d'URL trouvée pour ${site.name}`)
                return { site: site.name, prediction: '', confidence: '', found: false }
            }

            console.log(`🔗 URL trouvée pour ${site.name}: ${matchUrl}`)

            // 2. Capture d'écran (ScreenshotOne)
            const screenshotUrl = this.generateScreenshotUrl(matchUrl)
            console.log(`📸 Screenshot URL générée pour ${site.name} (options anti-pub activées)`)

            // 3. Analyse Vision (GPT-4o)
            const prediction = await this.analyzeScreenshotWithGPT(screenshotUrl, site.name, homeTeam, awayTeam)

            console.log(`🧠 Analyse Vision pour ${site.name}:`, prediction)

            return {
                site: site.name,
                prediction: prediction.prediction_clear,
                confidence: 'HIGH', // Par défaut, on considère que si c'est affiché, c'est leur avis
                imageUrl: screenshotUrl,
                found: prediction.found
            }

        } catch (error) {
            console.error(`❌ Erreur Visual Scraper pour ${site.name}:`, error)
            return { site: site.name, prediction: '', confidence: '', found: false }
        }
    }

    /**
     * Génère l'URL signée pour ScreenshotOne
     */
    private static generateScreenshotUrl(targetUrl: string): string {
        const accessKey = process.env.SCREENSHOTONE_ACCESS_KEY
        if (!accessKey) throw new Error('SCREENSHOTONE_ACCESS_KEY manquante')

        // Options pour optimiser la capture (juste le haut de la page, pas de pubs, etc.)
        const params = new URLSearchParams({
            access_key: accessKey,
            url: targetUrl,
            full_page: 'false',
            viewport_width: '1280',
            viewport_height: '1500', // Un peu plus haut pour être sûr d'avoir le tableau
            device_scale_factor: '1',
            format: 'jpg',
            image_quality: '80'
        })

        return `https://api.screenshotone.com/take?${params.toString()}`
    }

    /**
     * Appelle GPT-4o Vision pour lire le tableau
     */
    private static async analyzeScreenshotWithGPT(imageUrl: string, siteName: string, homeTeam: string, awayTeam: string) {
        const prompt = `
Tu es un assistant expert en lecture de tableaux de paris sportifs.

CONTEXTE DU MATCH :
- Équipe à DOMICILE : ${homeTeam}
- Équipe à L'EXTÉRIEUR : ${awayTeam}

Ta mission : Trouver la ligne du match **${homeTeam} vs ${awayTeam}** dans cette capture d'écran du site ${siteName} et extraire le pronostic.

INSTRUCTIONS CRITIQUES POUR IDENTIFIER LE PRONOSTIC :

1. **IDENTIFIER LES ÉQUIPES DANS L'IMAGE :**
   - Cherche les noms "${homeTeam}" et "${awayTeam}" dans l'image
   - L'équipe à DOMICILE (${homeTeam}) est généralement listée EN PREMIER ou à GAUCHE
   - L'équipe à L'EXTÉRIEUR (${awayTeam}) est généralement listée EN SECOND ou à DROITE

2. **LIRE LE PRONOSTIC :**
   - Si tu vois une coche, un pourcentage élevé, ou une mise en évidence sur la colonne "1" ou "Home" -> Le site pronostique ${homeTeam}
   - Si tu vois une coche, un pourcentage élevé, ou une mise en évidence sur la colonne "2" ou "Away" -> Le site pronostique ${awayTeam}
   - Si tu vois une coche sur "X" ou "Draw" -> Match nul

3. **TRADUCTION DU PRONOSTIC :**
   - Si le pronostic favorise ${homeTeam} -> Réponds "VICTOIRE ${homeTeam.toUpperCase()}"
   - Si le pronostic favorise ${awayTeam} -> Réponds "VICTOIRE ${awayTeam.toUpperCase()}"
   - Si c'est un match nul -> Réponds "MATCH NUL"
   - Pour BTTS/Over/Under, utilise les termes standards

4. **VÉRIFICATION FINALE :**
   - Assure-toi que le nom de l'équipe dans ta réponse correspond bien à celle qui est pronostiquée gagnante
   - Ne confonds JAMAIS domicile et extérieur

FORMAT DE SORTIE (JSON SEULEMENT) :
{
  "found": true/false,
  "prediction_raw": "Le symbole ou texte exact que tu as vu (ex: '1', '2', 'X', '48%')",
  "prediction_clear": "VICTOIRE [NOM ÉQUIPE] ou MATCH NUL ou LES DEUX MARQUENT, etc.",
  "score_exact": "Score si visible (ex: '2-1'), sinon null"
}

EXEMPLE :
Si tu vois que la colonne "2" ou "Away" est cochée pour le match ${homeTeam} vs ${awayTeam}, tu dois répondre :
{
  "found": true,
  "prediction_raw": "2",
  "prediction_clear": "VICTOIRE ${awayTeam.toUpperCase()}",
  "score_exact": null
}
`

        // Download image and convert to base64
        try {
            const imageResponse = await fetch(imageUrl)
            if (!imageResponse.ok) {
                throw new Error(`Failed to fetch screenshot: ${imageResponse.status}`)
            }

            const arrayBuffer = await imageResponse.arrayBuffer()
            const base64Image = Buffer.from(arrayBuffer).toString('base64')
            const dataUrl = `data:image/jpeg;base64,${base64Image}`

            const response = await client.chat.completions.create({
                model: 'gpt-4o', // GPT-4o est multimodal (Vision)
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: dataUrl,
                                },
                            },
                        ],
                    },
                ],
                max_tokens: 300,
                response_format: { type: 'json_object' }
            })

            const content = response.choices[0].message.content
            if (!content) throw new Error('Réponse vide de GPT-4o Vision')

            return JSON.parse(content)
        } catch (error) {
            console.error('Error in analyzeScreenshotWithGPT:', error)
            return {
                found: false,
                prediction_raw: '',
                prediction_clear: '',
                score_exact: null
            }
        }
    }
}
