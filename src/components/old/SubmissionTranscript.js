import React, { useState, useEffect } from 'react';
import { useMessagesBySubmission } from 'util/db';
import ChatMessage from '../atoms/ChatMessage';
import { toast } from 'react-hot-toast';

function SubmissionTranscript({ deepformId, submissionId }) {
  // const { data: deepformData, status: deepformStatus } = useDeepform(
  //     deepformId
  // );

  const { data: messagesData, status: messagesStatus } =
    useMessagesBySubmission(submissionId);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // console.log("deepformData", deepformData);
  // console.log("messagesData", messagesData);
  useEffect(() => {
    if (messagesStatus === 'success') {
      setMessages(messagesData);
    }
  }, [messagesStatus]);
  // UseEffect that scrolls down to the bottom of the chat
  // whenever a new message is sent
  // useEffect(() => {
  //     const chat = document.getElementById("chat");
  //     chat.scrollTop = chat.scrollHeight;
  // }, [messages]);

  return (
    <>
      {/* <section className="flex flex-col justify-center items-center sm:mx-auto h-[80vh] b"> */}
      <div
        id='chat'
        className='flex max-h-[400px] w-full items-start justify-center overflow-y-scroll sm:pt-4'
      >
        <div className='container flex max-w-3xl flex-col gap-2'>
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message.message}
              sender={message.sender}
            />
          ))}
          {messages.length === 0 && (
            <div className='flex h-full w-full items-center justify-center'>
              <p className='text-center text-black/40'>
                No transcript found! Please try refreshing the page. If the
                problem persists, please contact support.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* <div className="w-full h-[20vh]"></div> */}
    </>
    // </section>
  );
}

export default SubmissionTranscript;
