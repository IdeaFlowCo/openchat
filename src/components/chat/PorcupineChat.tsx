import { useWhisper } from '@chengsokdara/use-whisper'
import { usePorcupine } from '@picovoice/porcupine-react'
import { BuiltInKeyword, PorcupineDetection } from '@picovoice/porcupine-web'
import { useChat, type CreateMessage, type Message } from 'ai/react'
import porcupineModelBase64 from 'assets/porcupine_params'
import { type RawAxiosRequestHeaders } from 'axios'
import Alert from 'components/atoms/Alert'
import ChatMessage from 'components/atoms/ChatMessage'
import PorcupineInput from 'components/atoms/PorcupineInput'
import PorcupinePill from 'components/atoms/PorcupinePill'
import type { Harker } from 'hark'
import type { Encoder } from 'lamejs'
import { useEffect, useRef, useState } from 'react'
import useSound from 'use-sound'
import { useAuth } from 'util/auth'
import { getFirstName } from 'util/string'
import wordsToNumbers from 'words-to-numbers'
import { type VoiceCommand } from 'types/useWhisperTypes'

const END_KEYWORD = BuiltInKeyword.Terminator
const PORCUPINE_MODEL = { base64: porcupineModelBase64 }
const PORCUPINE_STORAGE_KEY = 'porcupine-access-key'
const START_KEYWORD = BuiltInKeyword.Alexa
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

  const [canReloadGPTResponse, setCanReloadGPTResponse] =
    useState<boolean>(false)
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
    type: 'error' | 'success'
    message: string
  }>()
  const [porcupineAccessKey, setPorcupineAccessKey] = useState<string>(
    localStorage.getItem(PORCUPINE_STORAGE_KEY) ??
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
    isLoading: isGPTGenerating,
    input,
    reload: reloadGPTResponse,
    setInput,
    stop: stopGPTResponse,
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

  const changePorcupineAccessKey = async () => {
    let accessKey = prompt('Please enter Porcupine access key', '')
    if (accessKey) {
      setPorcupineAccessKey(accessKey)
      localStorage.setItem(PORCUPINE_STORAGE_KEY, accessKey)
    }
  }

  const reloadTranscript = async () => {
    console.log('reloadTranscript')
    if (!auth.user) {
      return
    }
    if (!isLoading) setIsLoading(true)
    setCanReloadGPTResponse(false)
    setIsSending(true)
    setNoti(undefined)

    try {
      reloadGPTResponse({
        options: {
          body: auth.user.id ? { userId: auth.user.id } : undefined,
        },
      })
      return
    } catch (reloadDetectedTranscriptError) {
      console.error({ reloadDetectedTranscriptError })
      setIsLoading(false)
      setIsSending(false)
      showErrorMessage(NOTI_MESSAGES.gpt.error)
      return
    }
  }

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

  const onTranscribe = async () => {
    const transcribed = await transcribeAudio(transcript.blob)
    // console.log({ transcribed })
    if (transcribed.error) {
      console.warn('24MB file size limit reached!')
      showErrorMessage('24MB limit reached!')
      return
    }
    let text = transcribed.text.slice()
    const lowerCaseText = transcribed.text.slice().toLocaleLowerCase()
    if (lowerCaseText.includes(START_KEYWORD.toLocaleLowerCase())) {
      // cutout start keyword from transcribed text
      text = text.substring(
        lowerCaseText.indexOf(
          START_KEYWORD.toLocaleLowerCase() + START_KEYWORD.length + 1
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
    stopAutoStopTimeout()
    stopUttering()
    playSonar()
    setIsLoading(true)
    await stopRecording()
  }

  const startAutoStopTimeout = () => {
    autoStopRef.current = setTimeout(onAutoStop, autoStopTimeout * 1000)
  }

  const stopAutoStopTimeout = () => {
    if (autoStopRef.current) {
      clearTimeout(autoStopRef.current)
      autoStopRef.current = undefined
    }
  }

  useEffect(() => {
    if (isAutoStop && recording && !isSpeaking) {
      startAutoStopTimeout()
    }
    if (isAutoStop && !recording) {
      stopAutoStopTimeout()
    }
  }, [autoStopTimeout, isAutoStop, recording, isSpeaking])

  const onEndKeywordDetected = async () => {
    startKeywordDetection.current = undefined
    // stop auto stop timeout
    stopUttering() // stop untterance if it is speaking
    playSonar() // play stop keyword detection sound
    setIsLoading(true)
    stopRecording() // stop useWhisper recorder
  }

  const onStartKeywordDetected = () => {
    startKeywordDetection.current = keywordDetection
    // start auto stop timeout
    stopUttering() // stop utterance if it is speaking
    playPing() // play start keyword detection sound
    startRecording() // start useWhisper recorder
  }

  useEffect(() => {
    if (keywordDetection !== null) {
      // console.log({ keywordDetection })
      if (keywordDetection.label === START_KEYWORD) {
        // start keyword detected
        onStartKeywordDetected()
      }
      if (
        startKeywordDetection.current &&
        keywordDetection.index > startKeywordDetection.current.index &&
        keywordDetection.label === END_KEYWORD
      ) {
        // stop keyword detected
        onEndKeywordDetected()
      }
    }
  }, [keywordDetection])

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
    stopAutoStopTimeout()
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
      harkRef.current = undefined
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

  useEffect(() => {
    if (isLoaded) {
      prepareUseWhisper()
    }
  }, [isLoaded])

  const showErrorMessage = (message: string) => {
    setNoti({ type: 'error', message })
    startUttering(message)
  }

  const showSuccessMessage = (message: string) => {
    setNoti({ type: 'success', message })
  }

  useEffect(() => {
    if (porcupineError) {
      console.warn({ porcupineError })
      showErrorMessage(porcupineError.toString())
    }
  }, [porcupineError])

  useEffect(() => {
    // initialize porcupine
    init(
      porcupineAccessKey,
      [START_KEYWORD, END_KEYWORD],
      PORCUPINE_MODEL
    ).catch((porcupineError) => {
      console.warn({ porcupineError })
    })
  }, [porcupineAccessKey])

  useEffect(() => {
    // release resource on component unmount
    return () => {
      // clear auto stop timeout instance
      stopAutoStopTimeout()
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
        onChangePorcupineAccessKey={changePorcupineAccessKey}
        onToggleUnttering={toggleUnttering}
      />
      {isGPTGenerating || canReloadGPTResponse ? (
        <button
          className="mt-2 inline-flex w-fit items-center justify-center self-center rounded bg-gray-300 py-2 px-4 font-bold text-gray-800 hover:bg-gray-400"
          onClick={
            isGPTGenerating
              ? () => {
                  stopGPTResponse()
                  setIsLoading(false)
                  setIsSending(false)
                  setCanReloadGPTResponse(true)
                }
              : () => reloadTranscript()
          }
        >
          {canReloadGPTResponse ? <RefreshIcon /> : <StopIcon />}
          <span>
            {canReloadGPTResponse ? 'Regenerate response' : 'Stop generating'}
          </span>
        </button>
      ) : null}
      {noti ? (
        <Alert
          message={noti.message}
          type={noti.type}
          onClose={() => setNoti(undefined)}
        />
      ) : null}
      <PorcupineInput
        isListening={isListening}
        isLoading={isLoading}
        isSpeaking={isSpeaking || speaking}
        isRecording={recording}
        isWhisperPrepared={isWhisperPrepared}
        query={input}
        onChangeQuery={handleInputChange}
        onForceStopRecording={onEndKeywordDetected}
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
  content: `Hi ${name}, I'm Orion, an extremely concise AI. To speak to me, click the mic icon, then say "${START_KEYWORD}" to start the message, and "${END_KEYWORD}" to end your message. Make sure to speak clearly and say the keywords clearly and with pause. How are you? `,
  role: 'assistant',
  id: 'initial-message',
})

const RefreshIcon = () => {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {' '}
        <path
          d="M18.43 4.25C18.2319 4.25259 18.0426 4.33244 17.9025 4.47253C17.7625 4.61263 17.6826 4.80189 17.68 5V7.43L16.84 6.59C15.971 5.71363 14.8924 5.07396 13.7067 4.73172C12.5209 4.38948 11.2673 4.35604 10.065 4.63458C8.86267 4.91312 7.7515 5.49439 6.83703 6.32318C5.92255 7.15198 5.23512 8.20078 4.84001 9.37C4.79887 9.46531 4.77824 9.56821 4.77947 9.67202C4.7807 9.77583 4.80375 9.87821 4.84714 9.97252C4.89052 10.0668 4.95326 10.151 5.03129 10.2194C5.10931 10.2879 5.20087 10.3392 5.30001 10.37C5.38273 10.3844 5.4673 10.3844 5.55001 10.37C5.70646 10.3684 5.85861 10.3186 5.98568 10.2273C6.11275 10.136 6.20856 10.0078 6.26001 9.86C6.53938 9.0301 7.00847 8.27681 7.63001 7.66C8.70957 6.58464 10.1713 5.98085 11.695 5.98085C13.2188 5.98085 14.6805 6.58464 15.76 7.66L16.6 8.5H14.19C13.9911 8.5 13.8003 8.57902 13.6597 8.71967C13.519 8.86032 13.44 9.05109 13.44 9.25C13.44 9.44891 13.519 9.63968 13.6597 9.78033C13.8003 9.92098 13.9911 10 14.19 10H18.43C18.5289 10.0013 18.627 9.98286 18.7186 9.94565C18.8102 9.90844 18.8934 9.85324 18.9633 9.78333C19.0333 9.71341 19.0885 9.6302 19.1257 9.5386C19.1629 9.44699 19.1814 9.34886 19.18 9.25V5C19.18 4.80109 19.101 4.61032 18.9603 4.46967C18.8197 4.32902 18.6289 4.25 18.43 4.25Z"
          fill="#000000"
        ></path>{' '}
        <path
          d="M18.68 13.68C18.5837 13.6422 18.4808 13.6244 18.3774 13.6277C18.274 13.6311 18.1724 13.6555 18.0787 13.6995C17.9851 13.7435 17.9015 13.8062 17.8329 13.8836C17.7643 13.9611 17.7123 14.0517 17.68 14.15C17.4006 14.9799 16.9316 15.7332 16.31 16.35C15.2305 17.4254 13.7688 18.0291 12.245 18.0291C10.7213 18.0291 9.25957 17.4254 8.18001 16.35L7.34001 15.51H9.81002C10.0089 15.51 10.1997 15.431 10.3403 15.2903C10.481 15.1497 10.56 14.9589 10.56 14.76C10.56 14.5611 10.481 14.3703 10.3403 14.2297C10.1997 14.089 10.0089 14.01 9.81002 14.01H5.57001C5.47115 14.0086 5.37302 14.0271 5.28142 14.0643C5.18982 14.1016 5.1066 14.1568 5.03669 14.2267C4.96677 14.2966 4.91158 14.3798 4.87436 14.4714C4.83715 14.563 4.81867 14.6611 4.82001 14.76V19C4.82001 19.1989 4.89903 19.3897 5.03968 19.5303C5.18034 19.671 5.3711 19.75 5.57001 19.75C5.76893 19.75 5.95969 19.671 6.10034 19.5303C6.241 19.3897 6.32001 19.1989 6.32001 19V16.57L7.16001 17.41C8.02901 18.2864 9.10761 18.926 10.2934 19.2683C11.4791 19.6105 12.7327 19.6439 13.935 19.3654C15.1374 19.0869 16.2485 18.5056 17.163 17.6768C18.0775 16.848 18.7649 15.7992 19.16 14.63C19.1926 14.5362 19.2061 14.4368 19.1995 14.3377C19.1929 14.2386 19.1664 14.1418 19.1216 14.0532C19.0768 13.9645 19.0146 13.8858 18.9387 13.8217C18.8629 13.7576 18.7749 13.7094 18.68 13.68Z"
          fill="#000000"
        ></path>{' '}
      </g>
    </svg>
  )
}

const StopIcon = () => {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {' '}
        <path
          d="M17 19.75H7C6.27065 19.75 5.57118 19.4603 5.05546 18.9445C4.53973 18.4288 4.25 17.7293 4.25 17V7C4.25 6.27065 4.53973 5.57118 5.05546 5.05546C5.57118 4.53973 6.27065 4.25 7 4.25H17C17.7293 4.25 18.4288 4.53973 18.9445 5.05546C19.4603 5.57118 19.75 6.27065 19.75 7V17C19.75 17.7293 19.4603 18.4288 18.9445 18.9445C18.4288 19.4603 17.7293 19.75 17 19.75ZM7 5.75C6.66848 5.75 6.35054 5.8817 6.11612 6.11612C5.8817 6.35054 5.75 6.66848 5.75 7V17C5.75 17.3315 5.8817 17.6495 6.11612 17.8839C6.35054 18.1183 6.66848 18.25 7 18.25H17C17.3315 18.25 17.6495 18.1183 17.8839 17.8839C18.1183 17.6495 18.25 17.3315 18.25 17V7C18.25 6.66848 18.1183 6.35054 17.8839 6.11612C17.6495 5.8817 17.3315 5.75 17 5.75H7Z"
          fill="#000000"
        ></path>{' '}
      </g>
    </svg>
  )
}
