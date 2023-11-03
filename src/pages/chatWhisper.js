import React from 'react';
import Meta from 'components/Meta';
import ErrorBoundary from '../components/atoms/ErrorBoundary';
import { requireAuth } from '../util/auth';
import dynamic from 'next/dynamic';

const StreamingChat = dynamic(
  () =>
    // import('../components/chat/StreamingChat').then((mod) => mod.StreamingChat),
    // import('../components/chat/PorcupineChat').then((mod) => mod.PorcupineChat),
    import('../components/chat/GoogleSttWhisperChat').then((mod) => mod.GoogleSttWhisperChat),
  {
    ssr: false,
  }
);

function ChatPage(props) {
  return (
    <ErrorBoundary fallback={<StreamingChat />}>
      <Meta title='Chat' description='Chat with GPT' />
      <StreamingChat />
    </ErrorBoundary>
  );
}

// TODO: uncomment when supabase work again
export default requireAuth(ChatPage);
// export default ChatPage
