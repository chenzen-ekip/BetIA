import Sidebar from './components/Sidebar/Sidebar'
import Header from './components/Common/Header'
import ChatInterface from './components/ChatInterface/ChatInterface'
import Footer from './components/Common/Footer'

export default function Home() {
  return (
    <div className="flex h-screen bg-[#0a0a0a]">
      {/* Sidebar - 280px fixed */}
      <Sidebar />

      {/* Main content - flex 1 */}
      <div className="flex-1 flex flex-col">
        {/* Header - 60px */}
        <Header />

        {/* Chat area - flex 1 */}
        <ChatInterface />

        {/* Footer - auto */}
        <Footer />
      </div>
    </div>
  )
}
