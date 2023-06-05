import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
    PlusSmallIcon,
    ChevronUpIcon,
    ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import StatusBadge from "components/atoms/StatusBadge";
import PreviewFeatureRequest from "./PreviewFeatureRequest";
import AddIdea from "./AddIdea";
import { useFeedbackByPortal } from "util/db";
import { useAuth } from "util/auth";
import AuthModal from "./AuthModal";
import { useRouter } from "next/router";

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
    const [openAuthModal, setOpenAuthModal] = useState(false);
    const [userIsAdmin, setUserIsAdmin] = useState(
        auth.user?.portal_id === portalData?.id
    );
    const { data: feedback, status: feedbackStatus } = useFeedbackByPortal(
        portalData?.id
    );
    // console.log("feedback", feedback)

    const checkAuth = () => {
        // Check if user is logged in. If they aren't, show the AuthModal.
        if (!auth.user) {
            setOpenAuthModal(true);
            return false;
        }
        setOpenAuthModal(false);
        return true;
    };

    useEffect(() => {
        if (auth.user?.portal_id === portalData?.id) {
            setUserIsAdmin(true);
        } else {
            setUserIsAdmin(false);
        }
    }, [auth.user?.portal_id, portalData?.id]);

    if (!portalData) {
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }
    return (
        <>
            {/* Sidebar component, swap this element with another sidebar if you like */}
            <ul
                role="list"
                className="fixed hidden h-[calc(100vh-65px)] grow flex-col items-center gap-y-5 overflow-y-auto border-r border-gray-200 px-6 lg:flex lg:w-52 lg:flex-col lg:justify-between lg:py-6 xl:w-72"
            >
                {/* <nav className="mt-10 flex flex-1 flex-col b"> */}
                {/* <ul role="list" className="flex flex-1 flex-col "> */}
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
                <li className="">
                    <a href="/" target="_blank" className="mt-2 py-2 px-4 text-sm text-center whitespace-nowrap">
                        Powered by <span className="font-bold">Deepform</span>
                    </a>
                </li>
                {/* </ul> */}
                {/* </nav> */}
            </ul>
            <main className="flex h-fit w-screen items-center justify-center py-6 px-4 sm:py-8 lg:ml-52 lg:py-10 xl:ml-72">
                <section className="flex w-full max-w-3xl flex-col gap-12 lg:w-5/6 ">
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
                            checkAuth={checkAuth}
                        />
                    </div>
                    <div>
                        {feedback?.map((singleFeedback) => (
                            <PreviewFeatureRequest
                                key={singleFeedback.id}
                                singleFeedback={singleFeedback}
                                portalData={portalData}
                                checkAuth={checkAuth}
                            />
                        ))}
                    </div>
                </section>
            </main>
            {openAuthModal && (
                <AuthModal open={openAuthModal} setOpen={setOpenAuthModal} />
            )}
        </>
    );
}
