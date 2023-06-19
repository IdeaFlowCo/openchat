import { Fragment, useState, useEffect, useRef } from "react";
import { Dialog, Transition, Menu, Popover } from "@headlessui/react";
import {
    PlusSmallIcon,
    ChevronUpIcon,
    ChatBubbleLeftIcon,
    CheckIcon,
} from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import StatusBadge from "components/atoms/StatusBadge";
import PreviewFeatureRequest from "./PreviewFeatureRequest";
import AddIdea from "./AddIdea";
import { useFeedbackByPortal } from "util/db";
import { useAuth } from "util/auth";
import AuthModal from "./AuthModal";
import { useRouter } from "next/router";

const topics = [
    "New Feature Request ✨",
    "Bug Report 🐞",
    "User Interface & Design 🎨",
    "API & Development 🌐",
    "Third-Party Integrations 🔗",
    "Data & Analytics 📊",
    "Mobile Experience 📱",
    "Customer Support Experience 🙋‍♀️",
    "Performance & Speed 🚀",
    "Security & Privacy 🔒",
    "Documentation & Guides 📚",
    "Billing & Pricing 💰",
];

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

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function PortalFeatureRequests({ portalData }) {
    const router = useRouter();
    const auth = useAuth();
    const [statusesFilterList, setStatusesFilterList] = useState([]);
    const [topicsFilterList, setTopicsFilterList] = useState([]);
    const [userIsAdmin, setUserIsAdmin] = useState(
        auth.user?.portal_id === portalData?.id
    );
    const ref = useRef(null);
    const {
        data: feedback,
        status: feedbackStatus,
        refetch,
    } = useFeedbackByPortal(
        portalData?.id,
        statusesFilterList,
        topicsFilterList
    );
    // console.log("feedback", feedback)

    useEffect(() => {
        if (auth.user?.portal_id === portalData?.id) {
            setUserIsAdmin(true);
        } else {
            setUserIsAdmin(false);
        }
    }, [auth.user?.portal_id, portalData?.id]);

    // TODO: someday add URL params
    useEffect(() => {
        if (!portalData) {
            return;
        }
        // if (statusesFilterList.length > 0 || topicsFilterList.length > 0) {
        //     router.push(
        //         `/portal/${portalData?.id}?statuses=${statusesFilterList.join(
        //             ","
        //         )}&topics=${topicsFilterList.join(",")}`,
        //         undefined,
        //         { shallow: true }
        //     );
        // } else {
        //     router.push(`/portal/${portalData?.id}`, undefined, {
        //         shallow: true,
        //     });
        // }

        // Refetch
        refetch();
    }, [statusesFilterList, topicsFilterList]);

    if (!portalData) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <div className="h-32 w-32 animate-spin rounded-full border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }
    return (
        <>
            {/* Sidebar component, swap this element with another sidebar if you like */}
            <Transition
                as="ul"
                role="list"
                appear={true}
                show={true}
                enter="transition ease-out duration-500"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-100 translate-y-1"
                className="fixed hidden h-[calc(100vh-65px)] grow flex-col items-center gap-y-5 overflow-y-auto border-r border-gray-200 lg:flex lg:w-52 lg:flex-col lg:justify-between lg:py-6 xl:w-64"
            >
                {/* <nav className="mt-10 flex flex-1 flex-col b"> */}
                {/* <ul role="list" className="flex flex-1 flex-col "> */}
                <li className="w-full ">
                    <ul
                        role="list"
                        className="max-h-[75vh] w-full space-y-1 overflow-scroll"
                    >
                        {/* <div className=" mt-2 divide-y divide-gray-200 px-2 b"> */}
                        <div className="py-1">
                            <p className="px-10 py-3 text-[11px] text-gray-400">
                                Statuses
                            </p>
                            {portalData?.statuses.map((status) => (
                                <button
                                    className={classNames(
                                        "flex w-full overflow-scroll whitespace-nowrap px-10 py-3.5 text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                    )}
                                    onClick={() => {
                                        if (
                                            statusesFilterList.includes(
                                                status.name
                                            )
                                        ) {
                                            setStatusesFilterList(
                                                statusesFilterList.filter(
                                                    (item) =>
                                                        item !== status.name
                                                )
                                            );
                                        } else {
                                            setStatusesFilterList([
                                                ...statusesFilterList,
                                                status.name,
                                            ]);
                                        }
                                    }}
                                    key={status.name}
                                >
                                    {/* <span className="mr-1 text-gray-400">
                                                                    ·
                                                                </span> */}
                                    <p className="truncate">{status?.name}</p>

                                    {statusesFilterList.includes(
                                        status.name
                                    ) && (
                                        <CheckIcon className="ml-auto h-4 w-4 text-green-500" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="py-1">
                            <p className="px-10 py-3 text-[11px] text-gray-400">
                                Topics
                            </p>
                            {topics &&
                                topics?.map((topic) => (
                                    <button
                                        className={classNames(
                                            "flex w-full overflow-scroll whitespace-nowrap px-10 py-4 text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                        )}
                                        onClick={() => {
                                            if (
                                                topicsFilterList.includes(topic)
                                            ) {
                                                setTopicsFilterList(
                                                    topicsFilterList.filter(
                                                        (item) => item !== topic
                                                    )
                                                );
                                            } else {
                                                setTopicsFilterList([
                                                    ...topicsFilterList,
                                                    topic,
                                                ]);
                                            }
                                        }}
                                        key={topic}
                                    >
                                        <span className="mr-1 text-gray-400">
                                            #
                                        </span>
                                        <p className=" truncate">{topic}</p>

                                        {topicsFilterList.includes(topic) && (
                                            <CheckIcon className="ml-auto h-4 w-4 text-green-500" />
                                        )}
                                    </button>
                                ))}
                        </div>
                        {/* </div> */}
                        {/* {oldNav.map((item) => (
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
                        ))} */}
                    </ul>
                </li>
                <li className="">
                    <a
                        href="/"
                        target="_blank"
                        className="mt-2 whitespace-nowrap py-2 px-4 text-center text-sm"
                    >
                        Powered by{" "}
                        <span className=" font-medium text-indigo-600">
                            Deepform
                        </span>
                    </a>
                </li>
                {/* </ul> */}
                {/* </nav> */}
            </Transition>
            <main className="flex h-fit w-screen items-center justify-center py-6 px-4 sm:py-8 lg:ml-52 lg:py-10 xl:ml-72">
                {/* <Transition
                as="main"
                appear={true}
                show={true}
                enter="transition ease-out duration-500 delay-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-100 translate-y-1"
                className="b flex h-fit w-screen items-center justify-center py-6 px-4 sm:py-8 lg:ml-52 lg:py-10 xl:ml-72"
            > */}
                <section className="flex w-full max-w-3xl flex-col gap-4 lg:w-5/6 ">
                    <div className="flex justify-between px-2 md:px-10">
                        <div className="flex flex-col gap-4">
                            <h1 className="font-satoshi text-3xl font-medium tracking-tight text-gray-900 md:text-4xl">
                                {portalData?.portal_name
                                    ? portalData.portal_name
                                    : ""}{" "}
                                Feature Requests
                            </h1>
                            <p className="text-gray-500">
                                Feature suggestions for{" "}
                                {portalData?.portal_name
                                    ? portalData.portal_name
                                    : "our product!"}{" "}
                                💡
                            </p>
                        </div>
                        <AddIdea
                            portalId={portalData?.id}
                            // checkAuth={checkAuth}
                        />
                    </div>
                    <div className="flex items-center justify-between -mt-2">
                        <div />
                        <div>
                            <Menu
                                as="div"
                                className="relative inline-block text-left"
                            >
                                <div>
                                    <Menu.Button
                                        ref={ref}
                                        className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                    >
                                        Filters
                                        <ChevronDownIcon
                                            className="-mr-1 h-5 w-5 text-gray-400"
                                            aria-hidden="true"
                                        />
                                    </Menu.Button>
                                </div>

                                <Transition
                                    as={Fragment}
                                    enter="transition ease-out duration-100"
                                    enterFrom="transform opacity-0 scale-95"
                                    enterTo="transform opacity-100 scale-100"
                                    leave="transition ease-in duration-75 delay-100"
                                    leaveFrom="transform opacity-100 scale-100"
                                    leaveTo="transform opacity-0 scale-95"
                                >
                                    <Menu.Items className="absolute right-0 z-10 mt-2 max-h-96 w-56 origin-top-right divide-y divide-gray-200 overflow-scroll rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                        <div className="py-1">
                                            {portalData?.statuses.map(
                                                (status) => (
                                                    <Menu.Item
                                                        key={status.name}
                                                        as={"div"}
                                                        onClick={() => {
                                                            setTimeout(() => {
                                                                ref.current?.click();
                                                            }, 0);
                                                        }}
                                                    >
                                                        {({ active }) => (
                                                            <button
                                                                className={classNames(
                                                                    active
                                                                        ? "bg-gray-100 text-gray-900"
                                                                        : "text-gray-700",
                                                                    "flex w-full overflow-scroll whitespace-nowrap px-4 py-2 text-sm"
                                                                )}
                                                                onClick={() => {
                                                                    if (
                                                                        statusesFilterList.includes(
                                                                            status.name
                                                                        )
                                                                    ) {
                                                                        setStatusesFilterList(
                                                                            statusesFilterList.filter(
                                                                                (
                                                                                    item
                                                                                ) =>
                                                                                    item !==
                                                                                    status.name
                                                                            )
                                                                        );
                                                                    } else {
                                                                        setStatusesFilterList(
                                                                            [
                                                                                ...statusesFilterList,
                                                                                status.name,
                                                                            ]
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                {/* <span className="mr-1 text-gray-400">
                                                                    ·
                                                                </span> */}
                                                                <p className="truncate">
                                                                    {
                                                                        status?.name
                                                                    }
                                                                </p>

                                                                {statusesFilterList.includes(
                                                                    status.name
                                                                ) && (
                                                                    <CheckIcon className="ml-auto h-5 w-5 text-green-500" />
                                                                )}
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                )
                                            )}
                                        </div>

                                        <div className="py-1">
                                            {topics &&
                                                topics?.map((topic) => (
                                                    <Menu.Item
                                                        key={topic}
                                                        as={"div"}
                                                        onClick={() => {
                                                            setTimeout(() => {
                                                                ref.current?.click();
                                                            }, 0);
                                                        }}
                                                    >
                                                        {({ active }) => (
                                                            <button
                                                                className={classNames(
                                                                    active
                                                                        ? "bg-gray-100 text-gray-900"
                                                                        : "text-gray-700",
                                                                    "flex w-full overflow-scroll whitespace-nowrap px-4 py-2 text-sm"
                                                                )}
                                                                onClick={() => {
                                                                    if (
                                                                        topicsFilterList.includes(
                                                                            topic
                                                                        )
                                                                    ) {
                                                                        setTopicsFilterList(
                                                                            topicsFilterList.filter(
                                                                                (
                                                                                    item
                                                                                ) =>
                                                                                    item !==
                                                                                    topic
                                                                            )
                                                                        );
                                                                    } else {
                                                                        setTopicsFilterList(
                                                                            [
                                                                                ...topicsFilterList,
                                                                                topic,
                                                                            ]
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                <span className="mr-1 text-gray-400">
                                                                    #
                                                                </span>
                                                                <p className=" truncate">
                                                                    {topic}
                                                                </p>

                                                                {topicsFilterList.includes(
                                                                    topic
                                                                ) && (
                                                                    <CheckIcon className="ml-auto h-5 w-5 text-green-500" />
                                                                )}
                                                            </button>
                                                        )}
                                                    </Menu.Item>
                                                ))}
                                            {/* <Menu.Item>
                                                {({ active }) => (
                                                    <a
                                                        href="#"
                                                        className={classNames(
                                                            active
                                                                ? "bg-gray-100 text-gray-900"
                                                                : "text-gray-700",
                                                            "block px-4 py-2 text-sm"
                                                        )}
                                                    >
                                                        Edit
                                                    </a>
                                                )}
                                            </Menu.Item>
                                            <Menu.Item>
                                                {({ active }) => (
                                                    <a
                                                        href="#"
                                                        className={classNames(
                                                            active
                                                                ? "bg-gray-100 text-gray-900"
                                                                : "text-gray-700",
                                                            "block px-4 py-2 text-sm"
                                                        )}
                                                    >
                                                        Duplicate
                                                    </a>
                                                )}
                                            </Menu.Item> */}
                                        </div>
                                    </Menu.Items>
                                </Transition>
                            </Menu>
                        </div>
                    </div>

                    <div>
                        {feedback?.map((singleFeedback) => (
                            <PreviewFeatureRequest
                                key={singleFeedback.id}
                                singleFeedback={singleFeedback}
                                portalData={portalData}
                            />
                        ))}
                    </div>
                </section>
                {/* </Transition> */}
            </main>
        </>
    );
}
