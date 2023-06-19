import React from "react";

const faqs = [
    {
        id: 0,
        question: "What is Deepform?",
        answer: "Deepform is a customer feedback portal software that allows software teams to capture, organize, and analyze product feedback in one place. It helps teams build products that their customers love by providing a platform for customers to share ideas, vote on features, and engage in discussions.",
    },
    {
        id: 1,
        question: "How does Deepform work?",
        answer: "Deepform provides a customer-facing portal where customers can submit ideas, vote on existing ideas, and comment on them. The software team can then review this feedback, decide on the next steps, and keep customers informed about the status of various feature ideas.",
    },
    {
        id: 2,
        question: "What kind of insights can Deepform provide?",
        answer: "Deepform helps you understand what your customers want from your product. By analyzing the feedback, votes, and discussions, you can identify trends, popular requests, and areas of improvement. This can guide your product development and help you prioritize features that will have the most impact.",
    },
    {
        id: 3,
        question: "How do I share the Deepform portal with my customers?",
        answer: "Once you've set up your Deepform portal, you'll be given a unique link which can be shared with your customers via email, social media, or embedded into your website or app. Anyone who clicks the link can participate in the feedback process.",
    },
    {
        id: 4,
        question: "What measures does Deepform take to ensure data privacy?",
        answer: "At Deepform, we take data privacy very seriously. All user interactions are conducted in a secure environment and we adhere to strict data privacy standards to ensure the confidentiality and integrity of your data.",
    },
    {
        id: 5,
        question:
            "Can Deepform handle feedback from multiple customers at the same time?",
        answer: "Absolutely! Deepform is designed to handle feedback from many customers simultaneously. This allows you to gather a wide range of insights and ensures that every customer's voice can be heard.",
    },
    {
        id: 6,
        question: "Do I need any technical knowledge to use Deepform?",
        answer: "No, Deepform is designed to be user-friendly and does not require any technical expertise. All you need to do is set up your portal and invite your customers to participate. The platform handles the rest.",
    },
];

function FAQ() {
    return (
        <div className="mx-auto my-24 max-w-7xl px-6 lg:px-8">
            <h2 className="font-satoshi text-4xl font-medium leading-10 tracking-tight text-gray-900">
                Frequently asked questions
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600">
                Have a different question and can’t find the answer you’re
                looking for? Reach out to the founder, Alan,{" "}
                <span className="font-semibold text-indigo-600 hover:text-indigo-500">
                    by emailing alan@deepform.ai
                </span>{" "}
                and he’ll get back to you as soon as he
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
