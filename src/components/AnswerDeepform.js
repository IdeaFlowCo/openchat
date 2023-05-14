import React, { useState, useEffect } from "react";
import { useDeepform } from "util/db";
import ChatMessage from "./ChatMessage";
import { toast } from "react-hot-toast";
import { useWhisper } from "@chengsokdara/use-whisper";

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
    const [loading, setLoading] = useState(false);

    // console.log("deepformData", deepformData);

    const sendMessage = async (message) => {
        setLoading(true);

        // Error Handling
        if (!message) {
            toast.error("Please enter a message or record an audio clip.");
            setLoading(false);
            return;
        }
        setTextInput("");
        setMessages((prevMessages) => [
            ...prevMessages,
            { message: message, sender: "human" },
        ]);

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
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { message: data.text, sender: "AI" },
                ]);
                if (data.isEndOfInterview) {
                    // Time out for 3 seconds, then redirect to Deepform home page
                    setTimeout(() => {
                        window.location.href = "/";
                    }, 5000);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.log("err", err);
                setLoading(false);
                alert("Error sending message. Please try again.");
            });
    };

    // Whisper
    const onTranscribe = async (blob) => {
        const formData = new FormData();
        formData.append("file", blob, "audio.wav");

        try {
            const response = await fetch("/api/whisper", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            const { text } = data;
            sendMessage(text);
            setLoading(false);
            return {
                blob,
                text,
            };
        } catch (error) {
            console.error(error);
            setLoading(false);
            return {
                blob,
                text: "Failed to transcribe the audio.",
            };
        }
    };

    const {
        recording,
        speaking,
        transcribing,
        transcript,
        pauseRecording,
        startRecording,
        stopRecording,
    } = useWhisper({
        onTranscribe,
        removeSilence: true,
        whisperConfig: {
            language: "en",
        },
    });

    // UseEffect that scrolls down to the bottom of the chat
    // whenever a new message is sent
    useEffect(() => {
        const chat = document.getElementById("chat");
        chat.scrollTop = chat.scrollHeight;
    }, [messages]);

    return (
        <section className="chat flex flex-col justify-center items-center mx-4 sm:mx-auto">
            <div
                id="chat"
                className="flex justify-center items-start py-5 w-full h-[80vh] overflow-auto"
            >
                <div className="container flex flex-col gap-2 max-w-3xl">
                    {messages.map((message, index) => (
                        <ChatMessage
                            key={index}
                            message={message.message}
                            sender={message.sender}
                        />
                    ))}
                </div>
            </div>

            <div className="w-full h-[20vh]">
                <div className="flex flex-col justify-center items-center gap-4">
                    <div className="flex justify-center items-center w-full px-4">
                        <label htmlFor="chat" className="sr-only">
                            Chat
                        </label>
                        <main className="">
                            <div>
                                {/* <p>Recording: {recording ? "true" : "false"}</p> */}
                                {/* <p>Speaking: {speaking ? "true" : "false"}</p> */}
                                {/* <p>
                                    Transcribing:{" "}
                                    {transcribing ? "true" : "false"}
                                </p> */}
                                {/* <p>Transcribed Text: {transcript?.text}</p> */}
                                {/* <button onClick={() => startRecording()}>
                                    Start
                                </button>
                                <button onClick={() => pauseRecording()}>
                                    Pause
                                </button>
                                <button onClick={() => stopRecording()}>
                                    Stop
                                </button> */}
                            </div>
                            {!recording ? (
                                <button
                                    onClick={() => startRecording()}
                                    disabled={recording}
                                    className="mr-4 bg-indigo-600 border text-white hover:opacity-70 rounded-full p-4 "
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-6 h-6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                                        />
                                    </svg>
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        setLoading(true);
                                        stopRecording();
                                    }}
                                    disabled={!recording}
                                    className="mr-4 border border-black/10 rounded-full p-4"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-6 h-6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            )}
                        </main>

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
                            disabled={loading}
                            className={
                                "ml-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" +
                                (loading
                                    ? " opacity-50 cursor-not-allowed"
                                    : "")
                            }
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
