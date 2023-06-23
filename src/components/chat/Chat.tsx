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
import axios, { AxiosRequestConfig } from "axios";

// Define a helper function called textToSpeech that takes in a string called inputText as its argument.
// Used in the below function, handleAudioFetch.
const textToSpeech = async (inputText) => {
    // Set the API key for ElevenLabs API. 
    // Do not use directly. Use environment variables.
    const API_KEY = process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY;
    // Set the ID of the voice to be used.
    const VOICE_ID = '21m00Tcm4TlvDq8ikWAM';
  
    // Set options for the API request.
    const options: AxiosRequestConfig = {
      method: 'POST',
      url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      headers: {
        accept: 'audio/mpeg', // Set the expected response type to audio/mpeg.
        'content-type': 'application/json', // Set the content type to application/json.
        'xi-api-key': `${API_KEY}`, // Set the API key in the headers.
      },
      data: {
        text: inputText, // Pass in the inputText as the text to be converted to speech.
      },
      responseType: 'arraybuffer', // Set the responseType to arraybuffer to receive binary data as response.
    };
  
    // Send the API request using Axios and wait for the response.
    const speechDetails = await axios.request(options);
  
    // Return the binary audio data received from the API response.
    console.log("speechDetails.data", speechDetails.data);
    return speechDetails.data;
  };


export default function Chat({}) {
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
            )}, I'm Orion, an extremely concise A.I. that also listens for "Interrupt" as a 
            special keyword that indicates I should ignore and forget everything that comes before
            "Interrupt". How are you? `,
            sender: "AI",
        },
    ]);

    // State that records the text input from the user
    const [textInput, setTextInput] = useState("");

    // Loading State
    const [loading, setLoading] = useState(false);
    // State that checks if the user has clicked on the website yet
    // Needed because if they haven't clicked yet, the audio won't play
    // (just a quirk about web audio)
    const [clickedButton, setClickedButton] = useState(false);

    // Audio Ref for the audio element
    const audioRef = useRef(null);
    // // Audio that contains mp3 file returned from ElevenLabs
    // const [audio, setAudio] = useState(null);

    // Define a state variable to hold the audio URL
  const [audioURL, setAudioURL] = useState(null);

  // Define a function to fetch the audio data and set the URL state variable
  const handleAudioFetch = async (textToTransform: string) => {
    // Call the textToSpeech function to generate the audio data for the text "Hello welcome"
    const data = await textToSpeech(textToTransform)
    console.log("data", data)
    // Create a new Blob object from the audio data with MIME type 'audio/mpeg'
    const blob = new Blob([data], { type: 'audio/mpeg' });
    console.log("blob", blob)
    // Create a URL for the blob object
    const url = URL.createObjectURL(blob);
    console.log("url", url)
    
    // Set the audio URL state variable to the newly created URL
    setAudioURL(url);
  };


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
                await handleAudioFetch(responseJSON.response.text);

                // // Set the AI audio
                // setAudio(responseJSON.file);

                // // Hack to force the client to reread the audio file
                // refreshAudio();

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
    // const refreshAudio = () => {
    //     setAudio(`/ephemeral.mp3?${new Date().getTime()}`);
    // };

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

    useEffect(() => {
        if (!clickedButton) {
            return;
        } else {
            audioRef.current.load();
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
                {audioURL && (
                    <audio
                        className=""
                        ref={audioRef}
                        autoPlay
                        controls
                        src={audioURL}
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
