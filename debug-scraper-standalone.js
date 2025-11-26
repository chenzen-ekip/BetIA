
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

// 1. Load Environment Variables
function loadEnv(filename) {
    try {
        const envPath = path.resolve(process.cwd(), filename);
        if (fs.existsSync(envPath)) {
            const envFile = fs.readFileSync(envPath, 'utf8');
            envFile.split('\n').forEach(line => {
                const [key, value] = line.split('=');
                if (key && value) {
                    process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, ''); // Remove quotes
                }
            });
            console.log(`✅ Loaded ${filename}`);
        }
    } catch (e) {
        console.error(`⚠️ Could not load ${filename}`, e);
    }
}

loadEnv('.env');
loadEnv('.env.local');

console.log('🔑 Keys loaded:', {
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    SERPER_API_KEY: !!process.env.SERPER_API_KEY,
    SCREENSHOTONE_ACCESS_KEY: !!process.env.SCREENSHOTONE_ACCESS_KEY
});

// 2. Setup OpenAI
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// 3. Serper Service (Simplified)
async function searchWithSerper(query) {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
        console.warn('SERPER_API_KEY missing');
        return null;
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
                num: 10,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Serper API Error:', error);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error('Serper Search Error:', error);
        return null;
    }
}

// 4. Visual Scraper Service (Copied & Adapted)
class VisualScraperService {
    static EXPERT_SITES = [
        { name: 'Forebet', domain: 'forebet.com' },
        { name: 'WinDrawWin', domain: 'windrawwin.com' },
        { name: 'PredictZ', domain: 'predictz.com' }
    ];

    static async getExpertConsensus(homeTeam, awayTeam) {
        console.log(`🕵️‍♂️ Starting Visual Scraper for ${homeTeam} vs ${awayTeam}`);
        const promises = this.EXPERT_SITES.map(site => this.analyzeSite(site, homeTeam, awayTeam));
        const results = await Promise.all(promises);
        return results.filter(r => r.found);
    }

    static async analyzeSite(site, homeTeam, awayTeam) {
        try {
            // 1. Find URL
            let query = '';
            switch (site.name) {
                case 'Forebet':
                    query = `site:forebet.com football prediction ${homeTeam} vs ${awayTeam}`;
                    break;
                case 'WinDrawWin':
                    query = `site:windrawwin.com football prediction ${homeTeam} vs ${awayTeam}`;
                    break;
                case 'PredictZ':
                    query = `site:predictz.com football ${homeTeam} vs ${awayTeam} prediction`;
                    break;
                default:
                    query = `site:${site.domain} football prediction ${homeTeam} vs ${awayTeam}`;
            }

            console.log(`🔍 Google Search for ${site.name}: "${query}"`);
            const searchResults = await searchWithSerper(query);
            const matchUrl = searchResults?.organic?.[0]?.link;

            if (!matchUrl) {
                console.warn(`⚠️ No URL found for ${site.name}`);
                return { site: site.name, prediction: '', confidence: '', found: false };
            }

            console.log(`🔗 URL found for ${site.name}: ${matchUrl}`);

            // 2. Screenshot
            const screenshotUrl = this.generateScreenshotUrl(matchUrl);
            console.log(`📸 Screenshot URL generated for ${site.name}:`, screenshotUrl);

            // Validate Screenshot URL
            try {
                const checkRes = await fetch(screenshotUrl);
                console.log(`🔍 ScreenshotOne Status: ${checkRes.status}`);
                console.log(`🔍 ScreenshotOne Content-Type: ${checkRes.headers.get('content-type')}`);

                if (!checkRes.ok || !checkRes.headers.get('content-type')?.includes('image')) {
                    const text = await checkRes.text();
                    console.error(`❌ ScreenshotOne Failed: ${text}`);
                    return { site: site.name, prediction: '', confidence: '', found: false };
                }
            } catch (e) {
                console.error(`❌ Could not validate screenshot URL:`, e);
            }

            // 3. Vision Analysis
            const prediction = await this.analyzeScreenshotWithGPT(screenshotUrl, site.name, homeTeam, awayTeam);
            console.log(`🧠 Vision Analysis for ${site.name}:`, prediction);

            return {
                site: site.name,
                prediction: prediction.prediction_clear,
                confidence: 'HIGH',
                imageUrl: screenshotUrl,
                found: prediction.found
            };

        } catch (error) {
            console.error(`❌ Visual Scraper Error for ${site.name}:`, error);
            return { site: site.name, prediction: '', confidence: '', found: false };
        }
    }

    static generateScreenshotUrl(targetUrl) {
        const accessKey = process.env.SCREENSHOTONE_ACCESS_KEY;
        if (!accessKey) throw new Error('SCREENSHOTONE_ACCESS_KEY missing');

        console.log('🔑 Using Access Key:', accessKey.substring(0, 5) + '...');

        const params = new URLSearchParams({
            access_key: accessKey,
            url: targetUrl,
            full_page: 'false',
            viewport_width: '1280',
            viewport_height: '1500',
            device_scale_factor: '1',
            format: 'jpg',
            image_quality: '80'
        });

        return `https://api.screenshotone.com/take?${params.toString()}`;
    }

    static async analyzeScreenshotWithGPT(imageUrl, siteName, homeTeam, awayTeam) {
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
`;

        try {
            // Download image and convert to base64
            const imageResponse = await fetch(imageUrl);
            if (!imageResponse.ok) {
                throw new Error(`Failed to fetch screenshot: ${imageResponse.status}`);
            }

            const arrayBuffer = await imageResponse.arrayBuffer();
            const base64Image = Buffer.from(arrayBuffer).toString('base64');
            const dataUrl = `data:image/jpeg;base64,${base64Image}`;

            const response = await client.chat.completions.create({
                model: 'gpt-4o',
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
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error('Empty response from GPT-4o Vision');

            return JSON.parse(content);
        } catch (error) {
            console.error('Error in analyzeScreenshotWithGPT:', error);
            return {
                found: false,
                prediction_raw: '',
                prediction_clear: '',
                score_exact: null
            };
        }
    }
}

// Run Test
async function run() {
    console.log('🏁 Starting Test Run...');
    const results = await VisualScraperService.getExpertConsensus('Liverpool', 'Real Madrid');
    console.log('✅ Final Results:', JSON.stringify(results, null, 2));
}

run();
