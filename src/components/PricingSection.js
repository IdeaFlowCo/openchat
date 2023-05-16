import { CheckIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { useAuth } from "util/auth";

const tiers = [
    {
        name: "Starter",
        id: "starter",
        href: "#",
        priceMonthly: "$0",
        description: "Start automating your user interviews for free.",
        features: [
            "2 Deepforms",
            // "Up to 1,000 subscribers",
            "Basic analytics",
            "48-hour support response time",
        ],
        mostPopular: false,
    },
    {
        name: "Pro",
        id: "pro",
        href: "#",
        priceMonthly: "$29",
        description:
            "Full access to all the tools you need to automate your user interviews.",
        features: [
            "Unlimited Deepforms",
            "Unlimited Summaries and Transcripts",
            // "Up to 10,000 subscribers",
            "Advanced analytics",
            "24-hour support response time",
            // "Marketing automations",
        ],
        mostPopular: true,
    },
    {
        name: "Business",
        id: "business",
        href: "#",
        priceMonthly: "$99",
        description: "Dedicated support and infrastructure for your company.",
        features: [
            "Everything in Pro",
            "Custom Onboarding",
            "1-hour, dedicated support response time",
            "Dedicated Slack Channel",
            // "Unlimited Deepforms",
            // "Unlimited subscribers",
            // "Advanced analytics",
            // "1-hour, dedicated support response time",
            // "Marketing automations",
        ],
        mostPopular: false,
    },
];

const faqs = [
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

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function PricingSection() {
    const auth = useAuth();
    return (
        <div className="bg-white py-12 sm:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-indigo-600">
                        Pricing
                    </h2>
                    <p className="font-satoshi mt-2 text-5xl font-medium tracking-tight text-gray-900 sm:text-6xl">
                        Get started for free
                    </p>
                </div>
                <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
                    Automate your user interviews with AI. Get 100x more
                    customer insights, 100x faster and cheaper.{" "}
                    <span className="text-indigo-600">
                        Money back guarantee if you aren't satisfied.
                    </span>
                </p>

                <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    {tiers.map((tier, tierIdx) => (
                        <div
                            key={tier.id}
                            className={classNames(
                                tier.mostPopular
                                    ? "lg:z-10 lg:rounded-b-none"
                                    : "lg:mt-8",
                                tierIdx === 0 ? "lg:rounded-r-none" : "",
                                tierIdx === tiers.length - 1
                                    ? "lg:rounded-l-none"
                                    : "",
                                "flex flex-col justify-between rounded-3xl bg-white p-8 ring-1 ring-gray-200 xl:p-10"
                            )}
                        >
                            <div>
                                <div className="flex items-center justify-between gap-x-4">
                                    <h3
                                        id={tier.id}
                                        className={classNames(
                                            tier.mostPopular
                                                ? "text-indigo-600"
                                                : "text-gray-900",
                                            "text-lg font-semibold leading-8"
                                        )}
                                    >
                                        {tier.name}
                                    </h3>
                                    {tier.mostPopular ? (
                                        <p className="rounded-full bg-indigo-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-indigo-600">
                                            Most popular
                                        </p>
                                    ) : null}
                                </div>
                                <p className="mt-4 text-sm leading-6 text-gray-600">
                                    {tier.description}
                                </p>
                                <p className="mt-6 flex items-baseline gap-x-1">
                                    <span className="text-4xl font-bold tracking-tight text-gray-900">
                                        {tier.priceMonthly}
                                    </span>
                                    <span className="text-sm font-semibold leading-6 text-gray-600">
                                        /month
                                    </span>
                                </p>
                                <ul
                                    role="list"
                                    className="mt-8 space-y-3 text-sm leading-6 text-gray-600"
                                >
                                    {tier.features.map((feature) => (
                                        <li
                                            key={feature}
                                            className="flex gap-x-3"
                                        >
                                            <CheckIcon
                                                className="h-6 w-5 flex-none text-indigo-600"
                                                aria-hidden="true"
                                            />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <Link
                                href={
                                    auth.user
                                        ? `/purchase/${tier.id}`
                                        : `/auth/signup?next=/purchase/${tier.id}`
                                }
                            >
                                <a
                                    aria-describedby={tier.id}
                                    className={classNames(
                                        tier.mostPopular
                                            ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500"
                                            : "text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300",
                                        "mt-8 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    )}
                                >
                                    Buy plan
                                </a>
                            </Link>
                        </div>
                    ))}
                </div>
                {/* FAQ Section */}
                <div className="mx-auto mt-24 max-w-7xl px-6 sm:mt-56 lg:px-8">
                    <h2 className="font-satoshi text-4xl font-medium leading-10 tracking-tight text-gray-900">
                        Frequently asked questions
                    </h2>
                    <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600">
                        Have a different question and can’t find the answer
                        you’re looking for? Reach out to the founder, Alan,{" "}
                        <span className="font-semibold text-indigo-600 hover:text-indigo-500">
                            via live chat
                        </span>{" "}
                        (bottom right corner) and he’ll get back to you as soon as he can.
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
            </div>
        </div>
    );
}
