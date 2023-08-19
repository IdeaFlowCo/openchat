import { useWhisper } from '@chengsokdara/use-whisper'
import { useChat, type CreateMessage, type Message } from 'ai/react'
import { type RawAxiosRequestHeaders } from 'axios'
import Alert from 'components/atoms/Alert'
import ChatMessage from 'components/atoms/ChatMessage'
import GoogleSTTInput from 'components/atoms/GoogleSTTInput'
import GoogleSTTPill from 'components/atoms/GoogleSTTPill'
import type { Harker } from 'hark'
import type { Encoder } from 'lamejs'
import { useEffect, useRef, useState } from 'react'
import io, { type Socket } from 'socket.io-client'
import { type VoiceCommand } from 'types/useWhisperTypes'
import useSound from 'use-sound'
import { useAuth } from 'util/auth'
import { getFirstName } from 'util/string'
import wordsToNumbers from 'words-to-numbers'

interface WordRecognized {
  isFinal: boolean
  text: string
}

const START_KEYWORDS = ['Alexa']
const END_KEYWORD = 'Terminator'
const STOP_TIMEOUT = 5 // 5 seconds
const VOICE_COMMANDS = [
  {
    command: 'off-auto-stop',
    matcher: 'turn off automatic response',
  },
  {
    command: 'on-auto-stop',
    matcher: 'turn on automatic response',
  },
  {
    command: 'change-auto-stop',
    matcher: 'change automatic response',
  },
] as const
const WHISPER_API_ENDPOINT = 'https://api.openai.com/v1/audio/'

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

  const [noti, setNoti] = useState<{
    type: 'error' | 'success'
    message: string
  }>()
  const [autoStopTimeout, setAutoStopTimeout] = useState<number>(STOP_TIMEOUT)
  const [speakingRate, setSpeakingRate] = useState<number>(1)

  const { recording, speaking, transcript, startRecording, stopRecording } =
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
    initialMessages: [getDefaultMessage(getFirstName(auth.user?.name) || 'Ra')],
    onError: (sendDetectedTranscriptError) => {
      console.error({ sendDetectedTranscriptError })
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

  const checkIsVoiceCommand = (text: string): VoiceCommand | undefined => {
    let result = undefined
    VOICE_COMMANDS.forEach((voiceCommand) => {
      console.log('checkIsVoiceCommand', {
        text: text.toLocaleLowerCase(),
        matcher: voiceCommand.matcher.toLocaleLowerCase(),
      })
      if (
        text
          .toLocaleLowerCase()
          .includes(voiceCommand.matcher.toLocaleLowerCase())
      ) {
        if (voiceCommand.command === 'change-auto-stop') {
          let args = wordsToNumbers(text)
          if (typeof args === 'string') {
            args = args.match(/\d+/)[0]
            args = parseInt(args, 10)
          }
          console.log({ args })
          result = { ...voiceCommand, args }
        } else {
          result = voiceCommand
        }
      }
    })
    return result
  }

  const forceStopRecording = async () => {
    startKeywordDetectedRef.current = undefined
    // stop auto stop timeout
    stopUttering() // stop untterance if it is speaking
    playSonar() // play stop keyword detection sound
    setIsLoading(true)
    stopRecording() // stop useWhisper recorder
  }

  /**
   * stop useWhisper recorder once auto stop timeout reached
   */
  const onAutoStop = async () => {
    // console.log('onAutoStop')
    startKeywordDetectedRef.current = undefined
    endKeywordDetectedRef.current = undefined
    stopAutoStopTimeout()
    stopUttering()
    playSonar()
    setIsLoading(true)
    await stopRecording()
  }

  const onSpeechRecognized = async (data: WordRecognized) => {
    interimRef.current += data.text
    if (
      interimRef.current &&
      !endKeywordDetectedRef.current &&
      !sendingDetectedMessageRef.current
    ) {
      /**
       * loop through START_KEYWORDS to find matching text in transcript.text
       */
      for (const keyword of START_KEYWORDS) {
        // check there is matching START_KEYWORD in transcript.text
        const startIndex = interimRef.current
          .toLocaleLowerCase()
          .lastIndexOf(keyword.toLocaleLowerCase())
        if (startIndex !== -1) {
          console.log('START_KEYWORD DETECTED!')
          // start listening mode since keyword was detected
          if (!startKeywordDetectedRef.current) {
            stopUttering()
            playPing()
            await startRecording()
            startKeywordDetectedRef.current = true
          }
          // check if there is matching END_KEYWORD in interimRef.current
          const endIndex = interimRef.current
            .toLocaleLowerCase()
            .lastIndexOf(END_KEYWORD.toLocaleLowerCase())
          if (endIndex !== -1 && endIndex > startIndex) {
            console.log('END_KEYWORD DETECTED!')
            // set detected state to true, to avoid sending multiple messages
            endKeywordDetectedRef.current = true
            interimRef.current = ''
            // cut out START_KEYWORD and END_KEYWORD to create message to be sent to ChatGPT
            let message = interimRef.current.slice()
            message = message.substring(startIndex + keyword.length, endIndex)
            // if there are "." or "," or "?" also cut it out
            if (
              message.startsWith('.') ||
              message.startsWith(',') ||
              message.startsWith('?')
            ) {
              message = message.substring(2)
            }
            if (!sendingDetectedMessageRef.current) {
              startKeywordDetectedRef.current = undefined
              endKeywordDetectedRef.current = undefined
              stopUttering()
              playSonar()
              setIsLoading(true)
              await stopRecording()
            }
          }
        }
      }
    }
  }

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

  const onTranscribe = async () => {
    console.log({ transcript })
    const transcribed = await transcribeAudio(transcript.blob)
    // console.log({ transcribed })
    if (transcribed.error) {
      console.warn('24MB file size limit reached!')
      showErrorMessage('24MB limit reached!')
      return
    }
    let text = transcribed.text.slice()
    const lowerCaseText = transcribed.text.slice().toLocaleLowerCase()
    if (lowerCaseText.includes(START_KEYWORDS[0].toLocaleLowerCase())) {
      // cutout start keyword from transcribed text
      text = text.substring(
        lowerCaseText.indexOf(
          START_KEYWORDS[0].toLocaleLowerCase() + START_KEYWORDS[0].length + 1
        )
      )
      // cutout any punctuations
      if (text.startsWith(',') || text.startsWith('!')) {
        text = text.substring(1)
      }
    }
    if (lowerCaseText.includes(END_KEYWORD.toLocaleLowerCase())) {
      // cutout end keyword from transcribed text
      text = text.substring(
        0,
        lowerCaseText.lastIndexOf(END_KEYWORD.toLocaleLowerCase()) - 1
      )
    }
    text = text.trim()
    const voiceCommand = checkIsVoiceCommand(text)
    console.log({ voiceCommand })
    if (voiceCommand) {
      console.log('run command')
      runVoiceCommand(voiceCommand)
      return
    }
    // console.log({ text })
    // submit transcribed text to ChatGPT-4
    submitTranscript(text).then(() => {
      // lastTranscript.current = transcript.text
      transcript.blob = undefined
      setIsLoading(false)
      setIsSending(false)
    })
  }

  const prepareHark = async () => {
    if (!harkRef.current && streamRef.current) {
      const { default: harkjs } = await import('hark')
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
    if (process.env.NODE_ENV === 'development') {
      // socketRef.current = io('http://localhost:8080')
      socketRef.current = io('https://eec4e80981a1.ngrok.app')
    } else {
      // socketRef.current = io('https://talktogpt-api.onrender.com')
      socketRef.current = io('https://talktogpt-cd054735c08a.herokuapp.com')
    }

    socketRef.current.on('connect', () => {
      console.log('connected')
      socketRef.current.emit('startGoogleCloudStream')
    })

    socketRef.current.on('receive_audio_text', (data) => {
      // console.log('received audio text', data)
      onSpeechRecognized(data)
    })

    socketRef.current.on('disconnect', () => {
      console.log('disconnected', socketRef.current.id)
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
    switch (voiceCommand.command) {
      case 'off-auto-stop':
        console.log('turn off auto response!')
        setIsAutoStop(false)
        break
      case 'on-auto-stop':
        console.log('turn on auto response!')
        setIsAutoStop(true)
        break
      case 'change-auto-stop':
        console.log('change automatic response time!', {
          args: voiceCommand.args,
        })
        if (voiceCommand.args && typeof voiceCommand.args === 'number') {
          setAutoStopTimeout(voiceCommand.args)
        } else {
          transcript.blob = undefined
          setIsLoading(false)
          showErrorMessage('incorrect voice command.')
        }
        break
      default:
    }
    transcript.blob = undefined
    setIsLoading(false)
    showSuccessMessage(voiceCommand.matcher)
  }

  const showErrorMessage = (message: string) => {
    setNoti({ type: 'error', message })
    startUttering(message)
  }

  const showSuccessMessage = (message: string) => {
    setNoti({ type: 'success', message })
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

    processorRef.current.port.onmessage = ({ data: audio }) => {
      socketRef.current.emit('send_audio_data', { audio })
    }
  }

  const startUttering = (text: string) => {
    // console.log({ speechRef: speechRef.current })
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
    setIsListening(false)
  }

  const stopUttering = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
      setIsUnttering(false)
    }
  }

  const submitTranscript = async (text?: string) => {
    console.log('submitTranscript', text)
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
      const data: CreateMessage = { content: text, role: 'user' }

      append(data, {
        options: {
          body: auth.user?.id ? { userId: auth.user.id } : undefined,
        },
      })
      return
    } catch (sendDetectedTranscriptError) {
      console.error({ sendDetectedTranscriptError })
      setIsLoading(false)
      setIsSending(false)
      showErrorMessage(NOTI_MESSAGES.gpt.error)
      return
    }
  }

  const toggleUnttering = () => {
    // console.log({ isUnttering })
    if (isUnttering) {
      stopUttering()
    } else {
      const lastMessage = messages
        .slice()
        .reverse()
        .find((message) => message.role === 'assistant')?.content
      // console.log({ lastMessage })
      if (lastMessage) {
        startUttering(lastMessage)
      }
    }
  }

  const transcribeAudio = async (
    blob: Blob
  ): Promise<{ error?: Error; text: string }> => {
    if (!encoderRef.current) {
      const { Mp3Encoder } = await import('lamejs')
      // initialize lamejs encoder
      encoderRef.current = new Mp3Encoder(1, 44100, 96)
    }
    const buffer = await blob.arrayBuffer()
    // console.log({ wav: buffer.byteLength })
    // convert wav to mp3 to reduce file size
    const mp3 = encoderRef.current.encodeBuffer(new Int16Array(buffer))
    blob = new Blob([mp3], { type: 'audio/mpeg' })
    // console.log({ blob, mp3: mp3.byteLength })
    // mp3 should not exceed 24MB
    if (mp3.byteLength > 24_000_000) {
      setIsLoading(false)
      setIsSending(false)
      return { error: new Error('24MB limit reached!'), text: '' }
    }
    const file = new File([blob], 'speech.mp3', { type: 'audio/mpeg' })
    // submit audio blob to Whisper for transcription
    const text = await whisperTranscript(file)
    // console.log('onTranscribing', { text })
    return { text }
  }

  const whisperTranscript = async (file: File) => {
    // Whisper only accept multipart/form-data currently
    const body = new FormData()
    body.append('file', file)
    body.append('model', 'whisper-1')
    body.append('temperature', '0.1')
    const headers: RawAxiosRequestHeaders = {}
    headers['Content-Type'] = 'multipart/form-data'
    if (process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      headers[
        'Authorization'
      ] = `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
    }

    try {
      const { default: axios } = await import('axios')
      // send form data with audio file to Whisper endpoint
      const response = await axios.post(
        WHISPER_API_ENDPOINT + 'transcriptions',
        body,
        {
          headers,
        }
      )
      return response.data.text
    } catch (err) {
      showErrorMessage('call to whisper failed!')
      return ''
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
    return () => {
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
  content: `Hi ${name}, I'm Orion, an extremely concise AI. To speak to me, click the mic icon, then say "${START_KEYWORDS[0]}" to start the message, and "${END_KEYWORD}" to end your message. Make sure to speak clearly and say the keywords clearly and with pause. How are you? `,
  role: 'assistant',
  id: 'initial-message',
})
