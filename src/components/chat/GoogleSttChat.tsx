import { useWhisper } from '@chengsokdara/use-whisper'
import { useChat, type CreateMessage, type Message } from 'ai/react'
import Alert from 'components/atoms/Alert'
import ChatMessage from 'components/atoms/ChatMessage'
import GoogleSTTInput from 'components/atoms/GoogleSTTInput'
import GoogleSTTPill from 'components/atoms/GoogleSTTPill'
import InterimHistory from 'components/atoms/InterimHistory'
import type { Harker } from 'hark'
import type { Encoder } from 'lamejs'
import { useEffect, useRef, useState } from 'react'
import io, { type Socket } from 'socket.io-client'
import { type VoiceCommand } from 'types/useWhisperTypes'
import useSound from 'use-sound'
import { useAuth } from 'util/auth'
import { Mp3Encoder } from 'lamejs'
import {
    blobToBase64,
    checkIsVoiceCommand,
    extractStartKeyword,
    getVoiceCommandAction,
    handleStartKeywords,
    whisperTranscript
} from "./methods";
import { START_KEYWORDS, STOP_TIMEOUT, TALKTOGPT_SOCKET_ENDPOINT } from "./constants";

interface WordRecognized {
    isFinal: boolean
    text: string
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

    const [playPing] = useSound('/sounds/ping.mp3')
    const [playSonar] = useSound('/sounds/sonar.mp3')

    const [isAutoStop, setIsAutoStop] = useState<boolean>(true)
    const [isListening, setIsListening] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isSending, setIsSending] = useState<boolean>(false)
    const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
    const [isUnttering, setIsUnttering] = useState<boolean>(false)
    const [isWhisperPrepared, setIsWhisperPrepared] = useState<boolean>(false)
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    const [interim, setInterim] = useState<string>('')
    const [noti, setNoti] = useState<{
        type: 'error' | 'success'
        message: string
    }>()
    const [autoStopTimeout, setAutoStopTimeout] = useState<number>(STOP_TIMEOUT)
    const [speakingRate, setSpeakingRate] = useState<number>(1)

    const {recording, speaking, transcript, startRecording, stopRecording} =
        useWhisper({
            apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
            autoTranscribe: false,
            whisperConfig: {
                language: 'en',
            },
        })

    const {
        messages,
        append,
        isLoading: isResponding,
        input,
        setInput,
        handleInputChange,
    } = useChat({
        api: '/api/openai/stream',
        initialMessages: [],
        onError: (sendDetectedTranscriptError) => {
            console.error({sendDetectedTranscriptError})
            setIsLoading(false)
            setIsSending(false)
            showErrorMessage(NOTI_MESSAGES.gpt.error)
        },
        onFinish: (message) => {
            if (message.role === 'assistant' && message.content) {
                startUttering(message.content)
            }
            transcript.blob = undefined
            setIsLoading(false)
            setIsSending(false)
        },
    })

    const forceStopRecording = async () => {
        startKeywordDetectedRef.current = undefined
        stopUttering()
        playSonar()
        setIsLoading(true)
        stopRecording()
    }

    const onAutoStop = async () => {
        startKeywordDetectedRef.current = undefined
        endKeywordDetectedRef.current = undefined
        stopAutoStopTimeout()
        stopUttering()
        playSonar()
        setIsLoading(true)
        await stopRecording()
    }

    const processStartKeyword = async (keyword: string, startIndex: number) => {
        if (!startKeywordDetectedRef.current) {
            stopUttering();
            playPing();
            await startRecording();
            startKeywordDetectedRef.current = true;
        }
    }

    const onSpeechRecognized = async (data: WordRecognized) => {
        try {
            if (isProcessing) return;

            interimRef.current += ` ${data.text}`;
            setInterim(data.text);

            if (data.isFinal) {
                interimsRef.current.push(data.text);
                interimRef.current = '';
                startKeywordDetectedRef.current = false;
            }

            if (!startKeywordDetectedRef.current) {
                const keyword = extractStartKeyword(interimRef.current);
                if (keyword) {
                    const startIndex = interimRef.current.toLowerCase().indexOf(keyword.toLowerCase());
                    await processStartKeyword(keyword, startIndex);
                }
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
            setIsLoading(false);
            setIsSending(false);
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
        setIsLoading(false);
        setIsSending(false);
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
        if (!isWhisperPrepared) {
            /**
             * fake start and stop useWhisper so that recorder is prepared
             * once start keyword detected, useWhisper can start record instantly
             */
            await startRecording()
            await stopRecording()
            setIsWhisperPrepared(true)
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
            socketRef.current.emit('endGoogleCloudStream')
            socketRef.current.disconnect()
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
                setIsAutoStop(action.value);
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
                setIsLoading(false);
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
            },
            video: false,
        })

        await prepareHark()

        audioContextRef.current = new window.AudioContext()
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

        setIsListening(true)

        socketRef.current.emit('startGoogleCloudStream')

        processorRef.current.port.onmessage = ({data: audio}) => {
            socketRef.current.emit('send_audio_data', {audio})
        }
    }

    const startUttering = (text: string) => {
        if (!text) {
            return
        }
        if (!speechRef.current) {
            speechRef.current = new SpeechSynthesisUtterance()
            speechRef.current.addEventListener('start', onStartUttering)
            speechRef.current.addEventListener('end', onStopUttering)
        }
        speechRef.current.text = text
        window.speechSynthesis.speak(speechRef.current)
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
        setIsListening(false)
        socketRef.current.emit('endGoogleCloudStream')
    }

    const stopUttering = () => {
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel()
            setIsUnttering(false)
        }
    }

    const submitTranscript = async (text?: string) => {
        if (!text) {
            return
        }
        // TODO: uncomment when supabase work again
        // if (!auth.user) {
        //   return
        // }
        if (!isLoading) setIsLoading(true)
        setIsSending(true)
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
            setIsLoading(false)
            setIsSending(false)
            showErrorMessage(NOTI_MESSAGES.gpt.error)
            return
        }
    }

    const toggleUnttering = () => {
        if (isUnttering) {
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
        setIsSpeaking(true)
        stopAutoStopTimeout()
    }

    const onStartUttering = () => {
        setIsUnttering(true)
    }

    const onStopSpeaking = () => {
        setIsSpeaking(false)
    }

    const onStopUttering = () => {
        setIsUnttering(false)
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

    /**
     * check before sending audio blob to Whisper for transcription
     */
    useEffect(() => {
        if (
            !isSending &&
            !recording &&
            isWhisperPrepared &&
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
    }, [recording, isSending, isWhisperPrepared, transcript])

    useEffect(() => {
        if (isAutoStop && recording && !isSpeaking) {
            startAutoStopTimeout()
        }
        if (isAutoStop && !recording) {
            stopAutoStopTimeout()
        }
    }, [autoStopTimeout, isAutoStop, recording, isSpeaking])

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
                    {messages.map((message, index) => (
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
                isAutoStop={isAutoStop}
                isUnttering={isUnttering}
                speakingRate={speakingRate}
                onChangeAutoStopTimeout={setAutoStopTimeout}
                onChangeIsAutoStop={setIsAutoStop}
                onChangeSpeakingRate={setSpeakingRate}
                onToggleUnttering={toggleUnttering}
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
                isListening={isListening}
                isLoading={isLoading}
                isSpeaking={isSpeaking}
                isRecording={recording}
                isWhisperPrepared={isWhisperPrepared}
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
