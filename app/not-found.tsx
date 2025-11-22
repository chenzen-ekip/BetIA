export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-screen bg-[#0a0a0a] text-white">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4">Page non trouvée</h2>
        <p className="text-[#a0a0a0] mb-6">La page que vous recherchez n'existe pas.</p>
        <a
          href="/"
          className="bg-[#10a37f] hover:bg-[#0d8a6f] text-white px-6 py-3 rounded-lg transition-colors inline-block"
        >
          Retour à l'accueil
        </a>
      </div>
    </div>
  )
}


