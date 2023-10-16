import React from 'react'
import AppearAnimation from './BasicAppearAnimation'

function ChatMessage({ message, sender }) {
  return (
    <AppearAnimation
      className={`border-black/1 w-fit rounded-2xl border-[0.5px] px-5 py-3 break-words ${
        sender !== 'assistant'
          ? ' self-end bg-indigo-600 text-white'
          : ' bg-[#f4f7fb] text-gray-900'
      }`}
    >
      <p className="text-md max-w-md">{message}</p>
    </AppearAnimation>
  )
}

export default ChatMessage
