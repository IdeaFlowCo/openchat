import { PaperAirplaneIcon } from "@heroicons/react/20/solid";
import React from "react";

export default function ChatInput({
    recording,
    startRecording,
    pauseRecording,
    stopRecording,
    sendMessage,
    textInput,
    setTextInput,
    loading,
    setLoading,
    setShowEndInterviewModal,
}) {
    return (
        <div className="mt-4 h-[20vh] w-full">
            <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative flex w-full items-center  justify-center rounded-full bg-[#f4f7fb] p-2 shadow-sm">
                    <label htmlFor="chat" className="sr-only">
                        Chat
                    </label>
                    <main className="">
                        <div>
                            {/* <p>Recording: {recording ? "true" : "false"}</p> */}
                            {/* <p>Speaking: {speaking ? "true" : "false"}</p> */}
                            {/* <p>
                                    Transcribing:{" "}
                                    {transcribing ? "true" : "false"}
                                </p> */}
                            {/* <p>Transcribed Text: {transcript?.text}</p> */}
                            {/* <button onClick={() => startRecording()}>
                                    Start
                                </button>
                                <button onClick={() => pauseRecording()}>
                                    Pause
                                </button>
                                <button onClick={() => stopRecording()}>
                                    Stop
                                </button> */}
                        </div>
                        {!recording ? (
                            <button
                                onClick={() => startRecording()}
                                disabled={recording}
                                className="mr-4 rounded-full border bg-white p-3 text-white hover:opacity-70 "
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="h-6 w-6 text-indigo-600"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                                    />
                                </svg>
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setLoading(true);
                                    stopRecording();
                                }}
                                disabled={!recording}
                                className="mr-4 rounded-full border border-black/10 bg-indigo-600 p-3"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="h-6 w-6 text-white"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        )}
                    </main>

                    <input
                        name="chat"
                        id="chat"
                        className="block h-12 grow rounded-md border-0 bg-transparent px-2 text-gray-900  placeholder:text-gray-400 focus:outline-0 sm:py-1.5 sm:text-sm sm:leading-6"
                        placeholder="Type your response..."
                        value={textInput}
                        autoComplete="off"
                        onChange={(e) => setTextInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                sendMessage(textInput);
                            }
                        }}
                    />
                    <button
                        type="submit"
                        onClick={() => sendMessage(textInput)}
                        disabled={loading}
                        className={
                            "ml-4 inline-flex items-center rounded-full border border-transparent bg-indigo-600 p-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        }
                    >
                        {!loading ? (
                            <PaperAirplaneIcon
                                className="h-6 w-6"
                                aria-hidden="true"
                            />
                        ) : (
                            <>
                                <svg
                                    aria-hidden="true"
                                    role="status"
                                    className="mr-3 inline h-4 w-4 animate-spin text-gray-200 dark:text-gray-600"
                                    viewBox="0 0 100 101"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                        fill="#1C64F2"
                                    />
                                </svg>
                                <p>Loading...</p>
                            </>
                        )}
                    </button>
                </div>
                <div>
                    {/* <a
                            href="/"
                            target="_blank"
                            className="mt-2 rounded-2xl border border-black/20 py-2 px-4"
                        >
                            Powered by{" "}
                            <span className="font-bold">Deepform</span>
                        </a> */}
                    <button
                        type="submit"
                        onClick={() => {
                            setShowEndInterviewModal(true);
                            sendMessage("Sorry, I have to go!");
                        }}
                        className="nline-flex ml-4 items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        End Interview
                    </button>
                </div>
            </div>
        </div>
    );
}
