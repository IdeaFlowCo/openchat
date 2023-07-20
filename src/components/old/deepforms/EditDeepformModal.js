import React, { useRef, useState } from "react";
import { Transition, Dialog } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { useAuth } from "util/auth";
// import { useItem, updateItem, createItem } from "util/db";
import {
    useDeepform,
    updateDeepform,
    createDeepform,
    useSubmissionsByDeepform,
} from "util/db";
import { useRouter } from "next/router";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Link from "next/link";
import { toast } from "react-hot-toast";
import IconCopyToClipboard from "../IconCopyToClipboard";
import SingleSubmission from "./SingleSubmission";

function EditDeepformModal({ id, onDone, host }) {
    const auth = useAuth();
    const router = useRouter();
    const [pending, setPending] = useState(false);
    const [formAlert, setFormAlert] = useState(null);
    const [isCreate, setIsCreate] = useState(!id);
    const [toggleSubmissions, setToggleSubmissions] = useState(false);
    const cancelButtonRef = useRef(null);

    const { register, handleSubmit, errors } = useForm();

    // This will fetch Deepform if id is defined
    // Otherwise query does nothing and we assume
    // we are creating a new Deepform.
    const { data: deepformData, status: deepformStatus } = useDeepform(id);
    const { data: submissionsData, status: submissionsByDeepformStatus } =
        useSubmissionsByDeepform(id);

    // If we are updating an existing Deepform
    // don't show modal until Deepform data is fetched.
    if (id && deepformStatus !== "success") {
        return null;
    }

    const onSubmit = (data) => {
        setPending(true);

        const query = !isCreate
            ? updateDeepform(id, data)
            : createDeepform({ owner: auth.user.uid, ...data });

        query
            .then(() => {
                // Let parent know we're done so they can hide modal
                onDone();
            })
            .catch((error) => {
                // Hide pending indicator
                setPending(false);
                // Show error alert message
                setFormAlert({
                    type: "error",
                    message: error.message,
                });
            });
    };

    return (
        <Transition appear={true} show={true}>
            <Dialog
                as="div"
                className="overflow-y-auto fixed inset-0 z-10"
                onClose={() => onDone()}
            >
                <div className="px-4 min-h-screen text-center">
                    <Transition.Child
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75" />
                    </Transition.Child>
                    <span
                        className="inline-block h-screen align-middle"
                        aria-hidden="true"
                    >
                        &#8203;
                    </span>
                    <Transition.Child
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="inline-block overflow-hidden p-6 my-8 w-full max-w-3xl text-left align-middle bg-white rounded-2xl shadow-xl transition-all transform">
                            <Dialog.Title
                                as="h3"
                                className="text-lg font-medium leading-6 text-gray-900"
                            >
                                {id ? "" : "Create"} Deepform
                            </Dialog.Title>
                            {toggleSubmissions ? (
                                <div className="flex flex-col gap-4">
                                    <div className="flex justify-center items-center p-10">
                                        <h1 className="font-satoshi font-medium text-2xl">
                                            Submissions for Deepform:{" "}
                                            {deepformData?.name}
                                        </h1>
                                    </div>
                                    <button
                                        onClick={() =>
                                            setToggleSubmissions(false)
                                        }
                                        className="inline-flex w-fit justify-center py-2 px-4 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-6 h-6"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                                            />
                                        </svg>
                                    </button>
                                    <div className="flex flex-col justify-center items-center gap-4 container mx-auto">
                                        {submissionsData?.map(
                                            (submission, index) => (
                                                <SingleSubmission
                                                    key={index}
                                                    submission={submission}
                                                />
                                            )
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4">
                                    {formAlert && (
                                        <div className="mb-4 text-red-600">
                                            {formAlert.message}
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <div className="flex flex-col gap-4">
                                            <p>Name</p>
                                            <input
                                                className="py-1 px-3 w-full leading-8 bg-white rounded border border-gray-300 outline-none focus:border-indigo-500 focus:ring-1"
                                                name="name"
                                                type="text"
                                                placeholder="Name"
                                                defaultValue={
                                                    deepformData &&
                                                    deepformData.name
                                                }
                                                ref={register({
                                                    required:
                                                        "Please enter a name for your Deepform",
                                                })}
                                            />
                                            <p>
                                                What do you want to learn about
                                                your user?
                                            </p>
                                            <textarea
                                                className="py-1 px-3 w-full leading-8 bg-white rounded border border-gray-300 outline-none focus:border-indigo-500 focus:ring-1"
                                                name="prompt"
                                                rows={7}
                                                type="text"
                                                placeholder="I want to see what they think about this new feature..."
                                                defaultValue={
                                                    deepformData &&
                                                    deepformData.prompt
                                                }
                                                ref={register({
                                                    required:
                                                        "Please enter a prompt for your Deepform",
                                                })}
                                            />
                                        </div>

                                        {errors.name && (
                                            <p className="mt-1 text-sm text-left text-red-600">
                                                {errors.name.message}
                                            </p>
                                        )}

                                        <div className="mt-4">
                                            <button
                                                className="inline-flex justify-center py-2 px-4 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                                                type="button"
                                                onClick={() => onDone()}
                                                ref={cancelButtonRef}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                className="inline-flex justify-center py-2 px-4 ml-3 text-sm font-medium text-white bg-indigo-500 rounded-md border border-transparent hover:bg-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                                                type="submit"
                                                disabled={pending}
                                            >
                                                {pending ? "..." : "Save"}
                                            </button>
                                        </div>
                                        <div className="mt-4 flex gap-4">
                                            {!isCreate && (
                                                <>
                                                    <div className="w-fit flex gap-2 justify-center items-center">
                                                        <Link href={`/form/${id}`} legacyBehavior>
                                                            <button
                                                                className="inline-flex justify-center py-2 px-4 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"

                                                                // target={"_blank"}
                                                            >
                                                                View Live
                                                            </button>
                                                        </Link>
                                                        <CopyToClipboard
                                                            text={`${host}/form/${id}`}
                                                            onCopy={() =>
                                                                toast(
                                                                    "Link Copied!"
                                                                )
                                                            }
                                                        >
                                                            <button
                                                                type="button"
                                                                className=""
                                                            >
                                                                <IconCopyToClipboard />
                                                            </button>
                                                        </CopyToClipboard>
                                                    </div>
                                                    {/* <Link
                                                        href={`/dashboard/deepforms/submissions/${id}`}
                                                        // target={"_blank"}
                                                    > */}
                                                    <button
                                                        onClick={() =>
                                                            setToggleSubmissions(
                                                                true
                                                            )
                                                        }
                                                        className="inline-flex justify-center py-2 px-4 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
                                                    >
                                                        Submissions
                                                    </button>
                                                    {/* </Link> */}
                                                </>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}

export default EditDeepformModal;
