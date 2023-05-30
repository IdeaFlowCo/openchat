import { Fragment, useState } from "react";
import { Dialog, Transition, Tab } from "@headlessui/react";
import {
    PlusSmallIcon,
    ChevronUpIcon,
    ChatBubbleLeftIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { PaperClipIcon } from "@heroicons/react/20/solid";
import StatusBadge from "components/atoms/StatusBadge";
import { useAuth } from "util/auth";
import { createUpvote, deleteUpvote } from "util/db";

const comments = [
    {
        id: 1,
        fullName: "Whitney Francis",
        date: "3 months ago",
        body: "I love this idea! I think this would be a great addition to the product.",
        likes: 4,
    },
    {
        id: 2,
        fullName: "Kristin Watson",
        date: "2 months ago",
        body: "I had this idea yesterday actually! I think it would be great to have this ability.",
        likes: 1,
    },
    {
        id: 3,
        fullName: "Alan Turing",
        date: "2 months ago",
        body: "I think this is a great idea and I think we should do it.",
        likes: 0,
    },
];

function PreviewFeatureRequest({ singleFeedback, portalData }) {
    const auth = useAuth();
    const [open, setOpen] = useState(false);
    console.log("singleFeedback", singleFeedback);
    console.log("portalData", portalData);
    const handleClickVote = (e) => {
        e.stopPropagation();
        const authUserUpvote = singleFeedback.upvotes.find(
            (upvote) => upvote.voter === auth.user.uid
        );
        if (
            authUserUpvote
        ) {
            console.log("authUserUpvote found", authUserUpvote);
            deleteUpvote({
                feedback_id: singleFeedback.id,
                upvote_id: authUserUpvote.id,
            });
        } else {
            console.log("not found");
            createUpvote({
                feedback_id: singleFeedback.id,
                voter: auth.user.uid,
            });
        }
    };
    return (
        <Fragment key={singleFeedback.id}>
            <div
                onClick={() => setOpen(true)}
                className=" flex w-full gap-5 border-b py-8 px-6 transition-all first:border-t hover:cursor-pointer hover:bg-gray-50/80"
            >
                <button
                    onClick={(e) => handleClickVote(e)}
                    className="z-50 flex h-16 w-16 flex-none flex-col items-center justify-center rounded-lg border  hover:border-2"
                >
                    <ChevronUpIcon className="-mb-1 h-5 w-5 text-gray-700" />
                    <h1 className=" text-xl">
                        {singleFeedback.upvotes.length}
                    </h1>
                </button>
                <div className="flex flex-grow flex-col">
                    <h1 className="text-lg font-medium line-clamp-1">
                        {singleFeedback.title}
                    </h1>
                    <p className="mt-1 text-sm font-light text-gray-500 line-clamp-2">
                        {singleFeedback.description}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center justify-start gap-2">
                            <p className="text-[11px] font-medium text-gray-600">
                                {singleFeedback.users?.name}
                            </p>
                            <p className="text-lg font-bold">·</p>
                            <p className="text-[11px] font-light text-gray-600">
                                {singleFeedback.date}
                            </p>
                            <div className="flex gap-2">
                                {singleFeedback.topics?.map((topic, index) => (
                                    <Fragment key={index}>
                                        <p className="whitespace-nowrap text-[11px] font-light text-gray-600">
                                            #{topic}
                                        </p>
                                    </Fragment>
                                ))}
                            </div>
                        </div>
                        <StatusBadge
                            portalData={portalData}
                            currentStatus={singleFeedback.status}
                        />
                    </div>
                </div>
                <div className="mb-1 flex flex-none items-center justify-center gap-2 self-center sm:self-end">
                    <ChatBubbleLeftIcon className="h-5 w-5 font-extralight text-gray-400" />
                    <p className="text-[11px] font-light text-gray-500">
                        {singleFeedback.comments}
                    </p>
                </div>
            </div>
            <Transition.Root show={open} as={Fragment}>
                <Dialog as="div" className="relative z-10" onClose={setOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-in-out duration-500"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in-out duration-500"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-hidden">
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
                                <Transition.Child
                                    as={Fragment}
                                    enter="transform transition ease-in-out duration-300 sm:duration-400"
                                    enterFrom="translate-x-full"
                                    enterTo="translate-x-0"
                                    leave="transform transition ease-in-out duration-300 sm:duration-400"
                                    leaveFrom="translate-x-0"
                                    leaveTo="translate-x-full"
                                >
                                    <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                                        <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                                            <div className="px-4 sm:px-6">
                                                <div className="flex items-start justify-between">
                                                    <div />
                                                    <div className="ml-3 flex h-7 items-center">
                                                        <button
                                                            type="button"
                                                            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                            onClick={() =>
                                                                setOpen(false)
                                                            }
                                                        >
                                                            <span className="sr-only">
                                                                Close panel
                                                            </span>
                                                            <XMarkIcon
                                                                className="h-6 w-6"
                                                                aria-hidden="true"
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="relative -mt-3 flex flex-1 flex-col gap-4 px-4 sm:px-10">
                                                {/* CONTENT OF SLIDEOVER */}
                                                <div className=" flex w-full gap-5 py-8 px-6 transition-all">
                                                    <button
                                                        onClick={(e) =>
                                                            handleClickVote(e)
                                                        }
                                                        className="z-50 flex h-16 w-16 flex-none flex-col items-center justify-center rounded-lg border  hover:border-2"
                                                    >
                                                        <ChevronUpIcon className="-mb-1 h-5 w-5 text-gray-700" />
                                                        <h1 className=" text-xl">
                                                            {
                                                                singleFeedback
                                                                    .upvotes?.length
                                                            }
                                                        </h1>
                                                    </button>
                                                    <div className="flex flex-grow flex-col">
                                                        <h1 className="text-lg font-medium">
                                                            {
                                                                singleFeedback.title
                                                            }
                                                        </h1>
                                                        <p className="mt-1 text-sm font-light text-gray-500">
                                                            {
                                                                singleFeedback.description
                                                            }
                                                        </p>
                                                        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                                            <div className="flex flex-wrap items-center justify-start gap-2">
                                                                <p className="text-[11px] font-medium text-gray-600">
                                                                    {
                                                                        singleFeedback
                                                                            .users?.name
                                                                    }
                                                                </p>
                                                                <p className="text-lg font-bold">
                                                                    ·
                                                                </p>
                                                                <p className="text-[11px] font-light text-gray-600">
                                                                    {
                                                                        singleFeedback.date
                                                                    }
                                                                </p>
                                                                <div className="flex gap-2">
                                                                    {singleFeedback.topics.map(
                                                                        (
                                                                            topic,
                                                                            index
                                                                        ) => (
                                                                            <Fragment
                                                                                key={
                                                                                    index
                                                                                }
                                                                            >
                                                                                <p className="text-[11px] font-light text-gray-600">
                                                                                    #
                                                                                    {
                                                                                        topic
                                                                                    }
                                                                                </p>
                                                                            </Fragment>
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <StatusBadge
                                                                portalData={
                                                                    portalData
                                                                }
                                                                currentStatus={
                                                                    singleFeedback.status
                                                                }
                                                            />
                                                        </div>
                                                    </div>
                                                    {/* <div className="mb-1 flex flex-none items-center justify-center gap-2 self-center sm:self-end">
                                                        <ChatBubbleLeftIcon className="h-5 w-5 font-extralight text-gray-400" />
                                                        <p className="text-[11px] font-light text-gray-500">
                                                            {request.comments}
                                                        </p>
                                                    </div> */}
                                                </div>
                                                {/* TEXTAREA */}
                                                <div className="flex items-start space-x-4">
                                                    {/* <div className="flex-shrink-0">
                                                        <img
                                                            className="inline-block h-10 w-10 rounded-full"
                                                            src="https://images.unsplash.com/photo-1550525811-e5869dd03032?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                                            alt=""
                                                        />
                                                    </div> */}
                                                    <div className="min-w-0 flex-1 bg-gray-50">
                                                        <form
                                                            action="#"
                                                            className="relative"
                                                        >
                                                            <div className="overflow-hidden rounded-lg border-[1px]">
                                                                <label
                                                                    htmlFor="comment"
                                                                    className="sr-only"
                                                                >
                                                                    Add your
                                                                    comment
                                                                </label>
                                                                <textarea
                                                                    rows={3}
                                                                    name="comment"
                                                                    id="comment"
                                                                    className="block w-full resize-none border-0 bg-transparent p-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                                                    placeholder="Add your comment..."
                                                                    defaultValue={
                                                                        ""
                                                                    }
                                                                />

                                                                {/* Spacer element to match the height of the toolbar */}
                                                                <div
                                                                    className="py-2"
                                                                    aria-hidden="true"
                                                                >
                                                                    {/* Matches height of button in toolbar (1px border + 36px content height) */}
                                                                    <div className="py-px">
                                                                        <div className="h-9" />
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="absolute inset-x-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
                                                                <div className="flex items-center space-x-5">
                                                                    <div className="flex items-center">
                                                                        <button
                                                                            type="button"
                                                                            className="-m-2.5 flex h-10 w-10 items-center justify-center rounded-full text-gray-400 hover:text-gray-500"
                                                                        >
                                                                            <PaperClipIcon
                                                                                className="h-5 w-5"
                                                                                aria-hidden="true"
                                                                            />
                                                                            <span className="sr-only">
                                                                                Attach
                                                                                a
                                                                                file
                                                                            </span>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-shrink-0">
                                                                    <button
                                                                        type="submit"
                                                                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                                                    >
                                                                        Add
                                                                        comment
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </form>
                                                    </div>
                                                </div>
                                                {/* END TEXTAREA */}
                                                {/* COMMENTS */}

                                                <Tab.Group>
                                                    <Tab.List className="mt-5 flex gap-3">
                                                        <Tab className="outline-none">
                                                            {({ selected }) => (
                                                                /* Use the `selected` state to conditionally style the selected tab. */
                                                                <button
                                                                    className={`text-sm font-light ${
                                                                        selected
                                                                            ? " text-indigo-600"
                                                                            : " text-gray-500"
                                                                    }`}
                                                                >
                                                                    {
                                                                        singleFeedback.comments
                                                                    }{" "}
                                                                    Comments
                                                                </button>
                                                            )}
                                                        </Tab>
                                                        <Tab className="outline-none">
                                                            {({ selected }) => (
                                                                /* Use the `selected` state to conditionally style the selected tab. */
                                                                <button
                                                                    className={`text-sm font-light ring-0 focus:outline-none ${
                                                                        selected
                                                                            ? " text-indigo-600"
                                                                            : " text-gray-400"
                                                                    }`}
                                                                >
                                                                    Voters
                                                                </button>
                                                            )}
                                                        </Tab>
                                                    </Tab.List>
                                                    <Tab.Panels>
                                                        <Tab.Panel>
                                                            <div className="mt-5 space-y-6">
                                                                {comments.map(
                                                                    (
                                                                        comment
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                comment.id
                                                                            }
                                                                            className="flex space-x-3"
                                                                        >
                                                                            <div className="flex-shrink-0">
                                                                                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-indigo-300 bg-indigo-100">
                                                                                    <h1 className="text-indigo-500 ">
                                                                                        {comment.fullName.charAt(
                                                                                            0
                                                                                        )}
                                                                                    </h1>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                                                                <div>
                                                                                    <div className="text-sm">
                                                                                        <a
                                                                                            href="#"
                                                                                            className="font-medium text-gray-900"
                                                                                        >
                                                                                            {
                                                                                                comment.fullName
                                                                                            }
                                                                                        </a>
                                                                                    </div>
                                                                                </div>
                                                                                <div className=" ">
                                                                                    <p className="text-sm font-light text-gray-500">
                                                                                        {
                                                                                            comment.body
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                                <div className="mt-1 flex items-center justify-start gap-1.5">
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() =>
                                                                                            handleThumbsUpComment(
                                                                                                comment.id
                                                                                            )
                                                                                        }
                                                                                    >
                                                                                        <svg
                                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                                            fill="none"
                                                                                            viewBox="0 0 24 24"
                                                                                            strokeWidth={
                                                                                                1
                                                                                            }
                                                                                            stroke="currentColor"
                                                                                            className="h-4 w-4 text-gray-700 hover:text-indigo-600"
                                                                                        >
                                                                                            <path
                                                                                                strokeLinecap="round"
                                                                                                strokeLinejoin="round"
                                                                                                d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z"
                                                                                            />
                                                                                        </svg>
                                                                                    </button>

                                                                                    <p className="text-[11px] font-light text-gray-500">
                                                                                        {
                                                                                            comment.likes
                                                                                        }{" "}
                                                                                        {comment.likes ===
                                                                                        1
                                                                                            ? "Like"
                                                                                            : "Likes"}
                                                                                    </p>
                                                                                    <p className="text-2xl text-gray-500">
                                                                                        ·
                                                                                    </p>
                                                                                    <p className="text-[11px] font-light text-gray-500">
                                                                                        {
                                                                                            comment.date
                                                                                        }
                                                                                    </p>
                                                                                    <button
                                                                                        type="button"
                                                                                        className="text-[11px] font-light text-gray-500 underline hover:text-indigo-600"
                                                                                    >
                                                                                        Reply
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        </Tab.Panel>
                                                        <Tab.Panel>
                                                            <div className="mt-5 space-y-6">
                                                                {comments.map(
                                                                    (
                                                                        comment
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                comment.id
                                                                            }
                                                                            className="flex items-center justify-start space-x-3"
                                                                        >
                                                                            <div className="flex-shrink-0">
                                                                                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-indigo-300 bg-indigo-100">
                                                                                    <h1 className="text-indigo-500 ">
                                                                                        {comment.fullName.charAt(
                                                                                            0
                                                                                        )}
                                                                                    </h1>
                                                                                </div>
                                                                            </div>
                                                                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                                                                <div>
                                                                                    <div className="text-sm">
                                                                                        <a
                                                                                            href="#"
                                                                                            className="font-medium text-gray-900"
                                                                                        >
                                                                                            {
                                                                                                comment.fullName
                                                                                            }
                                                                                        </a>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        </Tab.Panel>
                                                    </Tab.Panels>
                                                </Tab.Group>
                                                {/* END COMMENTS */}
                                            </div>
                                            {/* END CONTENT OF SLIDEOVER */}
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </Fragment>
    );
}

export default PreviewFeatureRequest;
