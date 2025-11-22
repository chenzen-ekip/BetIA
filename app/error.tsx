'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center h-screen bg-[#0a0a0a] text-white">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Une erreur est survenue</h2>
        <p className="text-[#a0a0a0] mb-6">{error.message || 'Erreur inconnue'}</p>
        <button
          onClick={reset}
          className="bg-[#10a37f] hover:bg-[#0d8a6f] text-white px-6 py-3 rounded-lg transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  )
}


