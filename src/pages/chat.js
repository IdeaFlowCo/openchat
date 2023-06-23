import React from "react";
import Meta from "components/Meta";
import ContactSection from "components/landing/ContactSection";
import Chat from "../components/chat/Chat";
import TestChat from "../components/chat/TestChat";
import StreamingChat from "../components/chat/StreamingChat";
import { requireAuth } from "../util/auth";
function ChatPage(props) {
    return (
        <>
            <Meta title="Chat" description="Chat with GPT" />
            <StreamingChat />
            {/* <Chat /> */}
            {/* <TestChat /> */}
        </>
    );
}

export default requireAuth(ChatPage);
