// Rate limiting simple en mémoire (pour beta)
// En production, utiliser @upstash/ratelimit avec Redis

interface RateLimitStore {
  [userId: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Nettoyer les entrées expirées toutes les 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach((userId) => {
    if (store[userId].resetTime < now) {
      delete store[userId]
    }
  })
}, 5 * 60 * 1000)

export async function checkRateLimit(
  userId: string,
  maxRequests: number = 10,
  windowMs: number = 60 * 1000 // 1 minute par défaut
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const now = Date.now()
  const userLimit = store[userId]

  // Si pas de limite ou limite expirée, créer une nouvelle
  if (!userLimit || userLimit.resetTime < now) {
    store[userId] = {
      count: 1,
      resetTime: now + windowMs,
    }
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    }
  }

  // Si limite atteinte
  if (userLimit.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: userLimit.resetTime,
    }
  }

  // Incrémenter le compteur
  userLimit.count++
  return {
    allowed: true,
    remaining: maxRequests - userLimit.count,
    resetTime: userLimit.resetTime,
  }
}

