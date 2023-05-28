import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
    PlusSmallIcon,
    ChevronUpIcon,
    ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import StatusBadge from "components/atoms/StatusBadge";

const oldNav = [
    // { name: "Dashboard", href: "#", icon: HomeIcon, current: true },
    // { name: "Team", href: "#", icon: UsersIcon, current: false },
    // { name: "Projects", href: "#", icon: FolderIcon, current: false },
    // { name: "Calendar", href: "#", icon: CalendarIcon, current: false },
    // {
    //     name: "Documents",
    //     href: "#",
    //     icon: DocumentDuplicateIcon,
    //     current: false,
    // },
    // { name: "Reports", href: "#", icon: ChartPieIcon, current: false },
];

const requests = [
    {
        id: 1,
        fullName: "Mike Hill",
        title: "Custom Links in the Menu",
        description:
            "I'd like to add some custom links to the menu. Things like links to our help docs or maybe an on boarding video.",
        votes: 5,
        comments: 2,
        url: "#",
        date: "May 18",
        topics: ["Feature Request", "API", "Integrations"],
        status: "Under Consideration",
    },
    {
        id: 2,
        fullName: "Whitney Francis",
        title: "Dark mode please!",
        description:
            "It would be great to have a dark mode option. I love the app but my eyes are getting tired.",
        votes: 3,
        comments: 0,
        url: "#",
        date: "May 20",
        topics: ["Feature Request", "Design"],
        status: "Planned",
    },
    {
        id: 3,
        fullName: "Kristin Watson",
        title: "Ability to reorder the menu items",
        description:
            "I'd like to be able to reorder the menu items so that I can put the most important items at the top.",
        votes: 2,
        comments: 3,
        url: "#",
        date: "May 21",
        topics: ["Feature Request", "Design"],
        status: "In Development",
    },
];

const portalData = {
    id: "1",
    createdAt: "2021-05-24T00:00:00.000Z",
    statuses: [
        {
            name: "Under Consideration",
            description: "This feature is under consideration",
            textColor: "text-yellow-500",
            backgroundColor: "bg-yellow-100",
            borderColor: "border-yellow-500",
        },
        {
            name: "Planned",
            description: "This feature is planned",
            textColor: "text-blue-500",
            backgroundColor: "bg-blue-100",
            borderColor: "border-blue-500",
        },
        {
            name: "In Development",

            description: "This feature is in development",
            textColor: "text-green-500",
            backgroundColor: "bg-green-100",
            borderColor: "border-green-500",
        },
        {
            name: "Launched",
            description: "This feature has been launched",
            textColor: "text-orange-500",
            backgroundColor: "bg-orange-100",
            borderColor: "border-orange-500",
        },
        {
            name: "Not in Scope",
            description: "This feature is not in scope",
            textColor: "text-red-500",
            backgroundColor: "bg-red-100",
            borderColor: "border-red-500",
        },
    ],
};

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function PortalFeatureRequests() {
    return (
        <>
            {/*
        This example requires updating your template:

        ```
        <html class="h-full bg-white">
        <body class="h-full">
        ```
      */}
            <div className="fixed bottom-0 flex h-[calc(100vh-65px)] w-screen overflow-auto">
                {/* Static sidebar for desktop */}
                <div className="fixed hidden h-screen bg-transparent lg:flex lg:w-72 lg:flex-col">
                    {/* Sidebar component, swap this element with another sidebar if you like */}
                    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-gray-50 px-6">
                        <nav className="mt-10 flex flex-1 flex-col">
                            <ul
                                role="list"
                                className="flex flex-1 flex-col gap-y-7"
                            >
                                <li>
                                    <ul role="list" className="-mx-2 space-y-1">
                                        {oldNav.map((item) => (
                                            <li key={item.name}>
                                                <a
                                                    href={item.href}
                                                    className={classNames(
                                                        item.current
                                                            ? "bg-gray-50 text-indigo-600"
                                                            : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600",
                                                        "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6"
                                                    )}
                                                >
                                                    <item.icon
                                                        className={classNames(
                                                            item.current
                                                                ? "text-indigo-600"
                                                                : "text-gray-400 group-hover:text-indigo-600",
                                                            "h-6 w-6 shrink-0"
                                                        )}
                                                        aria-hidden="true"
                                                    />
                                                    {item.name}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
                <main className="flex h-fit w-screen items-center justify-center py-6 px-4 sm:py-8 lg:ml-72 lg:py-10">
                    <section className="flex w-full max-w-3xl flex-col lg:w-4/6 gap-12">
                        <div className="flex justify-between ">
                            <div className="flex flex-col gap-4">
                                <h1 className="font-satoshi text-3xl font-medium tracking-tight text-gray-900 md:text-4xl">
                                    Deepform Feature Requests
                                </h1>
                                <p className="text-gray-500">
                                    Feature suggestions for Deepform 💡
                                </p>
                            </div>
                            <button
                                type="button"
                                className="text-md absolute bottom-5 right-5 mt-2 flex h-fit w-fit items-center justify-center gap-[2px] whitespace-nowrap rounded-md bg-indigo-600 px-3.5 py-2.5 font-medium text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:static sm:flex"
                            >
                                <PlusSmallIcon className="-ml-2 h-5 w-5" />
                                Add an Idea
                            </button>
                        </div>
                        <div>
                            {requests.map((request) => (
                                <Fragment key={request.id}>
                                    <div className=" first:border-t flex w-full gap-5 border-b py-8 px-6 hover:bg-gray-50/80 transition-all hover:cursor-pointer">
                                        <button className=" flex h-16 w-16 flex-none flex-col items-center justify-center rounded-lg border  hover:border-2">
                                            <ChevronUpIcon className="-mb-1 h-5 w-5 text-gray-700" />
                                            <h1 className=" text-xl">
                                                {request.votes}
                                            </h1>
                                        </button>
                                        <div className="flex flex-grow flex-col">
                                            <h1 className="text-lg font-medium line-clamp-1">
                                                {request.title}
                                            </h1>
                                            <p className="mt-1 text-sm font-light text-gray-500 line-clamp-2">
                                                {request.description}
                                            </p>
                                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex flex-wrap items-center justify-start gap-2">
                                                    <p className="text-[11px] font-medium text-gray-600">
                                                        {request.fullName}
                                                    </p>
                                                    <p className="text-lg font-bold">
                                                        ·
                                                    </p>
                                                    <p className="text-[11px] font-light text-gray-600">
                                                        {request.date}
                                                    </p>
                                                    <p className="flex gap-2">
                                                        {request.topics.map(
                                                            (topic, index) => (
                                                                <Fragment
                                                                    key={topic}
                                                                >
                                                                    <p className="text-[11px] font-light text-gray-600">
                                                                        #{topic}
                                                                    </p>
                                                                </Fragment>
                                                            )
                                                        )}
                                                    </p>
                                                </div>
                                                <StatusBadge
                                                    portalData={portalData}
                                                    currentStatus={
                                                        request.status
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div className="mb-1 flex flex-none items-center justify-center gap-2 self-center sm:self-end">
                                            <ChatBubbleLeftIcon className="h-5 w-5   font-extralight text-gray-400" />
                                            <p className="text-[11px] font-light text-gray-500">
                                                {request.comments}
                                            </p>
                                        </div>
                                    </div>
                                </Fragment>
                            ))}
                        </div>
                    </section>
                </main>
            </div>
        </>
    );
}
