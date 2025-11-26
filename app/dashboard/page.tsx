'use client'

import { Activity, TrendingUp, DollarSign, Target } from 'lucide-react'
import StatsCard from '@/app/components/Dashboard/StatsCard'
import UpcomingMatches from '@/app/components/Dashboard/UpcomingMatches'

// Mock data pour la démo
const mockMatches = [
    {
        id: '1',
        homeTeam: 'PSG',
        awayTeam: 'Lyon',
        date: new Date(Date.now() + 86400000).toISOString(),
        prediction: {
            type: 'OVER_UNDER',
            selection: 'OVER 2.5',
            confidence: 'HIGH',
            probability: 0.82
        }
    },
    {
        id: '2',
        homeTeam: 'Marseille',
        awayTeam: 'Monaco',
        date: new Date(Date.now() + 172800000).toISOString(),
        prediction: {
            type: 'BTTS',
            selection: 'YES',
            confidence: 'MEDIUM',
            probability: 0.65
        }
    },
    {
        id: '3',
        homeTeam: 'Lille',
        awayTeam: 'Lens',
        date: new Date(Date.now() + 259200000).toISOString(),
        prediction: {
            type: 'WINNER',
            selection: 'LILLE',
            confidence: 'MEDIUM',
            probability: 0.55
        }
    }
]

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                        <p className="text-gray-400 mt-1">Vue d'ensemble de vos performances et opportunités</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="px-3 py-1 bg-[#00ff88]/10 text-[#00ff88] rounded-full text-sm font-medium">
                            V2.0 Beta
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title="Winrate Global"
                        value="68%"
                        change="+2.4%"
                        trend="up"
                        icon={Target}
                    />
                    <StatsCard
                        title="ROI Mensuel"
                        value="+12.5%"
                        change="+1.2%"
                        trend="up"
                        icon={TrendingUp}
                    />
                    <StatsCard
                        title="Bénéfice Net"
                        value="+450€"
                        change="+120€"
                        trend="up"
                        icon={DollarSign}
                    />
                    <StatsCard
                        title="Paris en Cours"
                        value="5"
                        icon={Activity}
                    />
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Upcoming Matches (2/3 width) */}
                    <div className="lg:col-span-2">
                        <UpcomingMatches matches={mockMatches} />
                    </div>

                    {/* Side Panel (1/3 width) */}
                    <div className="space-y-6">
                        <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#2a2a2a]">
                            <h3 className="text-lg font-semibold text-white mb-4">Activité Récente</h3>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-3 text-sm">
                                        <div className="w-2 h-2 rounded-full bg-[#00ff88]" />
                                        <span className="text-gray-400">Analyse générée pour</span>
                                        <span className="text-white font-medium">Arsenal vs Liverpool</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[#00ff88]/20 to-[#00ff88]/5 p-6 rounded-xl border border-[#00ff88]/20">
                            <h3 className="text-lg font-semibold text-white mb-2">Mode Pro</h3>
                            <p className="text-sm text-gray-400 mb-4">
                                Accédez aux modèles prédictifs avancés et aux données en temps réel.
                            </p>
                            <button className="w-full py-2 bg-[#00ff88] text-black font-bold rounded-lg hover:bg-[#00cc6a] transition-colors">
                                Upgrade
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
