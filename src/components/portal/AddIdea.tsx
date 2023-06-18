import { Fragment, useState, useRef, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
    PlusSmallIcon,
    ChevronUpIcon,
    PencilSquareIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import StatusBadge from "components/atoms/StatusBadge";
import { useForm } from "react-hook-form";
import { createFeedback, updateFeedback } from "util/db";
import { useAuth } from "util/auth";
import Spinner from "components/atoms/Spinner";
import AnswerDeepform from "../old/AnswerDeepform";
import FollowupQuestions from "./FollowupQuestions";
import { toast } from "react-hot-toast";

const classNames = (...classes) => {
    return classes.filter(Boolean).join(" ");
};
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

function AddIdea({
    portalId,
    checkAuth = () => true,
    editMode = false,
    onboardingMode = false,
    feedbackData = null,
    disableFixed = false,
    followupQuestions = true,
}) {
    const auth = useAuth();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [failedSubmitNoAuth, setFailedSubmitNoAuth] = useState(false);
    const [formAlert, setFormAlert] = useState(null);
    // Want to keep track of how many topics are selected. Only 3 or less allowed
    const [numTopicsSelected, setNumTopicsSelected] = useState(
        editMode ? feedbackData.topics.length : 0
    );

    // Followup State
    const [showFollowup, setShowFollowup] = useState(false);
    const [submittedFeedbackId, setSubmittedFeedbackId] = useState<number>();

    const cancelButtonRef = useRef(null);

    const { register, handleSubmit, errors } = useForm();

    // console.log("feedbackData", feedbackData)
    const onSubmit = (data) => {
        // Check if user is logged in. If they aren't, show the AuthModal.
        const isLoggedIn = checkAuth();
        if (!isLoggedIn) {
            setFailedSubmitNoAuth(true);
            return;
        }

        setLoading(true);

        console.log("data", data);
        console.log("feedbackData", feedbackData);
        // Check if the title, description, or statuses even changed before updating
        if (
            editMode &&
            feedbackData.title === data.title &&
            feedbackData.description === data.description &&
            JSON.stringify(feedbackData.topics) == JSON.stringify(data.topics)
        ) {
            console.log("no changes");
            setLoading(false);
            setOpen(false);
            return;
        }

        // console.log("data", data);
        const query = editMode
            ? updateFeedback(feedbackData.id, data)
            : createFeedback(
                  {
                      creator: auth.user.uid,
                      portal_id: portalId,
                      ...data,
                  },
                  // Don't send email in onboarding mode
                  onboardingMode ? false : true
              );
        console.log("query", query);
        query
            .then((value) => {
                console.log("value", value);
                toast.success("Feedback submitted successfully!");

                // Show followup questions if they are enabled
                if (followupQuestions && value.id) {
                    setSubmittedFeedbackId(value.id);
                    setLoading(false);
                    setShowFollowup(true);
                } else {
                    setLoading(false);
                    setOpen(false);
                }
            })
            .catch((error) => {
                console.log("error", error);
                setLoading(false);
                setShowFollowup(false);
                setFormAlert({
                    type: "error",
                    message: error.message,
                });
            });
    };

    useEffect(() => {
        if (auth.user && failedSubmitNoAuth) {
            setFailedSubmitNoAuth(false);
            document
                .getElementById("addIdeaForm")
                .dispatchEvent(
                    new Event("submit", { cancelable: true, bubbles: true })
                );
        }
    }, [auth.user, failedSubmitNoAuth]);

    //TODO: IN PROGRESS DEBUGGING WEIRD STACKED MODALS PROBLEM FOR AUTHMODAL + ADDIDEA
    return (
        <div>
            {editMode ? (
                <button
                    onClick={() => setOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-md bg-gray-100 px-3 py-2 hover:bg-gray-200"
                >
                    <PencilSquareIcon className="h-5 w-5 text-gray-500" />
                    <p className="text-[11px] font-light text-gray-600">Edit</p>
                </button>
            ) : (
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className={classNames(
                        !disableFixed ? "fixed bottom-5 right-5" : "",
                        "text-md flex h-fit w-fit items-center justify-center gap-[2px] whitespace-nowrap rounded-md bg-indigo-600 px-3.5 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:static sm:flex"
                    )}
                    // className="text-md fixed bottom-5 right-5 mt-2 flex h-fit w-fit items-center justify-center gap-[2px] whitespace-nowrap rounded-md bg-indigo-600 px-3.5 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:static sm:flex"
                >
                    <PlusSmallIcon className="-ml-2 h-5 w-5" />
                    Add an Idea
                </button>
            )}


            <Transition.Root show={open} as={Fragment}>
                <Dialog
                    as="div"
                    className="relative z-10 bg-green-400"
                    onClick={(e) => {
                        console.log("Exit AddIdea")}}
                    onClose={() => {
                        setShowFollowup(false);
                        setOpen(false);
                    }}
                >
                    <Transition.Child
                        as={Fragment}
                        enter="ease-in-out duration-500"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in-out duration-500"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity -z-10"/>
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-hidden">
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
                                {!showFollowup && (
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
                                                                    setOpen(
                                                                        false
                                                                    )
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
                                                <div className="relative -mt-3 flex flex-1 flex-col gap-10 px-4 sm:px-10">
                                                    {/* CONTENT OF SLIDEOVER */}
                                                    <h1 className="font-satoshi text-2xl font-medium tracking-tight text-gray-900 md:text-3xl">
                                                        {editMode
                                                            ? "Edit Idea"
                                                            : "Tell us about your idea!"}
                                                    </h1>
                                                    {formAlert && (
                                                        <div className="mb-4 text-red-600">
                                                            {formAlert.message}
                                                        </div>
                                                    )}
                                                    <form
                                                        onSubmit={handleSubmit(
                                                            onSubmit
                                                        )}
                                                        id={`addIdeaForm`}
                                                        className="flex flex-col gap-4 "
                                                    >
                                                        <div className="flex flex-col gap-4">
                                                            <label
                                                                htmlFor="title"
                                                                hidden
                                                                className="text-sm font-medium text-gray-900"
                                                            >
                                                                Title
                                                            </label>
                                                            <input
                                                                type="text"
                                                                name="title"
                                                                id="title"
                                                                placeholder="One sentence that summarizes your idea"
                                                                className="block w-full rounded-md border-gray-200 placeholder:opacity-70 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                                ref={register({
                                                                    required:
                                                                        "Please enter a title for this feedback.",
                                                                })}
                                                                defaultValue={
                                                                    editMode
                                                                        ? feedbackData.title
                                                                        : ""
                                                                }
                                                            />

                                                            <label
                                                                htmlFor="description"
                                                                hidden
                                                                className="text-sm font-medium text-gray-900"
                                                            >
                                                                Description
                                                            </label>
                                                            <textarea
                                                                id="description"
                                                                name="description"
                                                                rows={8}
                                                                placeholder="What problem does this idea solve, who benefits, and how should it work?"
                                                                className="block w-full rounded-md border-gray-200 placeholder:opacity-70 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                                ref={register({
                                                                    required:
                                                                        "Please enter a description for your feedback.",
                                                                })}
                                                                defaultValue={
                                                                    editMode
                                                                        ? feedbackData.description
                                                                        : ""
                                                                }
                                                            />
                                                            {errors.name && (
                                                                <p className="mt-1 text-left text-sm text-red-600">
                                                                    {
                                                                        errors
                                                                            .name
                                                                            .message
                                                                    }
                                                                </p>
                                                            )}

                                                            <label
                                                                htmlFor="topics"
                                                                className="text-sm font-light text-gray-500"
                                                            >
                                                                Choose up to 3
                                                                Topics for this
                                                                Idea (optional)
                                                            </label>
                                                            <fieldset className="flex flex-wrap gap-2">
                                                                {topics.map(
                                                                    (
                                                                        topic,
                                                                        index
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="flex items-center gap-2"
                                                                        >
                                                                            <label
                                                                                htmlFor={
                                                                                    topic
                                                                                }
                                                                                className="flex items-center justify-center gap-2 rounded-md border px-2 py-1 text-sm font-light text-gray-600 "
                                                                            >
                                                                                <input
                                                                                    type="checkbox"
                                                                                    name="topics"
                                                                                    id={
                                                                                        topic
                                                                                    }
                                                                                    value={
                                                                                        topic
                                                                                    }
                                                                                    className=" h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 "
                                                                                    ref={register()}
                                                                                    defaultChecked={
                                                                                        editMode
                                                                                            ? feedbackData.topics.includes(
                                                                                                  topic
                                                                                              )
                                                                                            : false
                                                                                    }
                                                                                />
                                                                                {
                                                                                    topic
                                                                                }
                                                                            </label>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </fieldset>

                                                            <div className="flex gap-2 self-end">
                                                                <button
                                                                    type="button"
                                                                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                                                                    onClick={() =>
                                                                        setOpen(
                                                                            false
                                                                        )
                                                                    }
                                                                    ref={
                                                                        cancelButtonRef
                                                                    }
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button
                                                                    type="submit"
                                                                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                                                                    disabled={
                                                                        loading
                                                                    }
                                                                >
                                                                    {loading ? (
                                                                        <Spinner small={true}/>
                                                                    ) : (
                                                                        "Submit"
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                                {/* END CONTENT OF SLIDEOVER */}
                                            </div>
                                        </Dialog.Panel>
                                    </Transition.Child>
                                )}

                                {showFollowup && submittedFeedbackId && (
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
                                            <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 px-4 shadow-xl sm:px-6">
                                                <div className="px-4 sm:px-6">
                                                    <div className="flex items-start justify-between">
                                                        <div />
                                                        <div className="ml-3 flex h-7 items-center">
                                                            <button
                                                                type="button"
                                                                className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                                                onClick={() =>
                                                                    setOpen(
                                                                        false
                                                                    )
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
                                                {/* <div className="relative flex flex-1 flex-col gap-10 px-4 sm:px-10 b"> */}
                                                {/* CONTENT OF SLIDEOVER */}
                                                <FollowupQuestions
                                                    feedbackId={
                                                        submittedFeedbackId
                                                    }
                                                />
                                                {/* END CONTENT OF SLIDEOVER */}
                                                {/* </div> */}
                                            </div>
                                        </Dialog.Panel>
                                    </Transition.Child>
                                )}
                            </div>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </div>
    );
}

export default AddIdea;
