import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
    title: string
    value: string
    change?: string
    icon: LucideIcon
    trend?: 'up' | 'down' | 'neutral'
}

export default function StatsCard({ title, value, change, icon: Icon, trend }: StatsCardProps) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="bg-[#1a1a1a] p-6 rounded-xl border border-[#2a2a2a]"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-[#2a2a2a] rounded-lg">
                    <Icon className="w-6 h-6 text-[#00ff88]" />
                </div>
                {change && (
                    <span className={`text-sm font-medium ${trend === 'up' ? 'text-[#00ff88]' : trend === 'down' ? 'text-red-500' : 'text-gray-400'
                        }`}>
                        {change}
                    </span>
                )}
            </div>
            <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </motion.div>
    )
}
