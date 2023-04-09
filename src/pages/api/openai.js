// Next.js API route that uses Langchain with ChatGPT to generate a response to a user's message(s)

import { ChatOpenAI } from "langchain/chat_models";
import { HumanChatMessage, SystemChatMessage, AIChatMessage } from "langchain/schema";
import injectIntoBasePrompt from "util/injectIntoBasePrompt";

export default async function handler(req, res) {
    const { messages, prompt } = req.body;
    if (!messages || !prompt) {
        res.status(400).json({ error: "Missing messages or prompt" });
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
    console.log("response", response);
    res.status(200).json(response);
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

