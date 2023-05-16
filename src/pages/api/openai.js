// Next.js API route that uses Langchain with ChatGPT to generate a response to a user's message(s)

import { ChatOpenAI } from "langchain/chat_models";
import {
    HumanChatMessage,
    SystemChatMessage,
    AIChatMessage,
} from "langchain/schema";
import { createSubmission, createMessages } from "util/db";
import injectIntoBasePrompt from "util/injectIntoBasePrompt";

export default async function handler(req, res) {
    console.log("In API route /api/openai")
    const { messages, prompt, deepformId } = req.body;
    if (!messages || !prompt || !deepformId) {
        res.status(400).json({
            error: "Missing messages, prompt or Deepform ID",
        });
        return;
    }

    const chat = new ChatOpenAI({ modelName: "gpt-3.5-turbo" });
    let formattedMessages = [];
    // First, push a HumanChatMessage that contains the prompt combined
    // with the base prompt for Deepform.
    let injectedBasePrompt = injectIntoBasePrompt(prompt);

    formattedMessages.push(new HumanChatMessage(injectedBasePrompt));

    for (let i = 0; i < messages.length; i++) {
        if (messages[i].sender === "AI") {
            formattedMessages.push(new AIChatMessage(messages[i].message));
        } else {
            formattedMessages.push(new HumanChatMessage(messages[i].message));
        }
    }
    const response = await chat.call(formattedMessages);
    const isEndOfInterview = await chat.call([
        new SystemChatMessage(`You are determine whether this message sent by another AI denotes the end of an interview and respond
            in one single word, "True" or "False"
            Usually the AI will send a thank you message or summarize something about the interview when the interview is ending.`),
        new HumanChatMessage(
            `Respond in one single word, "True" or "False", whether this message denote the interview ending: ${response.text}.`
        ),
    ]);
    console.log("response", response);
    console.log("End of interview?", isEndOfInterview);
    if (isEndOfInterview.text.includes("True")) {
        console.log(
            "End of interview! Time to summarize and then create a new submission associated with this form, with the summary attached."
        );
        // Summarize the formattedMessages using chat.call
        const summary = await chat.call([
            ...formattedMessages,
            response,
            new SystemChatMessage(
                `You are asked to summarize the interview extensively, keeping in mind the goal prompt: ${prompt}. 
                Make sure to include all relevant information that answers that goal prompt.`
            ),
        ]);

        console.log("Summarized interview:", summary.text);

        const submissionResponse = await createSubmission({
            summary: summary.text,
            deepform: deepformId,
        });

        console.log("submissionResponse", submissionResponse);

        // Save transcript by calling createMessages with an array of messages 
        // (don't forget the latest message, in the response variable)

        // We will need to build up an array of objects with the following structure:
        // {
        //     submission: submissionResponse.id,
        //     message: "message text",
        //     sender: "AI" or "Human",
        // }
        let messagesToSave = [];
        for (let i = 0; i < messages.length; i++) {
            messagesToSave.push({
                submission_id: submissionResponse[0].id,
                message: messages[i].message,
                sender: messages[i].sender,
            });
        }

        // Latest response from AI
        messagesToSave.push({
            submission_id: submissionResponse[0].id,
            message: response.text,
            sender: "AI",
        });

        const messagesResponse = await createMessages(messagesToSave);

        console.log("Finished saving transcript and summary!");
        console.log("messagesResponse", messagesResponse);
    }

    let modifiedResponse = {
        ...response,
        isEndOfInterview: isEndOfInterview.text.includes("True"),
    }

    console.log("new response", modifiedResponse);

    res.status(200).json(modifiedResponse);
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
