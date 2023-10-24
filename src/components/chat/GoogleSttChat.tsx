import { useWhisper } from '@chengsokdara/use-whisper'
import { useChat, type CreateMessage, type Message } from 'ai/react'
import Alert from 'components/atoms/Alert'
import ChatMessage from 'components/atoms/ChatMessage'
import GoogleSTTInput from 'components/atoms/GoogleSTTInput'
import GoogleSTTPill from 'components/atoms/GoogleSTTPill'
import InterimHistory from 'components/atoms/InterimHistory'
import type { Harker } from 'hark'
import type { Encoder } from 'lamejs'
import { useEffect, useReducer, useRef, useState } from 'react'
import io, { type Socket } from 'socket.io-client'
import { type VoiceCommand } from 'types/useWhisperTypes'
import useSound from 'use-sound'
import { useAuth } from 'util/auth'
import { Mp3Encoder } from 'lamejs'
import {
    blobToBase64,
    checkIsVoiceCommand,
    detectEndKeyword,
    extractStartKeyword,
    getVoiceCommandAction,
    handleStartKeywords,
    splitTextsBySeparator,
    whisperTranscript
} from "./methods";
import { START_KEYWORDS, STOP_TIMEOUT, TALKTOGPT_SOCKET_ENDPOINT } from "./constants";
import {isAndroid} from 'react-device-detect';
import {initialState, Actions, reducer} from './reducers'

const TEXT_SEPARATORS = {
    PARAGRAPH_BREAK: '\n\n',
    LINE_BREAK: '\n'
}

interface WordRecognized {
    isFinal: boolean
    text: string
}


interface ReducerState {
    isAutoStop: boolean
    isListening: boolean
    isLoading: boolean
    isSending: boolean
    isSpeaking: boolean
    isUttering: boolean
    isWhisperPrepared: boolean
    isFinalData: boolean
}


export const GoogleSttChat = () => {
    const auth = useAuth()
    const audioContextRef = useRef<any>()
    const audioInputRef = useRef<any>()
    const autoStopRef = useRef<NodeJS.Timeout>()
    const chatRef = useRef<HTMLDivElement>()
    const encoderRef = useRef<Encoder>()
    const endKeywordDetectedRef = useRef<boolean>(false)
    const harkRef = useRef<Harker>()
    const interimRef = useRef<string>('')
    const interimsRef = useRef<string[]>([])
    const processorRef = useRef<any>()
    const sendingDetectedMessageRef = useRef<boolean>(false)
    const socketRef = useRef<Socket>()
    const speechRef = useRef<SpeechSynthesisUtterance>()
    const startKeywordDetectedRef = useRef<boolean>(false)
    const streamRef = useRef<MediaStream>()
    const storedMessagesRef = useRef(null)
    const lastSpeechIndexRef = useRef(0)
    const isReadyToSpeech = useRef(true)

    const [firstMessage, setFirstMessage] = useState<string | null>(null)
    const [interim, setInterim] = useState<string>('')
    const [noti, setNoti] = useState<{
        type: 'error' | 'success'
        message: string
    }>()
    const [autoStopTimeout, setAutoStopTimeout] = useState<number>(STOP_TIMEOUT)
    const [speakingRate, setSpeakingRate] = useState<number>(1)

    const [state, dispatch] = useReducer(reducer, initialState)

    const [playPing] = useSound('/sounds/ping.mp3')
    const [playSonar] = useSound('/sounds/sonar.mp3')

    const onStartUttering = () => {
        dispatch({type: Actions.START_UTTERING})
    }

    const onStopUttering = () => {
        lastSpeechIndexRef.current += 1
        if (storedMessagesRef.current.length > lastSpeechIndexRef.current) {
            startUttering(storedMessagesRef.current[lastSpeechIndexRef.current])
        } else {
            dispatch({type: Actions.STOP_UTTERING})
        }
    }
    
    const startUttering = (text: string) => {
        if (!text) {
            return
        }
        dispatch({type: Actions.START_UTTERING})
        if (!isAndroid) {
            if (!speechRef.current) {
                speechRef.current = new SpeechSynthesisUtterance()
                speechRef.current.addEventListener('start', onStartUttering)
                speechRef.current.addEventListener('end', onStopUttering)
            }
            speechRef.current.lang = "en-US"
            speechRef.current.text = text
            globalThis.speechSynthesis.speak(speechRef.current)
        } else {
            globalThis.ReactNativeWebView.postMessage(JSON.stringify({
                type: "speaking-start",
                data: text, 
            }))
        }
    }

    

    const {recording, transcript, startRecording, stopRecording} =
        useWhisper({
            apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
            autoTranscribe: false,
            removeSilence: true,
            whisperConfig: {
                language: 'en',
            },
        })

    const {
        messages,
        append,
        input,
        setInput,
        handleInputChange,
    } = useChat({
        api: '/api/openai/stream',
        initialMessages: [],
        onError: (sendDetectedTranscriptError) => {
            console.error({sendDetectedTranscriptError})
            dispatch({type: Actions.STOP_SENDING_CHAT})
            showErrorMessage(NOTI_MESSAGES.gpt.error)
        },
        onFinish: (message) => {
            transcript.blob = undefined
            setFirstMessage(message.content)
            dispatch({type: Actions.STOP_SENDING_CHAT})
        },
        onResponse: () => {
            lastSpeechIndexRef.current = 0
            storedMessagesRef.current = []
        }
    })

    const messagesSplitByParagraph = splitTextsBySeparator(messages, TEXT_SEPARATORS.PARAGRAPH_BREAK)
    const messagesSplitByLine = splitTextsBySeparator(messagesSplitByParagraph, TEXT_SEPARATORS.LINE_BREAK)
    

    const lastIndexUser = messagesSplitByLine.findLastIndex(message => message.role === 'user')
    storedMessagesRef.current = lastIndexUser >= 0 ? messagesSplitByLine.slice(lastIndexUser+1).map(message => message.content) : []
    if (storedMessagesRef.current.length > 1 && lastSpeechIndexRef.current === 0 && isReadyToSpeech.current) {
        isReadyToSpeech.current = false
        startUttering(storedMessagesRef.current[lastSpeechIndexRef.current])
        
    }

    useEffect(() => {
        if (firstMessage && storedMessagesRef.current.length === 1) startUttering(firstMessage)
    }, [firstMessage])

    const forceStopRecording = async () => {
        startKeywordDetectedRef.current = undefined
        dispatch({type: Actions.NOT_FINAL_DATA_RECEIVED})
        stopUttering()
        playSonar()
        dispatch({type: Actions.START_LOADING})
        stopRecording()
    }

    const onAutoStop = async () => {
        startKeywordDetectedRef.current = undefined
        endKeywordDetectedRef.current = undefined
        dispatch({type: Actions.NOT_FINAL_DATA_RECEIVED})
        stopAutoStopTimeout()
        stopUttering()
        console.table("SONAR")
        playSonar()
        dispatch({type: Actions.START_LOADING})
        await stopRecording()
    }

    const processStartKeyword = async () => {
        console.table("PING")
        
            await startRecording();
            stopUttering();
            playPing();
            startKeywordDetectedRef.current = true;
        
    }

    const onSpeechRecognized = async (data: WordRecognized) => {
        try {

            interimRef.current += ` ${data.text}`;
            setInterim(data.text);

            if (data.isFinal) {
                interimsRef.current.push(data.text);
                interimRef.current = '';
                startKeywordDetectedRef.current = false;
                dispatch({type: Actions.FINAL_DATA_RECEIVED})
            } else {
                dispatch({type: Actions.NOT_FINAL_DATA_RECEIVED})
            }

            if (!startKeywordDetectedRef.current) {
                const keyword = extractStartKeyword(interimRef.current);
                console.log({keyword})
                if (keyword) {
                    // const startIndex = interimRef.current.toLowerCase().indexOf(keyword.toLowerCase());
                    await processStartKeyword();
                }
            }

            // Check for end keyword and stop recording if detected
            if (detectEndKeyword(interimRef.current) && !endKeywordDetectedRef.current) {
                endKeywordDetectedRef.current = true;
                await onAutoStop();  // Or any other method you want to call when stopping
            }

        } catch (error) {
            console.error("An error occurred in onSpeechRecognized:", error);
        }
    };


    const handleTranscriptionResults = (transcribed: {
        error?: Error;
        text: string;
    }): string | null => {
        if (transcribed.error) {
            console.warn('24MB file size limit reached!');
            showErrorMessage('24MB limit reached!');
            return null;
        }
        if (!transcribed.text) {
            showErrorMessage('Voice command not detected. Please speak again.');
            dispatch({type: Actions.STOP_SENDING_CHAT})
            return null;
        }
        return transcribed.text;
    }


    const onTranscribe = async () => {
        const transcribed = await transcribeAudio(transcript.blob);

        const transcriptionText = handleTranscriptionResults(transcribed);
        if (!transcriptionText) return;

        let text = handleStartKeywords(transcriptionText);

        const voiceCommand = checkIsVoiceCommand(text);
        if (voiceCommand) {
            runVoiceCommand(voiceCommand);
            return;
        }

        await submitTranscript(text);

        transcript.blob = undefined;
        dispatch({type: Actions.STOP_SENDING_CHAT})
    };

    const prepareHark = async () => {
        if (!harkRef.current && streamRef.current) {
            const {default: harkjs} = await import('hark')
            harkRef.current = harkjs(streamRef.current, {
                interval: 100,
                threshold: -60,
                play: false,
            })
            harkRef.current.on('speaking', onStartSpeaking)
            harkRef.current.on('stopped_speaking', onStopSpeaking)
        }
    }

    const prepareUseWhisper = async () => {
        if (!state.isWhisperPrepared) {
            /**
             * fake start and stop useWhisper so that recorder is prepared
             * once start keyword detected, useWhisper can start record instantly
             */
            await startRecording()
            await stopRecording()
            dispatch({type: Actions.PREPARE_WHISPER})
        }
    }

    const prepareSocket = async () => {
        socketRef.current = io(TALKTOGPT_SOCKET_ENDPOINT)

        socketRef.current.on('connect', () => {
        })

        socketRef.current.on('receive_audio_text', (data) => {
            onSpeechRecognized(data)
        })

        socketRef.current.on('disconnect', () => {
        })
    }

    const releaseHark = () => {
        // remove hark event listeners
        if (harkRef.current) {
            // @ts-ignore
            harkRef.current.off('speaking', onStartSpeaking)
            // @ts-ignore
            harkRef.current.off('stopped_speaking', onStopSpeaking)
            harkRef.current = undefined
        }
    }

    const releaseSocket = async () => {
        if (socketRef.current) {
            socketRef.current?.emit('endGoogleCloudStream')
            socketRef.current?.disconnect()
        }
        processorRef.current?.disconnect()
        audioInputRef.current?.disconnect()
        if (audioContextRef.current?.state !== 'closed') {
            audioContextRef.current?.close()
        }
    }

    const runVoiceCommand = (voiceCommand: VoiceCommand) => {
        const action = getVoiceCommandAction(voiceCommand);

        switch (action?.type) {
            case 'SET_IS_AUTO_STOP':
                dispatch({type: Actions.TOGGLE_AUTO_STOP, value: action.value});
                break;
            case 'SET_AUTO_STOP_TIMEOUT':
                setAutoStopTimeout(action.value);
                break;
            case 'SHOW_MESSAGE':
                if (action.messageType === 'error') {
                    showErrorMessage(action.message);
                } else if (action.messageType === 'success') {
                    showSuccessMessage(action.message);
                }
                break;
            default:
                transcript.blob = undefined;
                dispatch({type: Actions.STOP_LOADING})
                showErrorMessage('Unknown command.');
                break;
        }
    }


    const showErrorMessage = (message: string) => {
        setNoti({type: 'error', message})
        startUttering(message)
    }

    const showSuccessMessage = (message: string) => {
        setNoti({type: 'success', message})
    }

    const startAutoStopTimeout = () => {
        autoStopRef.current = setTimeout(onAutoStop, autoStopTimeout * 1000)
    }

    const startListening = async () => {
        await prepareSocket()
        
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop())
        }
        streamRef.current = await navigator.mediaDevices.getUserMedia({
            audio: {
                deviceId: 'default',
                sampleRate: 16000,
                sampleSize: 16,
                channelCount: 1,
                noiseSuppression: true,
                echoCancellation: true,
            },
            video: false,
        })

        await prepareHark()

        audioContextRef.current = new globalThis.AudioContext()
        await audioContextRef.current.audioWorklet.addModule(
            '/worklets/recorderWorkletProcessor.js'
        )
        audioInputRef.current = audioContextRef.current.createMediaStreamSource(
            streamRef.current
        )
        processorRef.current = new AudioWorkletNode(
            audioContextRef.current,
            'recorder.worklet'
        )
        
        processorRef.current.connect(audioContextRef.current.destination)
        audioContextRef.current.resume()
        audioInputRef.current.connect(processorRef.current)

        dispatch({type: Actions.START_LISTENING})
        socketRef.current?.emit('startGoogleCloudStream')
        
        processorRef.current.port.onmessage = ({data: audio}) => {
            socketRef.current?.emit('send_audio_data', {audio})
        }
    }

    

    const stopAutoStopTimeout = () => {
        if (autoStopRef.current) {
            clearTimeout(autoStopRef.current)
            autoStopRef.current = undefined
        }
    }

    const stopListening = async () => {
        // release audio stream and remove event listeners
        releaseHark()
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop())
            streamRef.current = undefined
        }
        processorRef.current?.disconnect()
        audioInputRef.current?.disconnect()
        if (audioContextRef.current?.state !== 'closed') {
            audioContextRef.current?.close()
        }
        interimsRef.current = []
        setInterim('')
        dispatch({type: Actions.STOP_LISTENING})
        socketRef.current?.emit('endGoogleCloudStream')
    }

    const stopUttering = () => {
        if (!isAndroid && globalThis.speechSynthesis.speaking) {
            globalThis.speechSynthesis.cancel()
        }
        if (isAndroid) {
            globalThis.ReactNativeWebView.postMessage(JSON.stringify({
                type: "speaking-stop"
            }))
        }
        
        dispatch({type: Actions.STOP_UTTERING})
    }

    const submitTranscript = async (text?: string) => {
        isReadyToSpeech.current = true
        if (!text) {
            return
        }
        // TODO: uncomment when supabase work again
        // if (!auth.user) {
        //   return
        // }
        dispatch({type: Actions.START_SENDING_CHAT})
        setNoti(undefined)
        setInput('')

        try {
            const data: CreateMessage = {content: text, role: 'user'}

            append(data, {
                options: {
                    body: auth.user?.id ? {userId: auth.user.id} : undefined,
                },
            })
            return
        } catch (sendDetectedTranscriptError) {
            console.error({sendDetectedTranscriptError})
            dispatch({type: Actions.STOP_SENDING_CHAT})
            showErrorMessage(NOTI_MESSAGES.gpt.error)
            return
        }
    }

    const toggleUttering = () => {
        if (state.isUttering) {
            stopUttering()
        } else {
            const lastMessage = messages
                .slice()
                .reverse()
                .find((message) => message.role === 'assistant')?.content
            if (lastMessage) {
                startUttering(lastMessage)
            }
        }
    }

    const transcribeAudio = async (blob: Blob): Promise<{
        error?: Error;
        text: string
    }> => {
        if (!encoderRef.current) {
            encoderRef.current = new Mp3Encoder(1, 44100, 96);
        }

        const base64 = await blobToBase64(blob);
        if (!base64) {
            return {error: new Error('Failed to read blob data.'), text: ''};
        }

        // Transcribe the audio
        const text = await whisperTranscript(base64);
        return {text};
    };

    const onStartSpeaking = () => {
        dispatch({type: Actions.START_SPEAKING})
        stopAutoStopTimeout()
    }

    const onStopSpeaking = () => {
        dispatch({type: Actions.STOP_SPEAKING})
    }

    const cleanUpResources = () => {
        releaseSocket()
        releaseHark()
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop())
            streamRef.current = undefined
        }
        // clear auto stop timeout instance
        stopAutoStopTimeout()
        // flush out lamejs
        if (encoderRef.current) {
            encoderRef.current.flush()
            encoderRef.current = undefined
        }
        if (speechRef.current) {
            stopUttering()
            speechRef.current.removeEventListener('start', onStartUttering)
            speechRef.current.removeEventListener('end', onStopUttering)
        }
    }

    useEffect(() => {
        function handleStopUttering(message: {data: {type: string, data: boolean}}) {
            const {data, type} = message.data
            if (type === 'speaking' && data === false) {
                onStopUttering()
            }
        }

        function handleBlur(){
            stopListening()
        }

        window.addEventListener("message", handleStopUttering);
        window.addEventListener("blur", handleBlur)
        return () => {
            window.removeEventListener("message", handleStopUttering)
            window.removeEventListener("blur", handleBlur)
        };
    }, [])

    /**
     * check before sending audio blob to Whisper for transcription
     */
    useEffect(() => {
        if (
            !state.isSending &&
            !recording &&
            state.isWhisperPrepared &&
            /**
             * Recorded audio should not be empty.
             * Empty wav file always start with 44 bytes not 0.
             */
            transcript.blob?.size > 44
        ) {
            sendingDetectedMessageRef.current = true
            onTranscribe().then(() => {
                sendingDetectedMessageRef.current = false
            })
        }
    }, [recording, state.isSending, state.isWhisperPrepared, transcript])

    useEffect(() => {
        if (state.isAutoStop && recording && state.isFinalData) {
            startAutoStopTimeout()
        }
        if ((state.isAutoStop && !recording) || !state.isFinalData) {
            stopAutoStopTimeout()
        }
    }, [state.isAutoStop, recording, state.isSpeaking, state.isFinalData])

    useEffect(() => {
        if (speechRef.current) {
            // change utterance speaking rate
            speechRef.current.rate = speakingRate
        }
    }, [speakingRate])

    useEffect(() => {
        if (chatRef.current) {
            // auto scroll when there is new message
            chatRef.current.scrollTop = chatRef.current.scrollHeight
        }
    }, [messages])

    useEffect(() => {
        prepareUseWhisper()
        // release resource on component unmount
        return cleanUpResources;
    }, [])

    return (
        <div className="flex h-full w-screen flex-col">
            <div
                ref={chatRef}
                id="chat"
                className="flex w-full flex-1 items-start justify-center overflow-auto p-4 sm:pt-10"
            >
                <div className="container flex max-w-3xl flex-col gap-3">
                    {messagesSplitByLine.map((message, index) => (
                        <ChatMessage
                            key={index}
                            message={message.content}
                            sender={message.role}
                        />
                    ))}
                </div>
            </div>
            <GoogleSTTPill
                autoStopTimeout={autoStopTimeout}
                isAutoStop={state.isAutoStop}
                isUnttering={state.isUttering}
                speakingRate={speakingRate}
                onChangeAutoStopTimeout={setAutoStopTimeout}
                onChangeIsAutoStop={(value) => {dispatch({type: Actions.TOGGLE_AUTO_STOP, value: value})}}
                onChangeSpeakingRate={setSpeakingRate}
                onToggleUnttering={toggleUttering}
            />
            {noti ? (
                <Alert
                    message={noti.message}
                    type={noti.type}
                    onClose={() => setNoti(undefined)}
                />
            ) : null}
            {interim ? (
                <InterimHistory interims={interimsRef.current} interim={interim}/>
            ) : null}
            <GoogleSTTInput
                isListening={state.isListening}
                isLoading={state.isLoading}
                isSpeaking={state.isSpeaking}
                isRecording={recording}
                isWhisperPrepared={state.isWhisperPrepared}
                query={input}
                onChangeQuery={handleInputChange}
                onForceStopRecording={forceStopRecording}
                onStartListening={startListening}
                onStopListening={stopListening}
                onStopUttering={stopUttering}
                onSubmitQuery={submitTranscript}
            />
        </div>
    )
}

const NOTI_MESSAGES = {
    gpt: {
        loading: 'hang on, still working',
        error: 'Call to GPT Failed',
    },
}

// const getDefaultMessage = (name: string): MessageType => ({
//   message: `Hi ${name}, I'm Orion, an extremely concise AI. To speak to me, click the mic icon, then say "${START_KEYWORDS[0]}" to start the message, and "${END_KEYWORD}" to end your message. Make sure to speak clearly and say the keywords clearly and with pause. How are you? `,
//   sender: 'AI',
// })

const getDefaultMessage = (name: string): Message => ({
    content: `Hi ${name}, I'm Orion, an extremely concise AI. To speak to me, click the mic icon, then say "${START_KEYWORDS[0]}" to start the message. Make sure to speak clearly and say the keywords clearly and with pause. How are you? `,
    role: 'assistant',
    id: 'initial-message',
})
