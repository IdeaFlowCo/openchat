import { useChat, type CreateMessage, type Message } from 'ai/react';
import Alert from 'components/atoms/Alert';
import ChatMessage from 'components/atoms/ChatMessage';
import GoogleSTTInput from 'components/atoms/GoogleSTTInput';
import GoogleSTTPill from 'components/atoms/GoogleSTTPill';
import InterimHistory from 'components/atoms/InterimHistory';
import type { Harker } from 'hark';
import { useEffect, useReducer, useRef, useState } from 'react';
import io, { type Socket } from 'socket.io-client';
import { type VoiceCommand } from 'types/useWhisperTypes';
import useSound from 'use-sound';
import { useAuth } from 'util/auth';
import {
  checkIsVoiceCommand,
  detectEndKeyword,
  extractStartKeyword,
  getVoiceCommandAction,
  handleKeywords,
  splitTextsBySeparator,
} from './methods';
import {
  BE_CONCISE,
  TALKTOGPT_SOCKET_ENDPOINT,
} from './constants';
import { isAndroid } from 'react-device-detect';
import { initialFlagsState, FlagsActions, flagsReducer } from './reducers/flags';
import { ControlsActions, controlsReducer, initialControlsState } from './reducers/controls';

const TEXT_SEPARATORS = {
  PARAGRAPH_BREAK: '\n\n',
  LINE_BREAK: '\n',
};

interface WordRecognized {
  isFinal: boolean;
  text: string;
}

const defaultMessage: Message = {
  content: `Welcome to Flow, your voice assistant. To activate flow, turn on the microphone. Then when you want to ask Flow a question and say “Flow, write a poem about Doug Engelbart” or anything else you would like to ask. You can switch to always on mode which allows you to speak, slowly, and end an utterance by saying “Over”.`,
  role: 'assistant',
  id: 'initial-message',
};

export const GoogleSttChat = () => {
  const auth = useAuth();

  const audioContextRef = useRef<AudioContext>();
  const audioInputRef = useRef<MediaStreamAudioSourceNode>();
  const autoStopRef = useRef<NodeJS.Timeout>();
  const chatRef = useRef<HTMLDivElement>();
  const harkRef = useRef<Harker>();
  const interimRef = useRef<string>('');
  const interimsRef = useRef<string[]>([]);
  const processorRef = useRef<AudioWorkletNode>();
  const socketRef = useRef<Socket>();
  const speechRef = useRef<SpeechSynthesisUtterance>();
  const startKeywordDetectedRef = useRef<boolean>(false);
  const endKeywordDetectedRef = useRef<boolean>(false);
  const streamRef = useRef<MediaStream>();
  const storedMessagesRef = useRef<string[]>(null);
  const lastSpeechIndexRef = useRef<number>(0);
  const isReadyToSpeech = useRef<boolean>(true);

  const [firstMessage, setFirstMessage] = useState<string | null>(null);
  const [interim, setInterim] = useState<string>('');
  const [openaiRequest, setOpenaiRequest] = useState<string>('');

  const [noti, setNoti] = useState<{
    type: 'error' | 'success';
    message: string;
  }>();

  const [{
    isAutoStop,
    isFinalData,
    isListening,
    isLoading,
    isRecording,
    isSending,
    isSpeaking,
    isTranscriptionDone,
    isUttering,
    isWhisperPrepared
  }, flagsDispatch] = useReducer(flagsReducer, initialFlagsState);

  const [{
    autoStopTimeout,
    speakingRate
  }, controlsDispatch] = useReducer(controlsReducer, initialControlsState);


  const [playSonar] = useSound('/sounds/sonar.mp3', { volume: 0.3, interrupt: true, });

  // Uttering functions
  const onStartUttering = async () => {
    flagsDispatch({ type: FlagsActions.START_UTTERING });
  };

  const onStopUttering = async () => {
    lastSpeechIndexRef.current += 1;
    if (storedMessagesRef.current.length > lastSpeechIndexRef.current) {
      startUttering(storedMessagesRef.current[lastSpeechIndexRef.current]);
    } else {
      flagsDispatch({ type: FlagsActions.STOP_UTTERING });
    }
  };

  const startUttering = (text: string) => {
    if (!text) {
      return;
    }
    flagsDispatch({ type: FlagsActions.START_UTTERING });
    if (!isAndroid || (isAndroid && !globalThis.ReactNativeWebView)) {
      if (!speechRef.current) {
        speechRef.current = new SpeechSynthesisUtterance();
        speechRef.current.addEventListener('start', onStartUttering);
        speechRef.current.addEventListener('end', onStopUttering);
      }
      speechRef.current.lang = 'en-US';
      speechRef.current.text = text;
      globalThis.speechSynthesis.speak(speechRef.current);
    } else {
      globalThis.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'speaking-start',
          data: text,
        })
      );
    }
  };

  const { messages, append, input, setInput, handleInputChange } = useChat({
    api: '/api/openai/stream',
    onError: (sendDetectedTranscriptError) => {
      console.error({ sendDetectedTranscriptError });
      flagsDispatch({ type: FlagsActions.STOP_SENDING_CHAT });
      showErrorMessage(NOTI_MESSAGES.gpt.error);
    },
    onFinish: (message) => {
      setFirstMessage(message.content);
      flagsDispatch({ type: FlagsActions.STOP_SENDING_CHAT });
    },
    onResponse: () => {
      lastSpeechIndexRef.current = 0;
      storedMessagesRef.current = [];
    },
  });

  const messagesSplitByParagraph = splitTextsBySeparator(
    messages,
    TEXT_SEPARATORS.PARAGRAPH_BREAK
  );
  const messagesSplitByLine = splitTextsBySeparator(
    messagesSplitByParagraph,
    TEXT_SEPARATORS.LINE_BREAK
  );

  const lastIndexUser = messagesSplitByLine.findLastIndex(
    (message) => message.role === 'user'
  );
  storedMessagesRef.current =
    lastIndexUser >= 0
      ? messagesSplitByLine
        .slice(lastIndexUser + 1)
        .map((message) => message.content)
      : [];
  if (
    storedMessagesRef.current.length > 1 &&
    lastSpeechIndexRef.current === 0 &&
    isReadyToSpeech.current
  ) {
    isReadyToSpeech.current = false;
    startUttering(storedMessagesRef.current[lastSpeechIndexRef.current]);
  }

  useEffect(() => {
    if (firstMessage && storedMessagesRef.current.length === 1)
      startUttering(firstMessage);
  }, [firstMessage]);

  const forceStopRecording = async () => {
    startKeywordDetectedRef.current = false;
    flagsDispatch({ type: FlagsActions.NOT_FINAL_DATA_RECEIVED });
    stopUttering();
    playSonar();
    flagsDispatch({ type: FlagsActions.START_LOADING });
    flagsDispatch({ type: FlagsActions.STOP_RECORDING });
  };

  const onAutoStop = async () => {
    endKeywordDetectedRef.current = undefined;
    stopAutoStopTimeout();
    await forceStopRecording();
  };

  const processStartKeyword = async () => {
    if (isUttering) {
      return
    }
    setOpenaiRequest('');
    flagsDispatch({ type: FlagsActions.START_RECORDING });
    flagsDispatch({ type: FlagsActions.START_TRANSCRIPTION });
    stopUttering();
    startKeywordDetectedRef.current = true;
  };

  const onSpeechRecognized = async (data: WordRecognized) => {
    try {
      interimRef.current += ` ${data.text}`;
      setInterim(data.text);

      if (data.isFinal) {
        interimsRef.current.push(data.text);
        interimRef.current = '';
        setOpenaiRequest((prev) => `${prev} ${data.text}`);
        flagsDispatch({ type: FlagsActions.FINAL_DATA_RECEIVED });
      } else {
        flagsDispatch({ type: FlagsActions.NOT_FINAL_DATA_RECEIVED });
      }

      // Detect staring keyword and start recording if detected
      if (
        typeof startKeywordDetectedRef.current !== 'undefined' &&
        !startKeywordDetectedRef.current &&
        !isUttering
      ) {
        const keyword = extractStartKeyword(interimRef.current);
        if (keyword !== null) {
          processStartKeyword();
        }
      }

      // Detect end keyword and stop recording if detected
      if (
        detectEndKeyword(interimRef.current) &&
        !endKeywordDetectedRef.current
      ) {
        endKeywordDetectedRef.current = true;
        if (typeof startKeywordDetectedRef.current !== 'undefined' &&
          !startKeywordDetectedRef.current) {
          stopUttering();
        } else {
          onAutoStop();
        }
      }

      if ((typeof startKeywordDetectedRef.current == 'undefined' || !startKeywordDetectedRef.current) &&
        (typeof endKeywordDetectedRef.current == 'undefined' || !endKeywordDetectedRef.current)) {
        const voiceCommand = checkIsVoiceCommand(interimsRef.current.reverse()[0]);

        if (typeof voiceCommand !== "undefined" && voiceCommand) {
          runVoiceCommand(voiceCommand);
          showSuccessMessage(`${voiceCommand.successMessage} ${voiceCommand.args ?? ''}`)
          return;
        }
      }
    } catch (error) {
      console.error('An error occurred in onSpeechRecognized:', error);
    }
  };

  const onTranscribe = async () => {
    // const transcribed = await transcribeAudio(transcript);

    // const transcriptionText = handleTranscriptionResults(transcribed);
    if (!openaiRequest) return;

    let text = handleKeywords(openaiRequest);
    await submitTranscript(text);

    flagsDispatch({ type: FlagsActions.STOP_SENDING_CHAT });
  };

  const prepareHark = async () => {
    if (!harkRef.current && streamRef.current) {
      const { default: harkjs } = await import('hark');
      harkRef.current = harkjs(streamRef.current, {
        interval: 100,
        threshold: -60,
        play: false,
      });
      harkRef.current.on('speaking', onStartSpeaking);
      harkRef.current.on('stopped_speaking', onStopSpeaking);
    }
  };

  const prepareUseWhisper = async () => {
    if (!isWhisperPrepared) {
      /**
       * fake start and stop useWhisper so that recorder is prepared
       * once start keyword detected, useWhisper can start record instantly
       */
      // await startRecording();
      // await stopRecording();
      flagsDispatch({ type: FlagsActions.PREPARE_WHISPER });
    }
  };

  const disableUseWhisper = async () => {
    if (isWhisperPrepared) {
      flagsDispatch({ type: FlagsActions.STOP_RECORDING });
      flagsDispatch({ type: FlagsActions.DISABLE_WHISPER });
    }
  }

  const prepareSocket = async () => {
    socketRef.current = io(TALKTOGPT_SOCKET_ENDPOINT);

    socketRef.current.on('connect', () => { });

    socketRef.current.on('receive_audio_text', (data) => {
      onSpeechRecognized(data);
    });

    socketRef.current.on('disconnect', () => { });
  };

  const releaseHark = () => {
    // remove hark event listeners
    if (harkRef.current) {
      // @ts-ignore
      harkRef.current.off('speaking', onStartSpeaking);
      // @ts-ignore
      harkRef.current.off('stopped_speaking', onStopSpeaking);
      harkRef.current = undefined;
    }
  };

  const releaseSocket = async () => {
    if (socketRef.current) {
      socketRef.current?.emit('endGoogleCloudStream');
      socketRef.current?.disconnect();
    }
    processorRef.current?.disconnect();
    audioInputRef.current?.disconnect();
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
    }
  };

  const turnOffMicrophone = () => {
    stopListening().then(() => {
      stopUttering();
      flagsDispatch({ type: FlagsActions.STOP_SPEAKING });
    });
  }

  const runVoiceCommand = (voiceCommand: VoiceCommand) => {
    const action = getVoiceCommandAction(voiceCommand);

    switch (action?.type) {
      case 'SET_IS_AUTO_STOP':
        flagsDispatch({ type: FlagsActions.TOGGLE_AUTO_STOP, value: action.value });
        break;

      case 'SET_MICROPHONE_OFF':
        turnOffMicrophone();
        break;

      case 'SET_AUTO_STOP_TIMEOUT':
        if (typeof action.value === 'number') {
          controlsDispatch({ type: ControlsActions.SET_AUTO_STOP_TIMEOUT, value: action.value })
        }
        if (typeof action.value === 'string') {
          if (action.value === 'faster') {
            controlsDispatch({
              type: ControlsActions.SET_AUTO_STOP_TIMEOUT,
              value: autoStopTimeout - 1 <= 0 ? 1 : autoStopTimeout - 1
            })
          }
          if (action.value === 'slower') {
            controlsDispatch({ type: ControlsActions.SET_AUTO_STOP_TIMEOUT, value: autoStopTimeout + 1 })
          }
        }

        break;
      case 'SHOW_MESSAGE':
        if (action.messageType === 'error') {
          showErrorMessage(action.message);
        } else if (action.messageType === 'success') {
          showSuccessMessage(action.message);
        }
        break;
      default:
        flagsDispatch({ type: FlagsActions.STOP_LOADING });
        showErrorMessage('Unknown command.');
        break;
    }
  };

  const showErrorMessage = (message: string) => {
    setNoti({ type: 'error', message });
    startUttering(message);
  };

  const showSuccessMessage = (message: string) => {
    setNoti({ type: 'success', message });
  };

  const startAutoStopTimeout = () => {
    autoStopRef.current = setTimeout(onAutoStop, autoStopTimeout * 1000);
  };

  const startListening = async () => {
    await prepareSocket();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
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
    });

    await prepareHark();

    audioContextRef.current = new globalThis.AudioContext();
    await audioContextRef.current.audioWorklet.addModule(
      '/worklets/recorderWorkletProcessor.js'
    );
    audioInputRef.current = audioContextRef.current.createMediaStreamSource(
      streamRef.current
    );
    processorRef.current = new AudioWorkletNode(
      audioContextRef.current,
      'recorder.worklet'
    );

    processorRef.current.connect(audioContextRef.current.destination);
    audioContextRef.current.resume();
    audioInputRef.current.connect(processorRef.current);

    flagsDispatch({ type: FlagsActions.START_LISTENING });
    socketRef.current?.emit('startGoogleCloudStream');

    processorRef.current.port.onmessage = ({ data: audio }) => {
      socketRef.current?.emit('send_audio_data', { audio });
    };
    // await stopRecording();
    // await startRecording();
  };

  const stopAutoStopTimeout = () => {
    if (autoStopRef.current) {
      clearTimeout(autoStopRef.current);
      autoStopRef.current = undefined;
    }
  };

  const stopListening = async () => {
    // release audio stream and remove event listeners
    releaseHark();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = undefined;
    }
    processorRef.current?.disconnect();
    audioInputRef.current?.disconnect();
    if (audioContextRef.current?.state !== 'closed') {
      audioContextRef.current?.close();
    }
    interimsRef.current = [];
    setInterim('');
    flagsDispatch({ type: FlagsActions.STOP_LISTENING });
    socketRef.current?.emit('endGoogleCloudStream');
  };

  const stopUttering = () => {
    if (!isAndroid || (isAndroid && !globalThis.ReactNativeWebView)) {
      if (globalThis.speechSynthesis.speaking) {
        globalThis.speechSynthesis.cancel();
      }
    } else {
      globalThis.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'speaking-stop',
        })
      );
    }
    endKeywordDetectedRef.current = undefined;
    flagsDispatch({ type: FlagsActions.STOP_LOADING });
    flagsDispatch({ type: FlagsActions.STOP_UTTERING });
  };

  const submitTranscript = async (text?: string) => {
    isReadyToSpeech.current = true;
    if (!text) {
      return;
    }
    // TODO: uncomment when supabase work again
    if (!auth.user) {
      return;
    }
    flagsDispatch({ type: FlagsActions.START_SENDING_CHAT });
    setNoti(undefined);
    setInput('');

    try {
      const data: CreateMessage = {
        content: `${text} ${BE_CONCISE}`,
        role: 'user',
      };

      await append(data, {
        options: {
          body: auth.user?.id ? { userId: auth.user.id } : undefined,
        },
      });
      return;
    } catch (sendDetectedTranscriptError) {
      console.error({ sendDetectedTranscriptError });
      flagsDispatch({ type: FlagsActions.STOP_SENDING_CHAT });
      showErrorMessage(NOTI_MESSAGES.gpt.error);
      return;
    }
  };

  const toggleUttering = () => {
    if (isUttering) {
      stopUttering();
    } else {
      const lastMessage = messages
        .slice()
        .reverse()
        .find((message) => message.role === 'assistant')?.content;
      if (lastMessage) {
        startUttering(lastMessage);
      }
    }
  };

  const onStartSpeaking = () => {
    flagsDispatch({ type: FlagsActions.START_SPEAKING });
    stopAutoStopTimeout();
  };

  const onStopSpeaking = () => {
    flagsDispatch({ type: FlagsActions.STOP_SPEAKING });
  };

  const cleanUpResources = () => {
    releaseSocket();
    releaseHark();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = undefined;
    }
    // clear auto stop timeout instance
    stopAutoStopTimeout();
    if (speechRef.current) {
      stopUttering();
      speechRef.current.removeEventListener('start', onStartUttering);
      speechRef.current.removeEventListener('end', onStopUttering);
    }
  };

  useEffect(() => {
    function handleStopUttering(message: {
      data: { type: string; data: boolean };
    }) {
      const { data, type } = message.data;
      if (type === 'speaking' && data === false) {
        onStopUttering();
      }
    }

    prepareUseWhisper().then(() => {
      startListening().then(() => {
        window.addEventListener('message', handleStopUttering);
      });
    });

    return () => {
      window.removeEventListener('message', handleStopUttering);
      // release resource on component unmount
      cleanUpResources();
    };
  }, []);

  /**
   * check before sending audio blob to Whisper for transcription
   */
  useEffect(() => {
    if (
      !isSending &&
      !isRecording &&
      isWhisperPrepared &&
      !isTranscriptionDone
    ) {
      onTranscribe().then(() => {
        flagsDispatch({ type: FlagsActions.STOP_TRANSCRIPTION });
      });
    }
  }, [isRecording, isSending, isWhisperPrepared, isTranscriptionDone]);

  useEffect(() => {
    if (
      isAutoStop &&
      isRecording &&
      isFinalData &&
      startKeywordDetectedRef.current
    ) {
      startAutoStopTimeout();
    }
    if (
      (isAutoStop && !isRecording) ||
      !isFinalData ||
      !startKeywordDetectedRef.current
    ) {
      stopAutoStopTimeout();
    }
  }, [
    isAutoStop,
    isRecording,
    isFinalData,
    startKeywordDetectedRef.current,
  ]);

  useEffect(() => {
    if (speechRef.current) {
      // change utterance speaking rate
      speechRef.current.rate = speakingRate;
    }
  }, [speakingRate]);

  useEffect(() => {
    if (chatRef.current) {
      // auto scroll when there is new message
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className='flex h-full w-screen flex-col'>
      <div
        ref={chatRef}
        id='chat'
        className='flex w-full flex-1 items-start justify-center overflow-auto p-4 sm:pt-10'
      >
        <div className='container flex max-w-3xl flex-col gap-3'>
          <ChatMessage
            message={defaultMessage.content}
            sender={defaultMessage.role}
          />
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
        isAutoStop={isAutoStop}
        isUnttering={isUttering}
        speakingRate={speakingRate}
        onChangeAutoStopTimeout={(value: number) => controlsDispatch({ type: ControlsActions.SET_AUTO_STOP_TIMEOUT, value: value })}
        onChangeIsAutoStop={(value: boolean) => { flagsDispatch({ type: FlagsActions.TOGGLE_AUTO_STOP, value: value }); }}
        onChangeSpeakingRate={(value: number) => controlsDispatch({ type: ControlsActions.SET_SPEANKING_RATE, value: value })}
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
        <InterimHistory interims={interimsRef.current} interim={interim} />
      ) : null}
      <GoogleSTTInput
        isListening={isListening}
        isLoading={isLoading}
        isSpeaking={isSpeaking}
        isRecording={isRecording && startKeywordDetectedRef.current}
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
  );
};

const NOTI_MESSAGES = {
  gpt: {
    loading: 'hang on, still working',
    error: 'Call to GPT Failed',
  },
};