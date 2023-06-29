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
import { getFirstName } from "util/string";
import axios, { AxiosRequestConfig } from "axios";
import { usePrevious } from "react-use";

export default function StreamingChat({}) {
    // Auth
    const auth = useAuth();

    // State that records messages and will be sent to /api/openai/basic
    const [messages, setMessages] = useState<MessageType[]>([
        // {
        //     message: `You are an extremely concise A.I. chatbot. Also, if
        //     I ever say the special keyword 'Interrupt' anywhere, you should
        //     treat that as the start of my message and ignore everything that came before it.
        //     Example:
        //     Human: I like the color red. Interrupt. What's my favorite color?
        //     AI: I don't know your favorite color.
        //     `,
        //     sender: "human",
        // },
        {
            message: `Hi ${getFirstName(
                auth.user.name
            )}, I'm Orion, an extremely concise AI. To speak to me, click the mic icon, then say "Start" to start the message, and "End" to end your message. Make sure to speak clearly and say the keywords clearly and with pause. How are you? `,
            sender: "AI",
        },
    ]);

    const [lastSubmittedQueryEndIdx, setLastSubmittedQueryEndIdx] = useState(0); // TODO: could be let vs. state var

    const [recentTranscript, setRecentTranscript] = useState("");

    // State that records the text input from the user
    const [textInput, setTextInput] = useState("");

    // Loading State
    const [loading, setLoading] = useState(false);
    // State that checks if the user has clicked on the website yet
    // Needed because if they haven't clicked yet, the audio won't play
    // (just a quirk about web audio)
    // TODO:
    const [clickedButton, setClickedButton] = useState(false);

    // Define a state variable to hold the audio URL
    const [audioURL, setAudioURL] = useState(null);

    // Function that sends a text message to the API route /api/openai/basic,
    // hopefully getting the A.I. text response + audio file back
    // and saving it to the appropriate states
    const sendMessage = async (message) => {
        setLoading(true);
        setTextInput("");
        // Reset audio for new messages
        setAudioURL(null);

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

                // Use handleAudioFetch to get and set the audioURL
                var speech = new SpeechSynthesisUtterance();
                speech.text = responseJSON.response.text;
                window.speechSynthesis.speak(speech);
                speechSynthesis.getVoices().forEach(function (voice) {
                    // console.log(voice.name, voice.default ? voice.default : "");
                });

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
        removeSilence: false,
        timeSlice: 1_000, // 1 second
        streaming: true,
        nonStop: true,
        // stopTimeout: 50000,
        whisperConfig: {
            language: "en",
        },
    });

    const previousTranscript = usePrevious(transcript);

    // Trigger this function when you know the file has been updated
    // const refreshAudio = () => {
    //     setAudio(`/ephemeral.mp3?${new Date().getTime()}`);
    // };

    // UseEffect that listens to transcript state changes
    // and sends the text to the same sendMessage function when it detects
    // the special keyword "Interrupt"
    useEffect(() => {
        (async () => {
            // Ideal: we only send the message after interrupt detected, and only once.
            if (!clickedButton) {
                return;
            }
            if (!transcript || !transcript.text) {
                return;
            }
            if (speaking) {
                //NOT CURRENT
                // When the user starts talking, stop the A.I. from talking 
                // window.speechSynthesis.cancel();
            }

            let sameTranscript = transcript.text === previousTranscript?.text;

            if (loading) {
                return;
            }
            console.log("transcript", transcript);

            const START_KEYWORDS = ["Alexa"];
            // let startKeywords = ["Hey Orion","Hey, Orion", "hey Orion", "hey, Orion", ];
            const END_KEYWORD = "Done";
            // let interruptKeyword = "interrupt";

            if (!sameTranscript) {

                // let lastStartIdx = Math.max( ...startKeywords.map( (keyword)=> transcript.text.lastIndexOf(keyword) ));

                //try each startKeyword from startKeywords
                //populate lastStartIdx and lastStartKeywordOptionIdx
                let lastStartIdx=-1
                let lastStartKeyword=null
                for(let i=0;i< START_KEYWORDS.length;i++) {
                    
                    let currLastStartIdx=transcript.text.lastIndexOf(START_KEYWORDS[i])

                    if(currLastStartIdx>lastStartIdx) {
                        lastStartIdx=currLastStartIdx
                        lastStartKeyword=START_KEYWORDS[i]
                    }
                }

                if(lastStartKeyword) {
                    setRecentTranscript(transcript.text.substring(lastStartIdx))
                }
                


                let lastEndIdx = transcript.text.toLowerCase().lastIndexOf(END_KEYWORD.toLowerCase()); //toLowerCase for case insensitive 

                // if ai is speaking and you say start (OR interrupt keyword #TODO), should cancel
                if (
                    lastStartIdx>=0 && //if start keyword has been said at least once
                    lastEndIdx >=0 &&
                    lastStartIdx > lastEndIdx) {

                    // if(speaking) mean if USER is speaking
                    window.speechSynthesis.cancel();
                    alert("bruhh")
                }

                if (
                    lastStartIdx>=0 && 
                    lastEndIdx > lastStartIdx &&
                    lastEndIdx > lastSubmittedQueryEndIdx
                ) {
                    // alert("ah!");
                    // debugger
                    //submit new query
                    let newTranscript = transcript.text.substring(lastStartIdx+lastStartKeyword.length, lastEndIdx);
                    if(newTranscript.startsWith(".") || newTranscript.startsWith(",")){
                        newTranscript = newTranscript.substring(1);
                    }
                    console.log("Heard Start, sending this: ", newTranscript);
                    // await stopRecording();
                    await sendMessage(newTranscript);
                    setLastSubmittedQueryEndIdx(lastEndIdx);
                }
            }
        })();
    }, [transcript, loading, clickedButton]);

    // TODO: This doesn't work to fix the mobile autoplay problems :(
    useEffect(() => {
        if (!clickedButton) {
            return;
        }
    }, [clickedButton]);

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
                {recentTranscript}
            </div>
        </>
    );
}
