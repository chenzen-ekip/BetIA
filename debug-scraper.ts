
import fs from 'fs';
import path from 'path';
import { VisualScraperService } from './lib/services/visualScraperService';

// Load .env manually since we are running a standalone script
try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim();
        }
    });
    console.log('✅ Environment variables loaded');
} catch (e) {
    console.error('⚠️ Could not load .env file', e);
}

async function runDebug() {
    console.log('🚀 Starting Debug Scraper...');

    // Test with a known high-profile match
    const home = 'Liverpool';
    const away = 'Real Madrid';

    console.log(`Testing for: ${home} vs ${away}`);

    try {
        const results = await VisualScraperService.getExpertConsensus(home, away);
        console.log('\n🏁 Final Results:');
        console.log(JSON.stringify(results, null, 2));
    } catch (error) {
        console.error('❌ Fatal Error:', error);
    }
}

runDebug();
