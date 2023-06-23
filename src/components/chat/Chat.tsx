import React, { Fragment, useState, useEffect, useRef } from "react";
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
    // Auth
    const auth = useAuth();

    // State that records messages and will be sent to /api/openai/basic
    const [messages, setMessages] = useState<MessageType[]>([
        {
            message: `Hi ${getFirstName(
                auth.user.name
            )}, I'm Orion, an A.I. that after this message, will only answer with one slightly long sentence. Nice to meet you!`,
            sender: "AI",
        },
    ]);

    // State that records the text input from the user
    const [textInput, setTextInput] = useState("");

    // Loading State
    const [loading, setLoading] = useState(false);

    // Audio that contains mp3 file returned from ElevenLabs
    const [audio, setAudio] = useState(null);

    // State that checks if the user has clicked on the website yet
    // Needed because if they haven't clicked yet, the audio won't play
    // (just a quirk about web audio)
    const [clickedButton, setClickedButton] = useState(false);

    // Audio Ref for the audio element
    const audioRef = useRef(null);

    // Function that sends a text message to the API route /api/openai/basic,
    // hopefully getting the A.I. text response + audio file back
    // and saving it to the appropriate states
    const sendMessage = async (message) => {
        setLoading(true);
        setTextInput("");
        // Reset audio for new messages
        setAudio(null);

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

        // To be able to show the human their new message immediately.
        setMessages((prevMessages) => [
            ...prevMessages,
            { message: message, sender: "human" },
        ]);

        // Create data object to send to API route /api/openai/basic
        const data: BasicCompletionType = {
            messages: [...messages, { message, sender: "human" }],
            userId: auth.user.id,
        };

        console.log("data", data);

        try {
            // Send data to API route /api/openai/basic
            let response = await fetch("/api/openai/basic", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: data ? JSON.stringify(data) : undefined,
            });

            let responseJSON = await response.json();

            if (responseJSON) {
                // Error checking
                if (responseJSON.error) {
                    toast.error(responseJSON.error);
                    setLoading(false);
                    return;
                }
                console.log("responseJSON", responseJSON);

                // Show the AI message to the human immediately
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { message: responseJSON.response.text, sender: "AI" },
                ]);
                console.log("responseJSON", responseJSON);

                // Set the AI audio
                setAudio(responseJSON.file);

                // Hack to force the client to reread the audio file
                refreshAudio();

                // Play the audio (because it could be paused)
                if (audioRef.current) {
                    audioRef.current.play();
                }

                // Open up the mic again
                await startRecording();

                // setAudioURL(url); old
                setLoading(false);
            }
        } catch (error) {
            console.log("err", error);
            setLoading(false);
            //TODO: Fix
            toast.error("Error sending message. Sorry about that!");
        }
    };

    // await fetch("/api/openai/basic", {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json",
    //     },
    //     body: data ? JSON.stringify(data) : undefined,
    // })
    //     .then((res) => res.json())
    //     .then((data) => {
    //         if (data.error) {
    //             toast.error(data.error);
    //             setLoading(false);
    //             return;
    //         }
    //         console.log("data", data);
    //         setMessages((prevMessages) => [
    //             ...prevMessages,
    //             { message: data.response.text, sender: "AI" },
    //         ]);
    //         console.log("data", data);

    //         setAudio(data.file);
    //         refreshAudio();
    //         if (audioRef.current) {
    //             audioRef.current.play();
    //         }

    //         startRecording();

    //         // setAudioURL(url);
    //         setLoading(false);
    //     })
    //     .catch((err) => {
    //         console.log("err", err);
    //         setLoading(false);
    //         //TODO: Fix
    //         toast.error("Error sending message. Sorry about that!");
    //     });
    // };

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
        // removeSilence: true,
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

    // UseEffect that listens to transcript state changes
    // and sends the text to the same sendMessage function
    useEffect(() => {
        if (!clickedButton) {
            return;
        }
        if (transcript?.text) {
            sendMessage(transcript.text);
        } else {
            // No transcript found, start recording.
            console.log("No transcript");
            startRecording();
        }
    }, [transcript]);

    // UseEffect that listens to the speaking state
    useEffect(() => {
        if (!clickedButton) {
            return;
        }

        (async () => {
            console.log("speaking", speaking);

            if (speaking && audioRef.current) {
                // When the user starts talking, stop the A.I. from talking
                audioRef.current.pause();
            }

            // If they aren't speaking, start recording just in case they do.
            if (speaking === false) {
                console.log("restarting recording");

                try {
                    await startRecording();
                } catch (error) {
                    console.log("Caught error!!!1");
                }
            }
        })();
    }, [speaking]);

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
                className="flex h-[80vh] w-full items-start justify-center overflow-auto p-4 sm:pt-10"
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
                setClickedButton={setClickedButton}
            />
            <div className="-mt-8 flex items-center justify-center pb-10">
                {audio && (
                    <audio
                        className=""
                        ref={audioRef}
                        autoPlay
                        controls
                        src={`audio/${audio}`}
                    />
                )}
                {/* <button onClick={() => {
                    if (audioRef.current) {
                        audioRef.current.pause();
                    }
                }}
                    className="ml-4 rounded-full border bg-white p-3 text-white hover:opacity-70 "
                /> */}
            </div>
        </>
        // </section>
    );
}
