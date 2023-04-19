import React, { useState } from "react";
import { useDeepform } from "util/db";
import ChatMessage from "./ChatMessage";
import { apiRequest } from "util/util";

function DeepformSection(props) {
    const { data: deepformData, status: deepformStatus } = useDeepform(
        props.id
    );
    const [messages, setMessages] = useState([
        {
            message: `Hi, I'm Orion, an AI researcher. Thank you for participating in this conversational interview. I'll be asking you a few questions about your experiences. Feel free to answer as much or as little as you'd like.`,
            sender: "AI",
        },
        {
            message: `Before we start, I'd like to get to know you a little better. What's your name?`,
            sender: "AI",
        },
    ]);

    const [textInput, setTextInput] = useState("");

    // console.log("deepformData", deepformData);

    const sendMessage = async (message) => {
        setTextInput("");

        // Create data object to send to API route /api/openai
        const data = {
            messages: [...messages, { message, sender: "human" }],
            prompt: deepformData.prompt,
            deepformId: props.id,
        };

        console.log("data", data);

        // Send data to API route /api/openai
        await fetch("/api/openai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: data ? JSON.stringify(data) : undefined,
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("data.text", data.text);
                setMessages([
                    ...messages,
                    { message: message, sender: "human" },
                    { message: data.text, sender: "AI" },
                ]);
                if (data.isEndOfInterview) {
                    // Time out for 3 seconds, then redirect to Deepform home page
                    setTimeout(() => {
                        window.location.href = "/";
                    }, 5000);
                }
            })
            .catch((err) => {
                console.log("err", err);
                alert("Error sending message. Please try again.");
            });
    };

    return (
        <section className="flex justify-center items-start mx-4 sm:mx-auto h-fit-content pt-4 pb-96 sm:pt-12">
            <div className="container flex flex-col gap-2">
                {messages.map((message, index) => (
                    <ChatMessage
                        key={index}
                        message={message.message}
                        sender={message.sender}
                    />
                ))}
            </div>
            <div className="fixed bottom-10 sm:bottom-4 inset-auto w-full h-32">
                <div className="flex flex-col justify-center items-center gap-4">
                    <div className="flex justify-center items-center w-full">
                        <label htmlFor="chat" className="sr-only">
                            Chat
                        </label>

                        <input
                            name="chat"
                            id="chat"
                            className="block w-4/6 h-12 p-4 rounded-md border-0 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:outline-0 sm:py-1.5 sm:text-sm sm:leading-6"
                            placeholder="Type your response..."
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    sendMessage(textInput);
                                }
                            }}
                        />
                        <button
                            type="submit"
                            onClick={() => sendMessage(textInput)}
                            className="ml-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Send
                        </button>
                    </div>
                    <div>
                        <button
                            type="submit"
                            onClick={() => sendMessage("Sorry, I have to go!")}
                            className="mr-4 nline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            End Interview
                        </button>

                        <a
                            href="/"
                            target="_blank"
                            className="mt-2 py-2 px-4 border border-black/20 rounded-2xl"
                        >
                            Powered by{" "}
                            <span className="font-bold">Deepform</span>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default DeepformSection;
