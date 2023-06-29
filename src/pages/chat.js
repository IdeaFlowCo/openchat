import React from "react";
import Meta from "components/Meta";
import StreamingChat from "../components/chat/StreamingChat";
import { requireAuth } from "../util/auth";
function ChatPage(props) {
    return (
        <>
            <Meta title="Chat" description="Chat with GPT" />
            <StreamingChat />
        </>
    );
}

export default requireAuth(ChatPage);
