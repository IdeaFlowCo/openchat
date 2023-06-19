import React, { Fragment, useState, useEffect } from "react";
import { useFeedback } from "util/db";
import ChatMessage from "../atoms/ChatMessage";
import { toast } from "react-hot-toast";
import { useWhisper } from "@chengsokdara/use-whisper";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { PaperAirplaneIcon } from "@heroicons/react/20/solid";
import EndInterviewModal from "../old/EndInterviewModal";
import { FollowupPayloadType, MessageType } from "types/portalTypes";
import { useAuth } from "util/auth";
import PageLoader from "components/PageLoader";
import ChatInput from "components/atoms/ChatInput";
export default function FollowupQuestions({ feedbackId }) {
    const auth = useAuth();
    const { data: feedbackData, status } = useFeedback(feedbackId);

    const [messages, setMessages] = useState<MessageType[]>([
        {
            message: `Hi ${auth.user.name}, I'm Orion, an A.I. user researcher. Thanks for submitting that feedback!`,
            sender: "AI",
        },
        {
            message: `I have a few followup questions, if you don't mind. At any time you'd like to leave, just click the "End Interview" button or say something like "Gotta go!".`,
            sender: "AI",
        },
        {
            message: `Ready to get started?`,
            sender: "AI",
        },
    ]);

    const [textInput, setTextInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [showEndInterviewModal, setShowEndInterviewModal] = useState(false);

    // console.log("feedbackData", feedbackData);

    const sendMessage = async (message) => {
        setLoading(true);

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
        const data: FollowupPayloadType = {
            messages: [...messages, { message, sender: "human" }],
            feedbackId: feedbackId,
            feedbackTitle: feedbackData.title,
            feedbackDescription: feedbackData.description,
            userId: auth.user.id,
        };

        console.log("data", data);

        // Send data to API route /api/openai/followup
        await fetch("/api/openai/followup", {
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
                    setShowEndInterviewModal(false);
                    // Time out for 3 seconds, then redirect to Deepform home page
                    setTimeout(() => {
                        window.location.href = `/portal/${feedbackData.portal_id}`;
                    }, 5000);
                }
                setLoading(false);
            })
            .catch((err) => {
                console.log("err", err);
                setLoading(false);
                alert("Error sending message. Sorry about that! ");
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
            await sendMessage(text);
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
        if (chat) {
            chat.scrollTop = chat.scrollHeight;
        }
    }, [messages]);

    if (!feedbackData) {
        // Show Loader
        return <PageLoader />;
    }

    return (
        <>
            {/* <section className="flex flex-col justify-center items-center sm:mx-auto h-[80vh] b"> */}
            <div
                id="chat"
                className="flex h-[80vh] w-full items-start justify-center overflow-auto sm:pt-10"
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
                setShowEndInterviewModal={setShowEndInterviewModal}
            />

            <EndInterviewModal open={showEndInterviewModal} />
        </>
        // </section>
    );
}
