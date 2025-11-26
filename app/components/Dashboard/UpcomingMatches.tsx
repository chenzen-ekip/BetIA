import { motion } from 'framer-motion'

interface Match {
    id: string
    homeTeam: string
    awayTeam: string
    date: string
    prediction?: {
        type: string
        selection: string
        confidence: string
        probability: number
    }
}

interface UpcomingMatchesProps {
    matches: Match[]
}

export default function UpcomingMatches({ matches }: UpcomingMatchesProps) {
    return (
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] overflow-hidden">
            <div className="p-6 border-b border-[#2a2a2a]">
                <h2 className="text-lg font-semibold text-white">Prochains Matchs & Prédictions</h2>
            </div>
            <div className="divide-y divide-[#2a2a2a]">
                {matches.map((match) => (
                    <motion.div
                        key={match.id}
                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                        className="p-4 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-400 w-16">
                                {new Date(match.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-white font-medium">{match.homeTeam}</span>
                                <span className="text-white font-medium">{match.awayTeam}</span>
                            </div>
                        </div>

                        {match.prediction ? (
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold px-2 py-1 rounded bg-[#00ff88]/10 text-[#00ff88]">
                                        {match.prediction.selection}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded ${match.prediction.confidence === 'HIGH' ? 'bg-green-500/20 text-green-400' :
                                            match.prediction.confidence === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                        }`}>
                                        {Math.round(match.prediction.probability * 100)}%
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500 mt-1">{match.prediction.type}</span>
                            </div>
                        ) : (
                            <span className="text-xs text-gray-500">En attente d'analyse</span>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
