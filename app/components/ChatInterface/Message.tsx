'use client'

import { memo } from 'react'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Message as MessageType } from '@/lib/types'
import { messageVariants } from '@/lib/animations'

interface MessageProps {
  message: MessageType
  index: number
}

const Message = memo(({ message, index }: MessageProps) => {
  const isUser = message.role === 'user'

  return (
    <motion.div
      variants={messageVariants}
      initial="hidden"
      animate="visible"
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? 'bg-[#10a37f] text-white'
            : 'bg-[#1a1a1a] text-[#ffffff] border border-[#2a2a2a]'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => (
                  <h1 className="text-xl font-bold mb-2 mt-4 first:mt-0" {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 className="text-lg font-bold mb-2 mt-3 first:mt-0" {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 className="text-base font-semibold mb-1 mt-2 first:mt-0" {...props} />
                ),
                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                ul: ({ node, ...props }) => (
                  <ul className="list-disc list-inside mb-2 space-y-1" {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />
                ),
                li: ({ node, ...props }) => <li className="ml-4" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                code: ({ node, ...props }) => (
                  <code className="bg-[#2a2a2a] px-1 py-0.5 rounded text-sm" {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  )
})

Message.displayName = 'Message'

export default Message


