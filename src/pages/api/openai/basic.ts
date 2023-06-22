// Next.js API route that uses Langchain with ChatGPT to generate a response to a user's message(s)

import { ChatOpenAI } from "langchain/chat_models";
import {
    HumanChatMessage,
    SystemChatMessage,
    AIChatMessage,
    BaseChatMessage,
} from "langchain/schema";
import { BasicCompletionType } from "types/portalTypes";
import axios, { AxiosRequestConfig } from "axios";
const ELEVEN_API_KEY = process.env.ELEVEN_LABS_API_KEY
const VOICE_ID = '21m00Tcm4TlvDq8ikWAM';
export default async function handler(req, res) {
    console.log("In API route /api/openai/basic");
    const {
        messages,
        userId,
    }: BasicCompletionType = req.body;
    if (
        !messages ||
        !userId
    ) {
        res.status(400).json({
            error: "Missing messages, userId.",
        });
        return;
    }

    const chat = new ChatOpenAI({ modelName: "gpt-3.5-turbo" });
    let formattedMessages = [];

    for (let i = 0; i < messages.length; i++) {
        if (messages[i].sender === "AI") {
            formattedMessages.push(new AIChatMessage(messages[i].message));
        } else {
            formattedMessages.push(new HumanChatMessage(messages[i].message));
        }
    }
    const response = await chat.call(formattedMessages);
    // const isEndOfInterview = await chat.call([
    //     new SystemChatMessage(`You are determine whether this message sent by another AI denotes the end of an interview and respond
    //         in one single word, "True" or "False"
    //         Usually the AI will send a thank you message or summarize something about the interview when the interview is ending.`),
    //     new HumanChatMessage(
    //         `Respond in one single word, "True" or "False", whether this message denote the interview ending: ${response.text}.`
    //     ),
    // ]);
    console.log("response", response);
    // console.log("End of interview?", isEndOfInterview);
    // if (isEndOfInterview.text.includes("True")) {
    //     console.log(
    //         "End of interview! Time to summarize and then create a new submission associated with this form, with the summary attached."
    //     );
    //     // Summarize the formattedMessages using chat.call
    //     const summary = await chat.call([
    //         ...formattedMessages,
    //         response,
    //         new SystemChatMessage(
    //             `You are asked to summarize the key insights from the interview, keeping in mind that 
    //             the goal was to ask followup questions about the product feedback this human just submitted. 

    //             Make sure to include all relevant clarifying information that would be useful to a product manager 
    //             who wants to deeply understand the human's feedback and the context behind it. 
    //             Ideally, the summary should not be too long. A paragraph at most.

    //             Example: "Clarifications: When the person said "I don't like the color", they were referring to 
    //             the color of the button on the home page. They were not referring to the color of the text on 
    //             the home page. Also, when they mentioned that the button was distracting, they meant that it was 
    //             too large and took up too much space on the page, blocking their important workflow around data 
    //             analysis for their business."
    //             `
    //         ),
    //     ]);

    //     console.log("Summarized interview:", summary.text);

    //     const followupSubmissionResponse = await createFollowupSubmission({
    //         summary: summary.text,
    //         feedback: feedbackId,
    //         user: userId,
    //     });

    //     console.log("followupSubmissionResponse", followupSubmissionResponse);

    //     // Save transcript by calling createMessages with an array of messages
    //     // (don't forget the latest message, in the response variable)

    //     // We will need to build up an array of objects with the following structure:
    //     // {
    //     //     submission: submissionResponse.id,
    //     //     message: "message text",
    //     //     sender: "AI" or "Human",
    //     // }
    //     let messagesToSave: FollowupMessageType[] = [];
    //     for (let i = 0; i < messages.length; i++) {
    //         messagesToSave.push({
    //             followupSubmission: followupSubmissionResponse[0].id,
    //             message: messages[i].message,
    //             sender: messages[i].sender,
    //         });
    //     }

    //     // Latest response from AI
    //     messagesToSave.push({
    //         followupSubmission: followupSubmissionResponse[0].id,
    //         message: response.text,
    //         sender: "AI",
    //     });

    //     const messagesResponse = await createFollowupMessages(messagesToSave);

    //     console.log("Finished saving transcript and summary!");
    //     console.log("messagesResponse", messagesResponse);
    // }

    let modifiedResponse = {
        ...response,
    };

    console.log("new response", modifiedResponse);


    // Call Eleven Labs to convert modifiedResponse.text to audio and attach in modifiedResponse
    // Set options for the API request.
  const options: AxiosRequestConfig = {
    method: 'POST',
    url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    headers: {
      accept: 'audio/mpeg', // Set the expected response type to audio/mpeg.
      'content-type': 'application/json', // Set the content type to application/json.
      'xi-api-key': `${ELEVEN_API_KEY}`, // Set the API key in the headers.
    },
    data: {
      text: modifiedResponse.text, // Pass in the inputText as the text to be converted to speech.
    },
    responseType: 'arraybuffer', // Set the responseType to arraybuffer to receive binary data as response.
  };

  // Send the API request using Axios and wait for the response.
  const speechDetails = await axios.request(options);

  // Return the binary audio data received from API response.
    // modifiedResponse.audio = speechDetails.data;


    let finalResponse: {
        response: any;
        audio: any;
    } = {
        response: modifiedResponse,
        audio: speechDetails.data,
    };
    res.status(200).json(finalResponse);
}

// export default async (req, res) => {
//     console.log("req.body", req.body);
// const { messages, prompt } = req.body;
// const chat = new ChatOpenAI({ modelName: "gpt-3.5-turbo" });
// let formattedMessages = [];
// // First, push a HumanChatMessage that contains the prompt combined
// // with the base prompt for Deepform.
// let injectedBasePrompt = injectIntoBasePrompt(prompt);

// formattedMessages.push(new HumanChatMessage(injectedBasePrompt));

// for (let i = 0; i < messages.length; i++) {
//     if (messages[i].sender === "AI") {
//         formattedMessages.push(new AIChatMessage(messages[i].message));
//     } else {
//         formattedMessages.push(new HumanChatMessage(messages[i].message));
//     }
// }
// const response = await chat.call(formattedMessages);
// res.status(200).json(response);
// };