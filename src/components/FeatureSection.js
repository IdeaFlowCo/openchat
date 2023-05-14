import {
    CloudArrowUpIcon,
    LockClosedIcon,
    ServerIcon,
} from "@heroicons/react/20/solid";

const features = [
    {
        name: "Uninterrupted Research",
        description:
            "With Deepform, user research never sleeps. Conduct insightful user interviews any time of the day, without the need for manual scheduling.",
        icon: CloudArrowUpIcon,
    },
    {
        name: "Secure Conversations",
        description:
            "Your users' privacy is our top priority. All conversations are conducted in a secure environment, ensuring data integrity and confidentiality.",
        icon: LockClosedIcon,
    },
    {
        name: "Insightful Summaries",
        description:
            "Deepform does more than transcribe. It analyzes and summarizes the user interview, delivering actionable insights directly to your inbox.",
        icon: ServerIcon,
    },
];

export default function FeatureSection() {
    return (
        <>
            <div className="overflow-hidden bg-transparent py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                        <div className="lg:pr-8 lg:pt-4">
                            <div className="lg:max-w-lg">
                                <h2 className="text-base font-semibold leading-7 text-indigo-600">
                                    Accelerate research
                                </h2>
                                <p className="font-satoshi mt-2 text-4xl font-medium tracking-tight text-gray-900">
                                    Continuous User Insights, Simplified
                                </p>
                                <p className="mt-6 text-lg leading-8 text-gray-600">
                                    Deepform is a next-generation tool that
                                    revolutionizes user research. Our AI-driven
                                    solution lets you conduct user interviews
                                    anytime, anywhere, without the hassle of
                                    scheduling or conducting them yourself.
                                </p>
                                <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                                    {features.map((feature) => (
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
                            </div>
                        </div>
                        <img
                            src="https://tailwindui.com/img/component-images/dark-project-app-screenshot.png"
                            alt="Product screenshot"
                            className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
                            width={2432}
                            height={1442}
                        />
                    </div>
                </div>
            </div>
            <div className="overflow-hidden bg-transparent py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
                        <div className="lg:ml-auto lg:pl-4 lg:pt-4">
                            <div className="lg:max-w-lg">
                                <h2 className="text-base font-semibold leading-7 text-indigo-600">
                                    Accelerate research
                                </h2>
                                <p className="font-satoshi mt-2 text-4xl font-medium tracking-tight text-gray-900">
                                    Continuous User Insights, Simplified
                                </p>
                                <p className="mt-6 text-lg leading-8 text-gray-600">
                                    Deepform is a next-generation tool that
                                    revolutionizes user research. Our AI-driven
                                    solution lets you conduct user interviews
                                    anytime, anywhere, without the hassle of
                                    scheduling or conducting them yourself.
                                </p>
                                <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                                    {features.map((feature) => (
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
                            </div>
                        </div>
                        <div className="flex items-start justify-end lg:order-first">
                            <img
                                src="https://tailwindui.com/img/component-images/dark-project-app-screenshot.png"
                                alt="Product screenshot"
                                className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]"
                                width={2432}
                                height={1442}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-transparent py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:mx-0">
                        <h2 className="font-satoshi text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl">
                            Stay on top of customer empathy
                        </h2>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            Your customers are constantly evolving. Deepform
                            helps you stay on top of their needs by delivering
                            actionable insights to your product team on a
                            continuous basis, 100x faster and cheaper.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                            {features.map((feature) => (
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
                                            {/* <a
                                                href={feature.href}
                                                className="text-sm font-semibold leading-6 text-indigo-600"
                                            >
                                                Learn more{" "}
                                                <span aria-hidden="true">
                                                    →
                                                </span>
                                            </a> */}
                                        </p>
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>
        </>
    );
}
