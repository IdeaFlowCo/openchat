import React from "react";

function ChatMessage({ message, sender }) {
    return (
        <div className={`py-5 rounded-2xl shadow-lg ${sender !== "AI" ? " bg-slate-600 text-white" : " bg-indigo-600 text-white"}`}>
            <div className="flex space-x-5 px-10 max-w-2xl mx-auto">
                <p className=" text-md">{message}</p>
            </div>
        </div>
    );
}

export default ChatMessage;
