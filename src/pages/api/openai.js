// Next.js API route that uses Langchain with ChatGPT to generate a response to a user's message(s)

import { ChatOpenAI } from "langchain/chat_models";
import {
    HumanChatMessage,
    SystemChatMessage,
    AIChatMessage,
} from "langchain/schema";
import { createSubmission } from "util/db";
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
                `You are asked to summarize the interview concisely, keeping in mind the goal prompt: ${prompt}`
            ),
        ]);

        console.log("Summarized interview:", summary.text);

        const submissionResponse = await createSubmission({
            summary: summary.text,
            deepform: deepformId,
        });

        console.log("submissionResponse", submissionResponse);
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
