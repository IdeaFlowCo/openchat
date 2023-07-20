import { useWhisper } from '@chengsokdara/use-whisper'
import { usePorcupine } from '@picovoice/porcupine-react'
import { BuiltInKeyword, PorcupineDetection } from '@picovoice/porcupine-web'
import { useChat, type CreateMessage, type Message } from 'ai/react'
import porcupineModelBase64 from 'assets/porcupine_params'
import { type RawAxiosRequestHeaders } from 'axios'
import ChatMessage from 'components/atoms/ChatMessage'
import PorcupineInput from 'components/atoms/PorcupineInput'
import PorcupinePill from 'components/atoms/PorcupinePill'
import type { Harker } from 'hark'
import type { Encoder } from 'lamejs'
import { useEffect, useRef, useState } from 'react'
import useSound from 'use-sound'
import { useAuth } from 'util/auth'
import { getFirstName } from 'util/string'

const END_KEYWORD = BuiltInKeyword.Terminator
const PORCUPINE_MODEL = { base64: porcupineModelBase64 }
const START_KEYWORDS = [BuiltInKeyword.Alexa]
const STOP_TIMEOUT = 300 // 5 minutes
const WHISPER_API_ENDPOINT = 'https://api.openai.com/v1/audio/'

export const PorcupineChat = () => {
  const auth = useAuth()

  const autoStopRef = useRef<NodeJS.Timeout>()
  const chatRef = useRef<HTMLDivElement>()
  const encoderRef = useRef<Encoder>()
  const harkRef = useRef<Harker>()
  const notiTimeoutRef = useRef<NodeJS.Timeout>()
  const notiIntervalRef = useRef<NodeJS.Timer>()
  const speechRef = useRef<SpeechSynthesisUtterance>()
  const startKeywordDetection = useRef<PorcupineDetection>()
  const streamRef = useRef<MediaStream>()

  const [playPing] = useSound('/sounds/ping.mp3')
  const [playSonar] = useSound('/sounds/sonar.mp3')

  const [isAutoStop, setIsAutoStop] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSending, setIsSending] = useState<boolean>(false)
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false)
  const [isUnttering, setIsUnttering] = useState<boolean>(false)
  const [isWhisperPrepared, setIsWhisperPrepared] = useState<boolean>(false)

  // const [messages, setMessages] = useState<MessageType[]>([
  //   getDefaultMessage(getFirstName(auth.user.name) || 'Ra'),
  // ])
  const [noti, setNoti] = useState<{
    type: keyof (typeof NOTI_MESSAGES)['gpt']
    message: string
  }>()
  const [porcupineAccessKey, setPorcupineAccessKey] = useState<string>(
    process.env.NEXT_PUBLIC_PORCUPINE_ACCESS_KEY
  )
  // const [query, setQuery] = useState<string>('')
  const [autoStopTimeout, setAutoStopTimeout] = useState<number>(STOP_TIMEOUT)
  const [speakingRate, setSpeakingRate] = useState<number>(1)

  const {
    keywordDetection,
    error: porcupineError,
    isLoaded,
    isListening,
    init,
    start,
    stop,
    release,
  } = usePorcupine()

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
    initialMessages: [getDefaultMessage(getFirstName(auth.user.name) || 'Ra')],
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
    // onResponse: async (response) => {
    //   let dataJson = await response.json()
    //   console.log({ dataJson })
    //   if (dataJson.error) {
    //     setIsLoading(false)
    //     setIsSending(false)
    //     showErrorMessage(NOTI_MESSAGES.gpt.error)
    //     startUttering(NOTI_MESSAGES.gpt.error)
    //     // return
    //   }
    // },
  })

  const submitTranscript = async (text?: string) => {
    console.log('submitTranscript', text)
    if (!text) {
      return
    }
    if (!auth.user) {
      return
    }
    if (!isLoading) setIsLoading(true)
    setIsSending(true)
    // setMessages((prevMessages: Message[]) => [
    //   ...prevMessages,
    //   { content: text, role: 'user' },
    // ])
    setNoti(undefined)
    // setQuery('')
    setInput('')

    try {
      // const data: BasicCompletionType = {
      //   messages: [{ message: text, sender: 'human' }],
      //   userId: auth.user.id,
      // }
      // console.log({ data })
      const data: CreateMessage = { content: text, role: 'user' }

      append(data, {
        options: {
          body: auth.user.id ? { userId: auth.user.id } : undefined,
        },
      })

      // let response = await fetch('/api/openai/basic', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: data ? JSON.stringify(data) : undefined,
      // })
      // let dataJson = await response.json()
      // console.log({ dataJson })

      // if (dataJson) {
      //   if (dataJson.error) {
      //     setIsLoading(false)
      //     setIsSending(false)
      //     showErrorMessage(NOTI_MESSAGES.gpt.error)
      //     startUttering(NOTI_MESSAGES.gpt.error)
      //     return
      //   }

      //   setMessages((prevMessages) => [
      //     ...prevMessages,
      //     { message: dataJson.response.text, sender: 'AI' },
      // //   ])

      //   startUttering(dataJson.response.text)
      // }
      return
    } catch (sendDetectedTranscriptError) {
      console.error({ sendDetectedTranscriptError })
      setIsLoading(false)
      setIsSending(false)
      showErrorMessage(NOTI_MESSAGES.gpt.error)
      return
    }
  }

  const whisperTranscript = async (file: File) => {
    // Whisper only accept multipart/form-data currently
    const body = new FormData()
    body.append('file', file)
    body.append('model', 'whisper-1')
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

  const onTranscribe = async () => {
    const transcribed = await transcribeAudio(transcript.blob)
    // console.log({ transcribed })
    if (transcribed.error) {
      console.warn('24MB file size limit reached!')
      showErrorMessage('24MB limit reached!')
      return
    }
    let text = transcribed.text.slice()
    const lowerCaseText = transcribed.text.toLocaleLowerCase()
    if (lowerCaseText.includes(BuiltInKeyword.Terminator.toLocaleLowerCase())) {
      // cutout end keyword from transcribed text
      text = text.substring(
        0,
        lowerCaseText.lastIndexOf(
          BuiltInKeyword.Terminator.toLocaleLowerCase()
        ) - 1
      )
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
      onTranscribe()
    }
  }, [recording, isSending, isWhisperPrepared, transcript])

  // useEffect(() => {
  //   if (isSending) {
  //     notiTimeoutRef.current = setTimeout(() => {
  //       setNoti({ type: 'loading', message: NOTI_MESSAGES.gpt.loading })
  //       startUttering(NOTI_MESSAGES.gpt.loading)
  //       clearTimeout(notiTimeoutRef.current)
  //       notiIntervalRef.current = setInterval(() => {
  //         startUttering(NOTI_MESSAGES.gpt.loading)
  //       }, 1_000 * 10)
  //     }, 1_000 * 5)
  //   } else {
  //     if (notiTimeoutRef.current) {
  //       clearTimeout(notiTimeoutRef.current)
  //       notiTimeoutRef.current = undefined
  //     }
  //     if (notiIntervalRef.current) {
  //       clearInterval(notiIntervalRef.current)
  //       notiIntervalRef.current = undefined
  //     }
  //   }
  // }, [isSending])

  /**
   * stop useWhisper recorder once auto stop timeout reached
   */
  const onAutoStop = async () => {
    // console.log('onAutoStop')
    clearTimeout(autoStopRef.current)
    autoStopRef.current = undefined
    stopUttering()
    playSonar()
    setIsLoading(true)
    await stopRecording()
  }

  useEffect(() => {
    if (keywordDetection !== null) {
      // console.log({ keywordDetection })
      if (keywordDetection.label === BuiltInKeyword.Alexa) {
        // start keyword detected
        startKeywordDetection.current = keywordDetection
        // start auto stop timeout
        if (isAutoStop) {
          autoStopRef.current = setTimeout(onAutoStop, autoStopTimeout * 1000)
        }
        stopUttering() // stop utterance if it is speaking
        playPing() // play start keyword detection sound
        startRecording() // start useWhisper recorder
      }
      if (
        startKeywordDetection.current &&
        keywordDetection.index > startKeywordDetection.current.index &&
        keywordDetection.label === BuiltInKeyword.Terminator
      ) {
        // stop keyword detected
        startKeywordDetection.current = undefined
        // stop auto stop timeout
        if (isAutoStop) {
          clearTimeout(autoStopRef.current)
          autoStopRef.current = undefined
        }
        stopUttering() // stop untterance if it is speaking
        playSonar() // play stop keyword detection sound
        setIsLoading(true)
        stopRecording() // stop useWhisper recorder
      }
    }
  }, [autoStopTimeout, isAutoStop, keywordDetection])

  const stopUttering = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
      setIsUnttering(false)
    }
  }

  const onStartUttering = () => {
    setIsUnttering(true)
  }

  const onStopUttering = () => {
    setIsUnttering(false)
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

  const onStartSpeaking = () => {
    setIsSpeaking(true)
  }

  const onStopSpeaking = () => {
    setIsSpeaking(false)
  }

  const stopPorcupine = async () => {
    await stop()
    releaseHark()
  }

  const startPorcupine = async () => {
    await start()
    await prepareHark()
  }

  const releaseHark = () => {
    // remove hark event listeners
    if (harkRef.current) {
      // @ts-ignore
      harkRef.current.off('speaking', onStartSpeaking)
      // @ts-ignore
      harkRef.current.off('stopped_speaking', onStopSpeaking)
    }
    // release audio stream and remove event listeners
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = undefined
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

  const prepareHark = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
    streamRef.current = await navigator.mediaDevices.getUserMedia({
      audio: true,
    })
    // console.log({ stream: stream.current })
    if (!harkRef.current) {
      const { default: harkjs } = await import('hark')
      harkRef.current = harkjs(streamRef.current, {
        interval: 100,
        play: false,
      })
      harkRef.current.on('speaking', onStartSpeaking)
      harkRef.current.on('stopped_speaking', onStopSpeaking)
    }
  }

  useEffect(() => {
    if (isLoaded) {
      prepareUseWhisper()
    }
  }, [isLoaded])

  const showErrorMessage = (message: string) => {
    setNoti({ type: 'error', message })
    startUttering(message)
  }

  useEffect(() => {
    if (porcupineError) {
      console.warn({ porcupineError })
      showErrorMessage(porcupineError.toString())
    }
  }, [porcupineError])

  useEffect(() => {
    // initialize porcupine
    init(porcupineAccessKey, [...START_KEYWORDS, END_KEYWORD], PORCUPINE_MODEL)
  }, [porcupineAccessKey])

  useEffect(() => {
    // release resource on component unmount
    return () => {
      // clear auto stop timeout instance
      if (autoStopRef.current) {
        clearTimeout(autoStopRef.current)
        autoStopRef.current = undefined
      }
      // flush out lamejs
      if (encoderRef.current) {
        encoderRef.current.flush()
        encoderRef.current = undefined
      }
      releaseHark()
      if (speechRef.current) {
        stopUttering()
        speechRef.current.removeEventListener('start', onStartUttering)
        speechRef.current.removeEventListener('end', onStopUttering)
      }
      release()
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
      <PorcupinePill
        autoStopTimeout={autoStopTimeout}
        isAutoStop={isAutoStop}
        isUnttering={isUnttering}
        speakingRate={speakingRate}
        onChangeAutoStopTimeout={setAutoStopTimeout}
        onChangeIsAutoStop={setIsAutoStop}
        onChangeSpeakingRate={setSpeakingRate}
        onChangePorcupineAccessKey={() => {
          let accessKey = prompt('Please enter Porcupine access key', '')
          if (accessKey) {
            setPorcupineAccessKey(accessKey)
          }
        }}
        onToggleUnttering={toggleUnttering}
      />
      {noti ? (
        <p
          onClick={() => setNoti(undefined)}
          className={`mt-2 text-center text-sm ${
            noti.type === 'error' ? 'text-red-500' : 'text-gray-500'
          }`}
        >
          {noti.message}
        </p>
      ) : null}
      <PorcupineInput
        isListening={isListening}
        isLoading={isLoading}
        isSpeaking={isSpeaking || speaking}
        isRecording={recording}
        isWhisperPrepared={isWhisperPrepared}
        query={input}
        onChangeQuery={handleInputChange}
        onStartPorcupine={startPorcupine}
        onStopPorcupine={stopPorcupine}
        onStopRecording={stopRecording}
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
