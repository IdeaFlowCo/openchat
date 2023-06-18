// Next.js API route that uses Langchain with ChatGPT to generate a response to a user's message(s)

import { ChatOpenAI } from "langchain/chat_models";
import {
    HumanChatMessage,
    SystemChatMessage,
    AIChatMessage,
} from "langchain/schema";
import { FollowupPayloadType } from "types/portalTypes";
import { FollowupMessageType } from "types/supabaseDbTypes";
import { createFollowupSubmission, createFollowupMessages } from "util/db";
import { injectIntoFollowupPrompt } from "util/injectIntoPrompt";

export default async function handler(req, res) {
    console.log("In API route /api/openai/followup");
    const {
        messages,
        feedbackTitle,
        feedbackDescription,
        feedbackId,
        userId,
    }: FollowupPayloadType = req.body;
    if (
        !messages ||
        !feedbackId ||
        !feedbackTitle ||
        !feedbackDescription ||
        !userId
    ) {
        res.status(400).json({
            error: "Missing messages, Feedback ID, Feedback Title, userId, or Feedback Description",
        });
        return;
    }

    const chat = new ChatOpenAI({ modelName: "gpt-3.5-turbo" });
    let formattedMessages = [];
    // First, push a HumanChatMessage that contains the prompt combined
    // with the base prompt for Deepform.
    let injectedFollowupPrompt: string = injectIntoFollowupPrompt(
        feedbackTitle,
        feedbackDescription
    );

    formattedMessages.push(new HumanChatMessage(injectedFollowupPrompt));

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
                `You are asked to summarize the key insights from the interview, keeping in mind that 
                the goal was to ask followup questions about the product feedback this human just submitted. 

                Make sure to include all relevant clarifying information that would be useful to a product manager 
                who wants to deeply understand the human's feedback and the context behind it. 
                Ideally, the summary should not be too long. A paragraph at most.

                Example: "Clarifications: When the human said "I don't like the color", they were referring to 
                the color of the button on the home page. They were not referring to the color of the text on 
                the home page. Also, when they mentioned that the button was distracting, they meant that it was 
                too large and took up too much space on the page, blocking their important workflow around data 
                analysis for their business."
                `
            ),
        ]);

        console.log("Summarized interview:", summary.text);

        const followupSubmissionResponse = await createFollowupSubmission({
            summary: summary.text,
            feedback: feedbackId,
            user: userId,
        });

        console.log("followupSubmissionResponse", followupSubmissionResponse);

        // Save transcript by calling createMessages with an array of messages
        // (don't forget the latest message, in the response variable)

        // We will need to build up an array of objects with the following structure:
        // {
        //     submission: submissionResponse.id,
        //     message: "message text",
        //     sender: "AI" or "Human",
        // }
        let messagesToSave: FollowupMessageType[] = [];
        for (let i = 0; i < messages.length; i++) {
            messagesToSave.push({
                followupSubmission: followupSubmissionResponse[0].id,
                message: messages[i].message,
                sender: messages[i].sender,
            });
        }

        // Latest response from AI
        messagesToSave.push({
            followupSubmission: followupSubmissionResponse[0].id,
            message: response.text,
            sender: "AI",
        });

        const messagesResponse = await createFollowupMessages(messagesToSave);

        console.log("Finished saving transcript and summary!");
        console.log("messagesResponse", messagesResponse);
    }

    let modifiedResponse = {
        ...response,
        isEndOfInterview: isEndOfInterview.text.includes("True"),
    };

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
