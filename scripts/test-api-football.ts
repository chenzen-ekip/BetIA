/**
 * Script de test pour l'API-Football
 * Usage: npx tsx scripts/test-api-football.ts
 */

import { getMatchData } from '../lib/football'

async function testAPI() {
  console.log('🧪 Test de l\'API-Football...\n')

  // Test avec une équipe populaire
  const testTeams = ['Bayern Munich', 'PSG', 'Real Madrid', 'Manchester City']

  for (const team of testTeams) {
    console.log(`\n📊 Test avec: ${team}`)
    console.log('─'.repeat(50))

    try {
      const data = await getMatchData(team)

      if (data) {
        console.log('✅ Données récupérées avec succès!')
        console.log(`\n📅 Match: ${data.match.homeTeam} vs ${data.match.awayTeam}`)
        console.log(`📆 Date: ${new Date(data.match.date).toLocaleString('fr-FR')}`)
        console.log(`🏆 Compétition: ${data.match.league} (${data.match.country})`)
        console.log(`📊 Statut: ${data.status}`)

        if (data.odds.homeWin || data.odds.draw || data.odds.awayWin) {
          console.log('\n💰 Cotes:')
          if (data.odds.homeWin) console.log(`  - Victoire ${data.match.homeTeam}: ${data.odds.homeWin}`)
          if (data.odds.draw) console.log(`  - Match nul: ${data.odds.draw}`)
          if (data.odds.awayWin) console.log(`  - Victoire ${data.match.awayTeam}: ${data.odds.awayWin}`)
          if (data.odds.over25) console.log(`  - Plus de 2.5 buts: ${data.odds.over25}`)
          if (data.odds.under25) console.log(`  - Moins de 2.5 buts: ${data.odds.under25}`)
        } else {
          console.log('⚠️  Aucune cote disponible')
        }

        if (data.injuries.length > 0) {
          console.log(`\n🏥 Blessures (${data.injuries.length}):`)
          data.injuries.slice(0, 5).forEach((inj) => {
            console.log(`  - ${inj.player} (${inj.team}): ${inj.reason}`)
          })
        } else {
          console.log('\n✅ Aucune blessure confirmée')
        }

        // Arrêter après le premier succès
        break
      } else {
        console.log(`❌ Aucune donnée pour ${team}`)
      }
    } catch (error: any) {
      console.error(`❌ Erreur pour ${team}:`, error.message)
    }
  }

  console.log('\n' + '─'.repeat(50))
  console.log('✅ Test terminé!')
}

// Vérifier que RAPIDAPI_KEY est configurée
if (!process.env.RAPIDAPI_KEY) {
  console.error('❌ RAPIDAPI_KEY non trouvée dans les variables d\'environnement')
  console.error('   Assurez-vous d\'avoir ajouté RAPIDAPI_KEY dans .env.local')
  process.exit(1)
}

testAPI().catch(console.error)

