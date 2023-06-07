import {
    CloudArrowUpIcon,
    MicrophoneIcon,
    ChatBubbleLeftRightIcon,
    PencilSquareIcon,
    CursorArrowRaysIcon,
    SparklesIcon,
    ArrowsPointingInIcon,
    GlobeAmericasIcon,
} from "@heroicons/react/20/solid";
import AnswerDeepform from "../../public/images/AnswerDeepform.png";
import SubmissionsDeepform from "../../public/images/SubmissionsDeepform.png";
import Link from "next/link";
import CTAButtons from "./atoms/CTAButtons";
import DeepformFeedbackPortal from "../../public/images/DeepformFeedbackPortalScreenshot.png";
import DeepformFeedback from "../../public/images/DeepformFeedbackScreenshot.png";
import DeepformAddIdea from "../../public/images/DeepformAddIdeaScreenshot.png";

const featuresSection1 = [
    {
        name: "Easy Setup",
        description:
            "Set up your feedback portal in less than a minute. No coding required.",
        icon: CloudArrowUpIcon,
    },
    {
        name: "Simple to Use",
        description:
            "Your users can easily submit feedback, vote, and comment in a few clicks, so you can get more feedback.",
        icon: CursorArrowRaysIcon,
    },
    {
        name: "A.I. Followups",
        description:
            "Your A.I. asks followup questions to get more detail, so you can uncover the underlying problem faster.",
        icon: ArrowsPointingInIcon,
    },
];

const featuresSection2 = [
    {
        name: "Intuitive Admin UI",
        description:
            "Easily manage feedback, users, and settings in the same view as your public feedback portal.",
        icon: ChatBubbleLeftRightIcon,
    },
    {
        name: "A.I. Analysis (Coming Soon)",
        description:
            "Chat with your A.I. about your data and turn raw feedback into insights. Summarize, categorize, and more.",
        icon: SparklesIcon,
    },
    {
        name: "Announce Updates",
        description:
            "Keep your users updated about which ideas are planned, in progress, and shipped.",
        icon: GlobeAmericasIcon,
    },
];

// const featuresSection3 = [
//     {
//         name: "Easy Setup",
//         description:
//             "Simply create a Deepform and tell the A.I. your research goal.",
//         icon: CloudArrowUpIcon,
//     },
//     {
//         name: "Instant Deployment",
//         description:
//             "Send a Deepform link to your users and start conducting automated interviews immediately.",
//         icon: ArrowUpOnSquareStackIcon,
//     },
//     {
//         name: "Text and Voice Interviews",
//         description: "Your users can respond to the A.I. in text or voice.",
//         icon: MicrophoneIcon,
//     },
// ];

export default function FeatureSection() {
    return (
        <>
            <div className="overflow-hidden bg-transparent py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto grid max-w-2xl grid-cols-1 items-center justify-center gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                        <div className="lg:pr-8 lg:pt-4">
                            <div className="lg:max-w-lg">
                                <h2 className="text-base font-semibold leading-7 text-indigo-600">
                                    Capture
                                </h2>
                                <p className="mt-2 font-satoshi text-4xl font-medium tracking-tight text-gray-900">
                                    Collect deep feedback with A.I.
                                </p>
                                <p className="mt-6 text-lg leading-8 text-gray-600">
                                    Customer feedback is the lifeblood of your
                                    company. Collect ideas in one place and let
                                    the most voted and commented ideas surface
                                    to the top.
                                </p>
                                <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                                    {featuresSection1.map((feature) => (
                                        <div
                                            key={feature.name}
                                            className="relative pl-9"
                                        >
                                            <dt className="inline font-semibold text-gray-900">
                                                <feature.icon
                                                    className="absolute left-1 top-1 h-5 w-5 text-indigo-600"
                                                    aria-hidden="true"
                                                />
                                                {feature.name}
                                            </dt>{" "}
                                            <dd className="inline">
                                                {feature.description}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                                <CTAButtons centered={false} />
                            </div>
                        </div>
                        <img
                            src={DeepformAddIdea.src}
                            alt="Product screenshot"
                            className="rounded-xl shadow-2xl ring-1 ring-gray-900/10"
                            // className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
                            width={2432}
                            height={1442}
                        />
                    </div>
                </div>
            </div>
            <div className="overflow-hidden bg-transparent py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto grid max-w-2xl grid-cols-1 items-center justify-center gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                        <div className="lg:ml-auto lg:pl-4 lg:pt-4">
                            <div className="lg:max-w-lg">
                                <h2 className="text-base font-semibold leading-7 text-indigo-600">
                                    Analyze
                                </h2>
                                <p className="mt-2 font-satoshi text-4xl font-medium tracking-tight text-gray-900">
                                    Make insight driven decisions
                                </p>
                                <p className="mt-6 text-lg leading-8 text-gray-600">
                                    Turn raw feedback into insights in minutes,
                                    not days with an intuitive admin experience, in-depth A.I.
                                    analysis, and more.
                                </p>
                                <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                                    {featuresSection2.map((feature) => (
                                        <div
                                            key={feature.name}
                                            className="relative pl-9"
                                        >
                                            <dt className="inline font-semibold text-gray-900">
                                                <feature.icon
                                                    className="absolute left-1 top-1 h-5 w-5 text-indigo-600"
                                                    aria-hidden="true"
                                                />
                                                {feature.name}
                                            </dt>{" "}
                                            <dd className="inline">
                                                {feature.description}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>
                                <CTAButtons centered={false} />
                            </div>
                        </div>
                        <div className="flex items-start justify-end lg:order-first">
                            <img
                                src={DeepformFeedback.src}
                                alt="Product screenshot"
                                className="rounded-xl shadow-2xl ring-1 ring-gray-900/10"
                                // className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]"
                                width={2432}
                                height={1442}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* <div className="bg-transparent py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:mx-0">
                        <h2 className="font-satoshi text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl">
                            Your customers are constantly evolving.
                        </h2>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Inject Deepforms into every customer touchpoint to
                            keep up with their changing needs, so you can build
                            products they love.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3"> */}
            {/* {featuresSection3.map((feature) => (
                                <div
                                    key={feature.name}
                                    className="flex flex-col"
                                >
                                    <dt className="text-base font-semibold leading-7 text-gray-900">
                                        <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                                            <feature.icon
                                                className="h-6 w-6 text-white"
                                                aria-hidden="true"
                                            />
                                        </div>
                                        {feature.name}
                                    </dt>
                                    <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600">
                                        <p className="flex-auto">
                                            {feature.description}
                                        </p>
                                        <p className="mt-6">
                                            <a
                                                href={feature.href}
                                                className="text-sm font-semibold leading-6 text-indigo-600"
                                            >
                                                Learn more{" "}
                                                <span aria-hidden="true">
                                                    →
                                                </span>
                                            </a>
                                        </p>
                                    </dd>
                                </div>
                            ))} */}
            {/* </dl>
                    </div>
                </div>
            </div> */}
        </>
    );
}
