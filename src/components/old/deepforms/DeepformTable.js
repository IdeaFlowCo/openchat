import React, { useState } from "react";
import EditDeepformModal from "components/old/deepforms/EditDeepformModal";
import { useAuth } from "util/auth";
import { useRouter } from "next/router";
// import { updateItem, deleteItem, useItemsByOwner } from "util/db";
import { deleteDeepform, useDeepformsByOwner } from "util/db";
import { toast } from "react-hot-toast";
import Link from "next/link";

function DeepformTable({ host }) {
    const auth = useAuth();
    const router = useRouter();

    const {
        data: deepforms,
        status: deepformsStatus,
        error: deepformsError,
    } = useDeepformsByOwner(auth.user.uid);

    const [creatingDeepform, setCreatingDeepform] = useState(false);

    const [updatingDeepformId, setUpdatingDeepformId] = useState(null);

    const deepformsAreEmpty = !deepforms || deepforms.length === 0;

    const confirmDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            deleteDeepform(id);
        }
    };
    const canCreateUnlimitedDeepforms =
        auth.user.planIsActive &&
        (auth.user.planId === "pro" || auth.user.planId === "business");

    // If the user is on the free plan, they can only create 2 Deepforms.
    const handleCreateDeepform = () => {
        if (canCreateUnlimitedDeepforms || deepforms.length < 2) {
            setCreatingDeepform(true);
        } else {
            toast((t) => (
                <span className="flex gap-2">
                    Upgrade to Pro or Business to create more Deepforms.{" "}
                    <Link href="/pricing" legacyBehavior>
                        <button
                            onClick={() => toast.dismiss(t.id)}
                            className=" inline-flex justify-center self-end py-2 px-4 w-fit text-sm font-medium rounded-md bg-indigo-600 hover:bg-indigo-500 text-white border border-gray-300"
                        >
                            Upgrade
                        </button>
                    </Link>
                </span>
            ));
        }
    };

    return (
        <>
            {deepformsError && (
                <div className="mb-4 text-red-600">
                    {deepformsError.message}
                </div>
            )}

            <div>
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <span className="text-xl">Your Deepforms</span>
                    <button
                        className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded border-0  focus:outline-none"
                        onClick={() => handleCreateDeepform()}
                    >
                        Create Deepform
                    </button>
                </div>

                {(deepformsStatus === "loading" || deepformsAreEmpty) && (
                    <div className="p-8">
                        {deepformsStatus === "loading" && <>Loading...</>}

                        {deepformsStatus !== "loading" && deepformsAreEmpty && (
                            <>
                                Nothing yet. Click the button to add your first
                                Deepform.
                            </>
                        )}
                    </div>
                )}

                {deepformsStatus !== "loading" &&
                    deepforms &&
                    deepforms.length > 0 && (
                        <>
                            {deepforms.map((deepform, index) => (
                                <div
                                    className={
                                        "flex p-4 border-b border-gray-200"
                                        // "flex p-4 border-b border-gray-200" +
                                        // (item.featured ? " bg-gray-100" : "")
                                    }
                                    key={index}
                                >
                                    <p className="whitespace-nowrap overflow-scroll scrollbar-hide max-w-[60%] sm:max-w-[50%] xl:max-w-[70%]">
                                        {deepform.name}
                                    </p>

                                    <div className="ml-auto space-x-2">
                                        {/* <button
                    className="text-indigo-600"
                    onClick={() => handleStarItem(item)}
                  >
                    {item.featured ? "unstar" : "star"}
                  </button> */}
                                        <button
                                            className="text-indigo-600"
                                            onClick={() =>
                                                setUpdatingDeepformId(
                                                    deepform.id
                                                )
                                            }
                                        >
                                            Open
                                        </button>
                                        <button
                                            className="text-indigo-600"
                                            onClick={() =>
                                                confirmDelete(deepform.id)
                                            }
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
            </div>

            {creatingDeepform && (
                <EditDeepformModal onDone={() => setCreatingDeepform(false)} />
            )}

            {updatingDeepformId && (
                <EditDeepformModal
                    id={updatingDeepformId}
                    onDone={() => setUpdatingDeepformId(null)}
                    //TODO: Use global state to avoid prop drilling
                    host={host}
                />
            )}
        </>
    );
}

export default DeepformTable;
