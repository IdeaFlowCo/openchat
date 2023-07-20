import { CheckIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { useAuth } from "util/auth";
import FAQ from "./FAQ";
import TestimonialSection from "./TestimonialSection";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { useEffect } from "react";
const tiers = [
    {
        name: "Starter",
        id: "starter",
        href: "#",
        priceMonthly: "$19",
        description: "Start capturing feedback with our starter plan.",
        features: [
            "100 Active Ideas",
            "10 Trial A.I. Credits",
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
        priceMonthly: "$49",
        description:
            "Capture, organize, and analyze unlimited product feedback with AI.",
        features: [
            "Unlimited Ideas",
            "Unlimited A.I. Insights",
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
            "Single Sign-On (Coming soon)",
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

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function PricingSection() {
    const auth = useAuth();
    const router = useRouter();

    // Get query params
    const { fromRequirePlan } = router.query;

    // If fromRequirePlan, show toast that explains what just happened
    useEffect(() => {
        if (fromRequirePlan) {
            toast.error(
                "Hey there. Please purchase a paid plan to continue. Try us out with a 14 day free trial!",
                {
                    duration: 7000,
                }
            );
        }
    }, [fromRequirePlan]);
    return (
        <div className="bg-white py-12 sm:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-indigo-600">
                        Pricing
                    </h2>
                    <p className="mt-2 font-satoshi text-5xl font-medium tracking-tight text-gray-900 sm:text-6xl">
                        Cheaper than building the wrong features.
                    </p>
                </div>
                <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
                    Capture, organize, and analyze product feedback with AI.{" "}
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
                            {/* {tier?.id === "starter" ? (
                                <Link
                                    href={
                                        auth.user
                                            ? "/dashboard"
                                            : "/auth/signup"
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
                                        {auth.user
                                            ? "Go to dashboard"
                                            : "Sign up for free"}
                                    </a>
                                </Link>
                            ) : ( */}
                            <Link
                                href={
                                    auth.user
                                        ? `/purchase/${tier.id}`
                                        : `/auth/signup?next=/purchase/${tier.id}`
                                }
                                aria-describedby={tier.id}
                                className={classNames(
                                    tier.mostPopular
                                        ? "bg-indigo-600 text-white shadow-sm hover:bg-indigo-500"
                                        : "text-indigo-600 ring-1 ring-inset ring-indigo-200 hover:ring-indigo-300",
                                    "mt-8 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                )}>
                                
                                    Start 14 day free trial
                                
                            </Link>
                            {/* )} */}
                        </div>
                    ))}
                </div>
                {/* FAQ Section */}
                <FAQ />
                <TestimonialSection />
            </div>
        </div>
    );
}
