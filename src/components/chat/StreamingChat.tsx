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

const START_KEYWORDS = ["Test"];
const END_KEYWORD = "Stop";

export default function StreamingChat({}) {
    //NEVER define non constant variables here this in modern react functional components use useRef
    // let testVar=0;

    // let lastSubmittedMessageCount=0
    // let currReceivedMessageCount=0
    
    const testVar =useRef(0);

    const lastSubmittedMessageCount=useRef(0);
    const currReceivedMessageCount=useRef(0);

    
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
            { message: " "+lastSubmittedMessageCount.current + ": " + message, sender: "human" },
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
                currReceivedMessageCount.current++
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { message: " " + currReceivedMessageCount.current + ": " +responseJSON.response.text, sender: "AI" },
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

                setDetected(false)
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

    // const {
    //     recording,
    //     speaking,
    //     transcribing,
    //     transcript,
    //     pauseRecording,
    //     startRecording,
    //     stopRecording,
    // } = useWhisper({
    //     apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // YOUR_OPEN_AI_TOKEN
    //     // onTranscribe,
    //     removeSilence: true, //different library from hark. Uses ffmeg
    //     // timeSlice: 15000 , // optional if i don't have streaming. 1 second - for streaming  old value 1_000
    //     streaming: false, //currently makes a request to server every 1 second
    //     nonStop: false, // Means: how long before it will auto-respond to you. should be called autoStop. if you want speech detection or not to stop audio. true means using hark; uses hark because web speech api not compatible w all browser 
    //     // stopTimeout: 5000, //default 5 second. Only used if nonStop is true. //0 is same removing parameter? 
    //     whisperConfig: {
    //         language: "en",
    //     },
    // });



    // const previousTranscript = usePrevious(transcript);

    // Trigger this function when you know the file has been updated
    // const refreshAudio = () => {
    //     setAudio(`/ephemeral.mp3?${new Date().getTime()}`);
    // };

    // UseEffect that listens to transcript state changes
    // and sends the text to the same sendMessage function when it detects
    // the special keyword "Interrupt"



    const lastEndIdx= useRef(-1)
    const lastStartIdx= useRef(-1)
    
    //constructor
    // useEffect( () => {
    //     setTimeout(() => {
    //         transcript.text="oogie"
    //         console.log("oggie")
    //     }, 15000);

    // },[])

    const somevariable=useRef(0)
    const somestate=useState("dasf")

    useEffect( ()=> {

        
    },
    [somevariable.current, somestate]
    )

    const {
        recording,
        speaking,
        transcribing,
        transcript, //{blob: binary, text: ""}
        pauseRecording,
        startRecording,
        stopRecording,
    } = useWhisper({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY, // YOUR_OPEN_AI_TOKEN
        // onTranscribe,
        removeSilence: true, //different library from hark. Uses ffmeg
        // timeSlice: 1_000 , // optional if i don't have streaming. 1 second - for streaming  old value 1_000
        streaming: true, //currently makes a request to server every 1 second
        nonStop: true, // Means: how long before it will auto-respond to you. should be called autoStop. if you want speech detection or not to stop audio. true means using hark; uses hark because web speech api not compatible w all browser 
        stopTimeout: 30_000, //default 5 second. Only used if nonStop is true. //0 is same removing parameter? 
        whisperConfig: {
            language: "en",
        },
    });
    console.log({ transcript: transcript.text })

    const detectedText = useRef<string>()

    const [detected, setDetected] = useState<boolean>(false)
    const [listening, setListening] = useState<boolean>(false)

    // Ra's implementation
    useEffect(() => {
        (async () => {
            if (detected || loading) {
                return;
            }
            if (!clickedButton || !transcript.text) {
                return;
            }
            /**
             * loop through START_KEYWORDS to find matching text in transcript.text
             */
            for (const keyword of START_KEYWORDS) {
                // check there is matching START_KEYWORD in transcript.text 
                const startIndex = transcript.text.toLocaleLowerCase().lastIndexOf(keyword.toLocaleLowerCase())
                if (startIndex !== -1) {
                    console.log("START_KEYWORD DETECTED!")
                    // start listening mode since keyword was detected
                    setListening(true)
                    // cancel any speaking speech synthesis
                    if (window.speechSynthesis.speaking) {
                        window.speechSynthesis.cancel();
                    }
                    // cut out any prior text before keyword
                    let streamingText = transcript.text.substring(startIndex)
                    // display streaming text on the screen
                    setRecentTranscript(streamingText)
                    console.log({ streamingText })
                    // check if there is matching END_KEYWORD in transcript.text
                    const endIndex = transcript.text.toLocaleLowerCase().indexOf(END_KEYWORD.toLocaleLowerCase())
                    if (endIndex !== -1) {
                        console.log("END_KEYWORD DETECTED!")
                        // set detected state to true, to avoid sending multiple messages
                        setDetected(true)
                        // stop recording to reset transcript.text
                        await stopRecording()
                        // cut out START_KEYWORD and END_KEYWORD to create message to be sent to ChatGPT
                        let message = transcript.text.substring(startIndex + keyword.length, endIndex)
                        // if there are "." or "," or "?" also cut it out
                        if (message.startsWith('.') || message.startsWith(',') || message.startsWith('?')) {
                            message = message.substring(1)
                        }
                        // only send if message is different from previous detected message
                        if (detectedText.current !== message) {
                            await sendMessage(message)
                        }
                        // save message as reference for checking later
                        detectedText.current = message
                    }
                }
            }
        })();
    }, [detected, transcript.text, loading, clickedButton]);



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
                listening={listening}
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
