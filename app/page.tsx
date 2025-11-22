'use client'

import { useState } from 'react'
import Sidebar from './components/Sidebar/Sidebar'
import MobileMenu from './components/Sidebar/MobileMenu'
import Header from './components/Common/Header'
import ChatInterface from './components/ChatInterface/ChatInterface'
import Footer from './components/Common/Footer'

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      {/* Sidebar Desktop - visible sur md: et plus */}
      <Sidebar />

      {/* Mobile Menu - visible uniquement sur mobile */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* Main content - flex 1 */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header - fixe sur mobile, relative sur desktop */}
        <Header onMenuClick={toggleMobileMenu} />

        {/* Chat area - flex 1 avec padding-top sur mobile pour compenser le header fixe */}
        <div className="flex-1 flex flex-col overflow-hidden md:mt-0 mt-[60px]">
          <ChatInterface />
        </div>

        {/* Footer - auto */}
        <Footer />
      </div>
    </div>
  )
}
