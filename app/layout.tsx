import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'
import { ClerkProvider } from '@clerk/nextjs'
import { UserButton, SignInButton, SignedIn, SignedOut } from '@clerk/nextjs'
import '@/lib/env' // Valider les variables d'environnement au démarrage

export const metadata: Metadata = {
  title: 'Sports Betting Assistant - ChatGPT des Paris Sportifs',
  description: 'Assistant conversationnel expert en paris sportifs et analyse de football',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="fr">
        <body>
          {/* Barre de menu */}
          <nav className="w-full border-b border-[#2a2a2a] bg-[#0a0a0a] px-6 py-4 flex items-center justify-between">
            <div className="text-xl font-semibold text-white">
              BetIA
            </div>
            <div className="flex items-center">
              <SignedIn>
                <UserButton />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 bg-[#10a37f] text-white rounded-lg hover:bg-[#0d8f6f] transition-colors">
                    Se connecter
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </nav>
          <Providers>{children}</Providers>
        </body>
      </html>
    </ClerkProvider>
  )
}

