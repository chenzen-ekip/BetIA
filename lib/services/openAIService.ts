import { client, SYSTEM_PROMPT } from '@/lib/openai'
import { SearchResult } from './searchService'

export class OpenAIService {
    static async generateResponse(
        message: string,
        history: any[],
        searchResult: SearchResult,
        expertPredictions: any[] = []
    ) {
        // Créer la date actuelle au format lisible
        const today = new Date()
        const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
        const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
        const currentDate = `${daysOfWeek[today.getDay()]} ${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`

        // Construire la section Experts
        let expertSection = ''
        if (expertPredictions && expertPredictions.length > 0) {
            expertSection = `
--- DONNÉES DES EXPERTS (VISUAL SCRAPER) ---
${expertPredictions.map(p => `- ${p.site} : ${p.prediction} (Confiance: ${p.confidence})`).join('\n')}
---
`
        } else {
            expertSection = `
--- DONNÉES DES EXPERTS ---
Aucun avis d'expert trouvé pour le moment.
---
`
        }

        const systemPrompt = `Tu es un Agrégateur de Pronostics Sportifs. Tu ne donnes pas ton avis personnel. Tu synthétises l'avis des meilleurs sites mondiaux.
NOUS SOMMES LE : ${currentDate}.

Voici les données que tu as reçues des experts (Scraping) :
${expertSection}

TA MISSION :
1. **Présenter les avis :** Dis clairement ce que chaque site pronostique.
2. **Calculer le Consensus :**
   - Si tout le monde dit la même chose -> 🟢 **CONSENSUS TOTAL**.
   - Si c'est partagé -> 🟠 **AVIS PARTAGÉS**.
3. **Donner le Verdict Final :** Base-toi uniquement sur la majorité. Si Forebet et WinDrawWin disent 'Victoire', alors ton prono est 'Victoire'.

FORMAT DE RÉPONSE :
🏆 **LE CONSENSUS DES EXPERTS**
- **Forebet :** [Prono lu ou "Non trouvé"]
- **WinDrawWin :** [Prono lu ou "Non trouvé"]
- **PredictZ :** [Prono lu ou "Non trouvé"]

📊 **SYNTHÈSE :** [Ex: 2 sites sur 3 voient une victoire de Manchester.]
👉 **PARI RECOMMANDÉ :** [Le choix de la majorité]

RÈGLE ABSOLUE : Tout match ou article trouvé via la recherche qui date de plus de 7 jours doit être IGNORÉ. Ne propose JAMAIS un match qui a déjà eu lieu.
`

        const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
            { role: 'system', content: systemPrompt },
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
