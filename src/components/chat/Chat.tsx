import React, { Fragment, useState, useEffect } from "react";
import ChatMessage from "../atoms/ChatMessage";
import { toast } from "react-hot-toast";
import { useWhisper } from "@chengsokdara/use-whisper";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/20/solid";
import { BasicCompletionType, MessageType } from "types/portalTypes";
import { useAuth } from "util/auth";
import PageLoader from "components/PageLoader";
import ChatInput from "components/atoms/ChatInput";
import { usePrevious } from "../../util/util";
import { getFirstName } from "util/string";

export default function Chat({}) {
    const auth = useAuth();
    const [messages, setMessages] = useState<MessageType[]>([
        {
            message: `Hi ${getFirstName(
                auth.user.name
            )}, I'm Orion, an A.I. user researcher. Nice to meet you!`,
            sender: "AI",
        },
    ]);

    const [textInput, setTextInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [audio, setAudio] = useState(null);

    const sendMessage = async (message) => {
        setLoading(true);
        setAudio(null)

        // Error Handling
        if (!message) {
            toast.error("Please enter a message or record an audio clip.");
            setLoading(false);
            return;
        }

        if (!auth.user) {
            toast.error("Please log in to continue.");
            setLoading(false);
            return;
        }

        setTextInput("");
        setMessages((prevMessages) => [
            ...prevMessages,
            { message: message, sender: "human" },
        ]);

        // Create data object to send to API route /api/openai/followup
        const data: BasicCompletionType = {
            messages: [...messages, { message, sender: "human" }],
            userId: auth.user.id,
        };

        console.log("data", data);

        // Send data to API route /api/openai/basic
        await fetch("/api/openai/basic", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: data ? JSON.stringify(data) : undefined,
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("data", data);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { message: data.response.text, sender: "AI" },
                ]);
                console.log("data", data);
                
                setAudio(data.file);
                refreshAudio();
                // setAudioURL(url);
                setLoading(false);
            })
            .catch((err) => {
                console.log("err", err);
                setLoading(false);
                //TODO: Fix
                toast.error("Error sending message. Sorry about that!");
            });
    };

    // Whisper
    // const onTranscribe = async (blob) => {
    //     const formData = new FormData();
    //     formData.append("file", blob, "audio.wav");

    //     try {
    //         const response = await fetch("/api/whisper", {
    //             method: "POST",
    //             body: formData,
    //         });

    //         const data = await response.json();
    //         const { text } = data;
    //         await sendMessage(text);
    //         return {
    //             blob,
    //             text,
    //         };
    //     } catch (error) {
    //         console.error(error);
    //         setLoading(false);
    //         return {
    //             blob,
    //             text: "Failed to transcribe the audio.",
    //         };
    //     }
    // };

    const {
        recording,
        speaking,
        transcribing,
        transcript,
        pauseRecording,
        startRecording,
        stopRecording,
    } = useWhisper({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // YOUR_OPEN_AI_TOKEN
        // onTranscribe,
        removeSilence: true,
        timeSlice: 1_000, // 1 second
        // streaming: true,
        nonStop: true,
        stopTimeout: 3000,
        whisperConfig: {
            language: "en",
        },
    });

    // Trigger this function when you know the file has been updated
    const refreshAudio = () => {
        setAudio(`/ephemeral.mp3?${new Date().getTime()}`);
    };

    // UseEffect that listens and console.logs the speaking state
    useEffect(() => {
        console.log("transcript", transcript);

        if (transcript?.text) {
            sendMessage(transcript.text);
        }
    }, [transcript]);

    // UseEffect that scrolls down to the bottom of the chat
    // whenever a new message is sent
    useEffect(() => {
        const chat = document.getElementById("chat");
        if (chat) {
            chat.scrollTop = chat.scrollHeight;
        }
    }, [messages]);

    return (
        <>
            {/* <section className="flex flex-col justify-center items-center sm:mx-auto h-[80vh] b"> */}
            <div
                id="chat"
                className="p-4 flex h-[80vh] w-full items-start justify-center overflow-auto sm:pt-10"
            >
                <div className="container flex max-w-3xl flex-col gap-3">
                    {messages.map((message, index) => (
                        <ChatMessage
                            key={index}
                            message={message.message}
                            sender={message.sender}
                        />
                    ))}
                </div>
                {audio && <audio className="hidden" autoPlay controls src={`audio/${audio}`} />}
            </div>

            <ChatInput
                recording={recording}
                startRecording={startRecording}
                pauseRecording={pauseRecording}
                stopRecording={stopRecording}
                sendMessage={sendMessage}
                textInput={textInput}
                setTextInput={setTextInput}
                loading={loading}
                setLoading={setLoading}
            />
        </>
        // </section>
    );
}
