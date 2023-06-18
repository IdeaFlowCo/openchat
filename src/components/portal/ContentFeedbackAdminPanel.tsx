import React, { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { updateFeedback } from "util/db";
import { toast } from "react-hot-toast";
import {
    TrashIcon,
    PlusSmallIcon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { deleteFeedback, getUser } from "util/db";
import { GeneralEmailTemplateProps } from "types/emailTypes";
import { getFirstName } from "util/string";

const classNames = (...classes) => {
    return classes.filter(Boolean).join(" ");
};

export default function ContentFeedbackAdminPanel({
    feedbackData,
    portalData,
}) {
    const [loading, setLoading] = useState(false);
    // console.log("feedbackData", feedbackData);
    const handleChangeStatus = (statusName) => {
        setLoading(true);
        // Update feedback status
        updateFeedback(feedbackData.id, {
            status: statusName,
        });
        // Email the user who submitted the feedback that
        // their feedback has been updated

        // First get the user from feedbackData.creator
        getUser(feedbackData.creator).then((user) => {
            console.log("user", user);
            // Send email to user
            const { name, email } = user;
            const capitalizedFirstName = getFirstName(name);
            // Send email
            const generalEmailData: GeneralEmailTemplateProps = {
                // Required
                to: email,
                from: "Deepform <alan@deepform.ai>",
                subject: `Deepform: Your idea's status has been updated!`,
                plainText: `Hi ${
                    capitalizedFirstName ? capitalizedFirstName + "," : "there,"
                }, your idea's status has been updated to "${statusName}"!
                Please login to the portal to view it. Idea Title: ${
                    feedbackData.title
                } Preview: ${feedbackData.description.slice(
                    0,
                    100
                )}... Status change: ${feedbackData.status} -> ${statusName}`,
                previewText: `Deepform: Your idea's status has been updated!`,
                p1Content: `Your idea's status has been updated to "${statusName}"! Click the link below to view the portal. `,

                // Optional
                userFirstName: capitalizedFirstName,
                p2Content: `Idea Title: ${feedbackData.title}`,
                p3Content: `Preview: ${feedbackData.description.slice(
                    0,
                    100
                )}...`,
                p4Content: `Status change: ${
                    feedbackData.status ? feedbackData.status : "None"
                } -> ${statusName}`,
                closingLine: capitalizedFirstName
                    ? `Have an awesome day, ${capitalizedFirstName}!`
                    : `Have an awesome day!`,
                ctaLink: `https://deepform.ai/portal/${feedbackData.portal_id}`,
                ctaText: `View Portal`,
            };

            // Send email
            fetch("/api/email/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(generalEmailData),
            });

            setLoading(false);
            toast.success(
                `Status updated to "${statusName}"! Emailed ${capitalizedFirstName}.`
            );
        });
    };

    const handleDeleteFeedback = () => {
        // Alert user to confirm delete
        const confirmDelete = confirm(
            "Are you sure you want to delete this feedback?"
        );
        if (!confirmDelete) return;
        setLoading(true);
        // Delete feedback
        deleteFeedback(feedbackData?.id);
        toast.success("Feedback deleted!");
        setLoading(false);
    };

    return (
        <>
            <div
                className={classNames(
                    "pointer-events-auto fixed inset-0 z-[100] h-full w-screen max-w-[18rem] overflow-hidden border-r bg-gray-50 lg:static"
                )}
            >
                <div className="flex h-full flex-col justify-between gap-3 overflow-y-scroll px-4 pt-10 sm:px-8">
                    <div className="flex flex-col gap-4">
                        <h1 className="border-b pb-4 font-satoshi text-xl font-medium tracking-tight text-gray-900 md:text-2xl">
                            Admin
                        </h1>
                        <div className="flex items-center justify-start gap-2">
                            {/* <h2 className="text-lg text-gray-900">Status</h2> */}
                            <div className="">
                                <div className="flex gap-2">
                                    {/* <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="h-6 w-6 opacity-40"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg> */}
                                    <label className="text-base font-semibold text-gray-900">
                                        Status
                                    </label>
                                </div>

                                <fieldset className="mt-4">
                                    <legend className="sr-only">
                                        Notification method
                                    </legend>
                                    <div className="space-y-4">
                                        {portalData.statuses.map(
                                            (status, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center"
                                                >
                                                    <input
                                                        id={index}
                                                        name="status"
                                                        type="radio"
                                                        defaultChecked={
                                                            status.name ===
                                                            feedbackData.status
                                                        }
                                                        onClick={() =>
                                                            handleChangeStatus(
                                                                status.name
                                                            )
                                                        }
                                                        disabled={
                                                            status.name ===
                                                                feedbackData.status ||
                                                            loading
                                                        }
                                                        className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                                    />
                                                    <label
                                                        htmlFor={index}
                                                        className="ml-3 block text-sm font-medium leading-6 text-gray-900"
                                                    >
                                                        {status.name}
                                                    </label>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </fieldset>
                            </div>
                        </div>
                    </div>
                    <div className="mb-5 flex flex-col gap-2">
                        <h2 className="text-xs font-medium text-gray-500">
                            Actions
                        </h2>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => handleDeleteFeedback()}
                                disabled={loading}
                                className="rounded-md border border-gray-400 p-2 font-light text-gray-400 hover:bg-white"
                            >
                                <TrashIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
