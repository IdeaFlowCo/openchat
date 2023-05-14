import React from "react";
import AppearAnimation from "./atoms/AppearAnimation";

function ChatMessage({ message, sender }) {
    return (
        <AppearAnimation
            className={`px-5 py-3 rounded-2xl border-[0.5px] border-black/1 w-fit ${
                sender !== "AI"
                    ? " bg-indigo-600 text-white self-end"
                    : " bg-[#f4f7fb] text-gray-900"
            }`}
        >
            <p className="text-md max-w-md">{message}</p>
        </AppearAnimation>
    );
}

export default ChatMessage;
