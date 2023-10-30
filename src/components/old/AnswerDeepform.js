import React, { Fragment, useState, useEffect } from 'react';
import { useDeepform } from 'util/db';
import ChatMessage from '../atoms/ChatMessage';
import { toast } from 'react-hot-toast';
import { useWhisper } from '@chengsokdara/use-whisper';
import { Dialog, Transition } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/24/outline';
import EndInterviewModal from './EndInterviewModal';
import ChatInput from 'components/atoms/ChatInput';

function AnswerDeepform(props) {
  const { data: deepformData, status: deepformStatus } = useDeepform(props.id);
  const [messages, setMessages] = useState([
    {
      message: `Hi, I'm Orion, an AI researcher. Thank you for participating in this conversational interview. I'll be asking you a few questions about your experiences. Feel free to answer as much or as little as you'd like.`,
      sender: 'AI',
    },
    {
      message: `Before we start, I'd like to get to know you a little better. What's your name?`,
      sender: 'AI',
    },
  ]);

  const [textInput, setTextInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEndInterviewModal, setShowEndInterviewModal] = useState(false);

  // console.log("deepformData", deepformData);

  const sendMessage = async (message) => {
    setLoading(true);

    // Error Handling
    if (!message) {
      toast.error('Please enter a message or record an audio clip.');
      setLoading(false);
      return;
    }
    setTextInput('');
    setMessages((prevMessages) => [
      ...prevMessages,
      { message: message, sender: 'human' },
    ]);

    // Create data object to send to API route /api/openai
    const data = {
      messages: [...messages, { message, sender: 'human' }],
      prompt: deepformData.prompt,
      deepformId: props.id,
    };

    console.log('data', data);

    // Send data to API route /api/openai
    await fetch('/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('data.text', data.text);
        setMessages((prevMessages) => [
          ...prevMessages,
          { message: data.text, sender: 'AI' },
        ]);
        if (data.isEndOfInterview) {
          setShowEndInterviewModal(false);
          // Time out for 3 seconds, then redirect to Deepform home page
          setTimeout(() => {
            window.location.href = '/';
          }, 5000);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log('err', err);
        setLoading(false);
        alert('Error sending message. Please try again.');
      });
  };

  // Whisper
  const onTranscribe = async (blob) => {
    const formData = new FormData();
    formData.append('file', blob, 'audio.wav');

    try {
      const response = await fetch('/api/whisper', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      const { text } = data;
      await sendMessage(text);
      return {
        blob,
        text,
      };
    } catch (error) {
      console.error(error);
      setLoading(false);
      return {
        blob,
        text: 'Failed to transcribe the audio.',
      };
    }
  };

  const {
    recording,
    speaking,
    transcribing,
    transcript,
    pauseRecording,
    startRecording,
    stopRecording,
  } = useWhisper({
    onTranscribe,
    removeSilence: true,
    whisperConfig: {
      language: 'en',
    },
  });

  // UseEffect that scrolls down to the bottom of the chat
  // whenever a new message is sent
  useEffect(() => {
    const chat = document.getElementById('chat');
    chat.scrollTop = chat.scrollHeight;
  }, [messages]);

  return (
    <>
      {/* <section className="flex flex-col justify-center items-center sm:mx-auto h-[80vh] b"> */}
      <div
        id='chat'
        className='flex h-[80vh] w-full items-start justify-center overflow-auto p-4 sm:pt-10'
      >
        <div className='container flex max-w-3xl flex-col gap-2'>
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
        setShowEndInterviewModal={setShowEndInterviewModal}
      />

      <EndInterviewModal open={showEndInterviewModal} />
    </>
    // </section>
  );
}

export default AnswerDeepform;
