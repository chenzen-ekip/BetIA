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
            // 1. Trouver l'URL du match (Deep Link)
            const query = `site:${site.domain} prediction ${homeTeam} vs ${awayTeam}`
            const searchResults = await searchWithSerper(query)

            const matchUrl = searchResults?.organic?.[0]?.link

            if (!matchUrl) {
                console.warn(`⚠️ Pas d'URL trouvée pour ${site.name}`)
                return { site: site.name, prediction: '', confidence: '', found: false }
            }

            console.log(`🔗 URL trouvée pour ${site.name}: ${matchUrl}`)

            // 2. Capture d'écran (ScreenshotOne)
            const screenshotUrl = this.generateScreenshotUrl(matchUrl)

            // 3. Analyse Vision (GPT-4o)
            const prediction = await this.analyzeScreenshotWithGPT(screenshotUrl, site.name, homeTeam, awayTeam)

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
            viewport_height: '1200', // Assez haut pour voir le tableau principal
            device_scale_factor: '1',
            format: 'jpg',
            image_quality: '80',
            block_ads: 'true',
            block_cookie_banners: 'true',
            block_trackers: 'true',
            wait_for_selector: 'body', // Attendre que le body soit chargé
        })

        return `https://api.screenshotone.com/take?${params.toString()}`
    }

    /**
     * Appelle GPT-4o Vision pour lire le tableau
     */
    private static async analyzeScreenshotWithGPT(imageUrl: string, siteName: string, homeTeam: string, awayTeam: string) {
        const prompt = `
Tu es un assistant expert en lecture de tableaux de paris sportifs.
Ta mission : Trouver la ligne ou la section du match **${homeTeam} vs ${awayTeam}** dans cette capture d'écran du site ${siteName} et extraire le pronostic.

DICTIONNAIRE DE TRADUCTION OBLIGATOIRE :
- Colonnes '1', 'Home', 'H' ou un pourcentage élevé à gauche -> Résultat : 'VICTOIRE DOMICILE'.
- Colonnes 'X', 'Draw', 'D' -> Résultat : 'MATCH NUL'.
- Colonnes '2', 'Away', 'A' -> Résultat : 'VICTOIRE EXTÉRIEUR'.
- Symboles 'BTTS', 'GG' (Goal Goal), 'Yes' -> Résultat : 'LES DEUX MARQUENT'.
- Symboles 'Over 2.5', '+2.5', '>2.5' -> Résultat : 'PLUS DE 2.5 BUTS'.
- Symboles 'Under 2.5', '-2.5', '<2.5' -> Résultat : 'MOINS DE 2.5 BUTS'.

Si tu vois un score exact (ex: 2-1), mentionne-le aussi.

FORMAT DE SORTIE (JSON SEULEMENT) :
{
  "found": true/false,
  "prediction_raw": "Le symbole ou texte exact que tu as vu",
  "prediction_clear": "La traduction standardisée (ex: VICTOIRE DOMICILE)",
  "score_exact": "Score si visible, sinon null"
}
`

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
                                url: imageUrl,
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
    }
}
