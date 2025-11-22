'use client'

import { useChatContext } from '@/contexts/ChatContext'
import MessageList from './MessageList'
import InputBox from './InputBox'
import ErrorMessage from './ErrorMessage'

export default function ChatInterface() {
  const { messages, isLoading, error, sendMessage } = useChatContext()

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        {error && <ErrorMessage message={error} />}
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      {/* Input area */}
      <div className="border-t border-[#2a2a2a] px-6 py-6 bg-[#0a0a0a]">
        <InputBox onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}

