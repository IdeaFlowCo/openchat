import React from 'react'
import Meta from 'components/Meta'
// import StreamingChat from "../components/chat/StreamingChat";
import ErrorBoundary from '../components/atoms/ErrorBoundary'
import { requireAuth } from '../util/auth'
import dynamic from 'next/dynamic'

const PorcupineChat = dynamic(
  () =>
    import('../components/chat/PorcupineChat').then((mod) => mod.PorcupineChat),
  {
    ssr: false,
  }
)

function ChatPage(props) {
  return (
    <ErrorBoundary fallback={<PorcupineChat />}>
      <Meta title="Chat" description="Chat with GPT" />
      {/* <StreamingChat /> */}
      <PorcupineChat />
    </ErrorBoundary>
  )
}

export default requireAuth(ChatPage)
