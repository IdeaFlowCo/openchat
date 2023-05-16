import React, { useState, useEffect } from "react";
import { useMessagesBySubmission } from "util/db";
import ChatMessage from "./ChatMessage";
import { toast } from "react-hot-toast";

function SubmissionTranscript({ deepformId, submissionId }) {
    // const { data: deepformData, status: deepformStatus } = useDeepform(
    //     deepformId
    // );

    const { data: messagesData, status: messagesStatus } =
        useMessagesBySubmission(submissionId);

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    // console.log("deepformData", deepformData);
    // console.log("messagesData", messagesData);
    useEffect(() => {
        if (messagesStatus === "success") {
            setMessages(messagesData);
        }
    }, [messagesStatus]);
    // UseEffect that scrolls down to the bottom of the chat
    // whenever a new message is sent
    // useEffect(() => {
    //     const chat = document.getElementById("chat");
    //     chat.scrollTop = chat.scrollHeight;
    // }, [messages]);

    return (
        <>
            {/* <section className="flex flex-col justify-center items-center sm:mx-auto h-[80vh] b"> */}
            <div
                id="chat"
                className="flex justify-center items-start sm:pt-4 w-full max-h-[400px] overflow-y-scroll"
            >
                <div className="container flex flex-col gap-2 max-w-3xl">
                    {messages.map((message, index) => (
                        <ChatMessage
                            key={index}
                            message={message.message}
                            sender={message.sender}
                        />
                    ))}
                    {messages.length === 0 && (
                        <div className="flex justify-center items-center w-full h-full">
                            <p className="text-black/40 text-center">
                                No transcript found! Please try refreshing the
                                page. If the problem persists, please contact
                                support. 
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* <div className="w-full h-[20vh]"></div> */}
        </>
        // </section>
    );
}

export default SubmissionTranscript;
