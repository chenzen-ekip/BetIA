/**
 * Validation des variables d'environnement requises
 */

interface EnvConfig {
  OPENAI_API_KEY: string
  CLERK_SECRET_KEY: string
  SERPER_API_KEY?: string
  POSTGRES_PRISMA_URL?: string
  POSTGRES_URL_NON_POOLING?: string
}

const requiredEnvVars = ['OPENAI_API_KEY', 'CLERK_SECRET_KEY'] as const
const optionalEnvVars = ['SERPER_API_KEY', 'POSTGRES_PRISMA_URL', 'POSTGRES_URL_NON_POOLING'] as const

export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Vérifier les variables requises
  for (const varName of requiredEnvVars) {
    const value = process.env[varName]
    if (!value || value.trim() === '') {
      errors.push(`Variable d'environnement requise manquante: ${varName}`)
    } else {
      // Validation spécifique
      if (varName === 'OPENAI_API_KEY' && !value.startsWith('sk-')) {
        errors.push(`OPENAI_API_KEY invalide (doit commencer par 'sk-')`)
      }
      if (varName === 'CLERK_SECRET_KEY' && value.length < 20) {
        errors.push(`CLERK_SECRET_KEY semble invalide (trop court)`)
      }
    }
  }

  // Avertir pour les variables optionnelles manquantes
  const warnings: string[] = []
  for (const varName of optionalEnvVars) {
    const value = process.env[varName]
    if (!value || value.trim() === '') {
      warnings.push(`Variable optionnelle manquante: ${varName}`)
    }
  }

  if (warnings.length > 0) {
    console.warn('⚠️ Variables d\'environnement optionnelles manquantes:', warnings.join(', '))
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function getEnvConfig(): EnvConfig {
  return {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || '',
    SERPER_API_KEY: process.env.SERPER_API_KEY,
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
  }
}

// Valider au chargement du module
if (typeof window === 'undefined') {
  // Seulement côté serveur
  const validation = validateEnv()
  if (!validation.valid) {
    console.error('❌ Erreurs de configuration des variables d\'environnement:')
    validation.errors.forEach((error) => console.error(`  - ${error}`))
    console.error('\nVeuillez configurer les variables d\'environnement dans .env.local')
  } else {
    console.log('✅ Variables d\'environnement validées')
  }
}

