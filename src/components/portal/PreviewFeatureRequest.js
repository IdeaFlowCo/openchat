import { Fragment, useState } from "react";
import { Dialog, Transition, Tab } from "@headlessui/react";
import {
    PlusSmallIcon,
    ChevronUpIcon,
    ChatBubbleLeftIcon,
    XMarkIcon,
    PencilSquareIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";
import { PaperClipIcon } from "@heroicons/react/20/solid";
import StatusBadge from "components/atoms/StatusBadge";
import { useAuth } from "util/auth";
import {
    createUpvote,
    deleteUpvote,
    useUpvotesByFeedback,
    useCommentsByFeedback,
    createComment,
    updateComment,
    updateFeedback,
    deleteFeedback,
} from "util/db";
import Comment from "./Comment";
import { toast } from "react-hot-toast";
import FeedbackAdminPanel from "./FeedbackAdminPanel";
import AddIdea from "./AddIdea";

export const formatDateString = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleString("default", { month: "short" });
    const day = date.getDate();
    return `${day} ${month}`;
};

function PreviewFeatureRequest({ singleFeedback, portalData, checkAuth }) {
    const auth = useAuth();
    const [open, setOpen] = useState(false);
    const [usersComment, setUsersComment] = useState("");
    const [loading, setLoading] = useState(false);
    // console.log("singleFeedback", singleFeedback);
    // console.log("portalData", portalData);
    const { data: upvotesData, status: upvotesStatus } = useUpvotesByFeedback(
        singleFeedback.id
    );
    // console.log("upvotesData", upvotesData);

    const { data: commentsData, status: commentsStatus } =
        useCommentsByFeedback(singleFeedback.id);

    // console.log("commentsData", commentsData);
    const handleClickVote = (e) => {
        e.stopPropagation();

        const userLoggedIn = checkAuth();

        if (!userLoggedIn) return;

        const authUserUpvote = singleFeedback.upvotes.find(
            (upvote) => upvote.voter === auth.user.uid
        );
        if (authUserUpvote) {
            // console.log("authUserUpvote found", authUserUpvote);
            deleteUpvote({
                feedback_id: singleFeedback.id,
                upvote_id: authUserUpvote.id,
            });
        } else {
            // console.log("not found");
            createUpvote({
                feedback_id: singleFeedback.id,
                voter: auth.user.uid,
            });
        }
    };

    const handleAddComment = () => {
        if (usersComment.length === 0) {
            toast.error("Comment cannot be empty");
            return;
        }

        const userLoggedIn = checkAuth();

        if (!userLoggedIn) return;

        setLoading(true);
        const comment = createComment({
            feedback_id: singleFeedback.id,
            body: usersComment,
            commenter: auth.user.uid,
        });
        if (comment.length === 0) {
            alert("Error creating comment");
            return;
        }
        setUsersComment("");
        setLoading(false);
    };

    const handleDeleteFeedback = () => {
        // Alert user to confirm delete
        const confirmDelete = confirm(
            "Are you sure you want to delete this feedback?"
        );
        if (!confirmDelete) return;

        // Delete feedback
        deleteFeedback(singleFeedback.id);
        toast.success("Feedback deleted!");
        setOpen(false);
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
                                {formatDateString(singleFeedback.created_at)}
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
                            currentStatus={singleFeedback?.status}
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
                                    as={"div"}
                                    enter="transform transition ease-in-out duration-300 sm:duration-400"
                                    enterFrom="translate-x-full"
                                    enterTo="translate-x-0"
                                    leave="transform transition ease-in-out duration-300 sm:duration-400"
                                    leaveFrom="translate-x-0"
                                    leaveTo="translate-x-full"
                                    className="flex"
                                >
                                    <Dialog.Panel className="pointer-events-auto w-fit">
                                        <div className="flex h-full flex-col overflow-y-scroll bg-white">
                                            <div className="fixed right-0 px-4 py-6 sm:px-6 z-50">
                                                <div className="flex items-start justify-between">
                                                    <div />
                                                    <div className="relative ml-3 flex h-7 items-center">
                                                        <button
                                                            type="button"
                                                            className=" rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                            onClick={() => {
                                                                setOpen(false);
                                                            }}
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
                                            <div className="flex h-screen">
                                                {/* CONTENT OF SLIDEOVER */}
                                                {auth.user?.portal_id ===
                                                    portalData?.id && (
                                                    <FeedbackAdminPanel
                                                        feedbackData={
                                                            singleFeedback
                                                        }
                                                        portalData={portalData}
                                                    />
                                                )}
                                                <div className="relative flex w-screen max-w-2xl flex-1 flex-col gap-4 overflow-auto px-4 sm:px-10 pb-20">
                                                    <div className="mt-10 flex w-full gap-5 py-8 px-6 transition-all">
                                                        <button
                                                            onClick={(e) =>
                                                                handleClickVote(
                                                                    e
                                                                )
                                                            }
                                                            className="z-50 flex h-14 w-14 sm:h-16 sm:w-16 flex-none flex-col items-center justify-center rounded-lg border  hover:border-2"
                                                        >
                                                            <ChevronUpIcon className="-mb-1 h-5 w-5 text-gray-700" />
                                                            <h1 className=" text-xl">
                                                                {
                                                                    singleFeedback
                                                                        .upvotes
                                                                        ?.length
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
                                                                                .users
                                                                                ?.name
                                                                        }
                                                                    </p>
                                                                    <p className="text-lg font-bold">
                                                                        ·
                                                                    </p>
                                                                    <p className="text-[11px] font-light text-gray-600">
                                                                        {formatDateString(
                                                                            singleFeedback.created_at
                                                                        )}
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
                                                            {
                                                                // If user is creator of feedback, show edit and delete buttons
                                                                auth.user
                                                                    ?.uid ===
                                                                    singleFeedback.creator && (
                                                                    <div className="mt-4 flex gap-2 border-t pt-4">
                                                                        <AddIdea
                                                                            portalId={
                                                                                portalData?.id
                                                                            }
                                                                            checkAuth={
                                                                                checkAuth
                                                                            }
                                                                            editMode={
                                                                                true
                                                                            }
                                                                            feedbackData={
                                                                                singleFeedback
                                                                            }
                                                                        />
                                                                        <button
                                                                            onClick={() =>
                                                                                handleDeleteFeedback()
                                                                            }
                                                                            className="flex items-center justify-center gap-2 rounded-md bg-gray-100 px-3 py-2 hover:bg-gray-200"
                                                                        >
                                                                            <TrashIcon className="h-5 w-5 text-gray-500" />
                                                                            <p className="text-[11px] font-light text-gray-600">
                                                                                Delete
                                                                            </p>
                                                                        </button>
                                                                    </div>
                                                                )
                                                            }
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
                                                        <div className="relative min-w-0 flex-1 bg-gray-50">
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
                                                                    value={
                                                                        usersComment
                                                                    }
                                                                    className="block w-full resize-none border-0 bg-transparent p-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                                                                    placeholder="Add your comment..."
                                                                    onChange={(
                                                                        e
                                                                    ) =>
                                                                        setUsersComment(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        )
                                                                    }
                                                                    onKeyDown={(
                                                                        e
                                                                    ) => {
                                                                        if (
                                                                            e.key ===
                                                                            "Enter"
                                                                        ) {
                                                                            handleAddComment();
                                                                        }
                                                                    }}
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
                                                                        {/* <button
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
                                                                        </button> */}
                                                                    </div>
                                                                </div>
                                                                <div className="flex-shrink-0">
                                                                    <button
                                                                        type="submit"
                                                                        onClick={() =>
                                                                            handleAddComment()
                                                                        }
                                                                        disabled={
                                                                            loading
                                                                        }
                                                                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                                                    >
                                                                        {loading
                                                                            ? "..."
                                                                            : "Add Comment"}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* END TEXTAREA */}
                                                    {/* COMMENTS */}

                                                    <Tab.Group>
                                                        <Tab.List className="mt-5 flex gap-3">
                                                            <Tab className="outline-none">
                                                                {({
                                                                    selected,
                                                                }) => (
                                                                    /* Use the `selected` state to conditionally style the selected tab. */
                                                                    <div
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
                                                                    </div>
                                                                )}
                                                            </Tab>
                                                            <Tab className="outline-none">
                                                                {({
                                                                    selected,
                                                                }) => (
                                                                    /* Use the `selected` state to conditionally style the selected tab. */
                                                                    <div
                                                                        className={`text-sm font-light ring-0 focus:outline-none ${
                                                                            selected
                                                                                ? " text-indigo-600"
                                                                                : " text-gray-400"
                                                                        }`}
                                                                    >
                                                                        Voters
                                                                    </div>
                                                                )}
                                                            </Tab>
                                                        </Tab.List>
                                                        <Tab.Panels>
                                                            <Tab.Panel>
                                                                <div className="mt-5 space-y-6">
                                                                    {commentsData?.map(
                                                                        (
                                                                            comment
                                                                        ) => (
                                                                            <Comment
                                                                                key={
                                                                                    comment.id
                                                                                }
                                                                                comment={
                                                                                    comment
                                                                                }
                                                                                commentsData={
                                                                                    commentsData
                                                                                }
                                                                                checkAuth={
                                                                                    checkAuth
                                                                                }
                                                                            />
                                                                        )
                                                                    )}
                                                                </div>
                                                            </Tab.Panel>
                                                            <Tab.Panel>
                                                                <div className="mt-5 space-y-6">
                                                                    {upvotesData?.map(
                                                                        (
                                                                            upvote
                                                                        ) => (
                                                                            <div
                                                                                key={
                                                                                    upvote.id
                                                                                }
                                                                                className="flex items-center justify-start space-x-3"
                                                                            >
                                                                                <div className="flex-shrink-0">
                                                                                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-indigo-300 bg-indigo-100">
                                                                                        <h1 className="text-indigo-500 ">
                                                                                            {upvote.users?.name?.charAt(
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
                                                                                                    upvote
                                                                                                        .users
                                                                                                        ?.name
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
