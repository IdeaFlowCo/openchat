import React from "react";
import Meta from "components/Meta";
import ContactSection from "components/landing/ContactSection";
import Chat from "../components/chat/Chat";
import { requireAuth } from "../util/auth";
function ChatPage(props) {
    return (
        <>
            <Meta title="Chat" description="Chat with GPT" />
            <Chat />
        </>
    );
}

export default requireAuth(ChatPage);
