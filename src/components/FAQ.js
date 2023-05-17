import React from "react";

const faqs = [
    {
        id: 0,
        question: "What is Deepform?",
        answer: "Deepform is a software that lets you deploy A.I. that conduct user interviews completely on their own without any human intervention. It's like having a virtual assistant that conducts user interviews for you, anytime, anywhere.",
    },
    {
        id: 1,
        question: "How does Deepform conduct user interviews?",
        answer: "Deepform uses advanced large language model A.I. technology to conduct user interviews. Once you've defined the research goal, the AI engages in a chat conversation with the user, asking relevant questions and collecting responses.",
    },
    {
        id: 2,
        question: "What kind of insights can Deepform provide?",
        answer: "Deepform is designed to provide actionable insights based on the user interviews. The AI doesn't just transcribe the conversation, it analyzes and summarizes the findings, highlighting key points and trends.",
    },
    {
        id: 3,
        question: "How do I share the Deepform?",
        answer: "Once you've created a Deepform, you'll be given a unique link which can be shared with your users via email, social media, or embedded into your website or app (coming soon!). Anyone who clicks the link can participate in the automated user interview.",
    },
    {
        id: 4,
        question: "What measures does Deepform take to ensure data privacy?",
        answer: "At Deepform, we take data privacy very seriously. All user conversations are conducted in a secure environment and we adhere to strict data privacy standards to ensure the confidentiality and integrity of your data.",
    },
    {
        id: 5,
        question:
            "Can Deepform handle multiple user interviews at the same time?",
        answer: "Absolutely! One of the biggest advantages of Deepform is its scalability. The AI can handle multiple user interviews simultaneously, allowing you to gather insights from multiple users at the same time.",
    },
    {
        id: 6,
        question: "Do I need any technical knowledge to use Deepform?",
        answer: "No, Deepform is designed to be user-friendly and does not require any technical expertise. All you need to do is define the research goal and the AI handles the rest.",
    },
];

function FAQ() {
    return (
        <div className="mx-auto mt-24 max-w-7xl px-6 sm:mt-56 lg:px-8">
            <h2 className="font-satoshi text-4xl font-medium leading-10 tracking-tight text-gray-900">
                Frequently asked questions
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600">
                Have a different question and can’t find the answer you’re
                looking for? Reach out to the founder, Alan,{" "}
                <span className="font-semibold text-indigo-600 hover:text-indigo-500">
                    via live chat
                </span>{" "}
                (bottom right corner) and he’ll get back to you as soon as he
                can.
            </p>

            <dl className="mt-10 space-y-8 divide-y divide-gray-900/10">
                {faqs.map((faq) => (
                    <div
                        key={faq.id}
                        className="pt-8 lg:grid lg:grid-cols-12 lg:gap-8"
                    >
                        <dt className="text-base font-semibold leading-7 text-gray-900 lg:col-span-5">
                            {faq.question}
                        </dt>
                        <dd className="mt-4 lg:col-span-7 lg:mt-0">
                            <p className="text-base leading-7 text-gray-600">
                                {faq.answer}
                            </p>
                        </dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

export default FAQ;
