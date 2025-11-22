'use client'

import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="border-t border-[#2a2a2a] bg-[#0a0a0a] p-4 px-4 md:px-6"
    >
      <div className="text-xs text-[#707070] space-y-1 max-w-4xl mx-auto">
        <p>
          ⚠️ Cet assistant fournit des analyses à titre informatif uniquement et ne constitue pas un conseil financier.
        </p>
        <p>
          Les paris comportent des risques. Jouez de manière responsable et ne misez que ce que vous pouvez vous permettre de perdre.
        </p>
        <p>Les résultats passés ne garantissent pas les résultats futurs.</p>
      </div>
    </motion.footer>
  )
}


