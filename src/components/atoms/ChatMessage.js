import React from 'react'
import AppearAnimation from './BasicAppearAnimation'
import { BE_CONCISE } from 'components/chat/constants'

function ChatMessage({ message, sender }) {
  const indexOfBeConcise = message.indexOf(BE_CONCISE)
  let filteredMessage = message
  if (indexOfBeConcise !== -1 && sender === 'user') {
    filteredMessage = message.substring(0, indexOfBeConcise)
  }
  return (
    <AppearAnimation
      className={`border-black/1 w-fit rounded-2xl border-[0.5px] px-5 py-3 break-words ${
        sender !== 'assistant'
          ? ' self-end bg-indigo-600 text-white'
          : ' bg-[#f4f7fb] text-gray-900'
      }`}
    >
      <p className="text-md max-w-md">{filteredMessage}</p>
    </AppearAnimation>
  )
}

export default ChatMessage
