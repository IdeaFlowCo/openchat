import React, { useState } from "react";
import Link from "next/link";
import DeepformTable from "components/dashboard/deepforms/DeepformTable";
import { useAuth } from "util/auth";
import { createPortal, updateUser, usePortal } from "util/db";
import { PlusIcon } from "@heroicons/react/20/solid";

function DashboardHome({ host }) {
    const auth = useAuth();
    console.log("auth.user", auth.user);
    const { data: portalData, status: portalStatus } = usePortal(
        auth.user.portal_id
    );

    console.log("portalData in DashboardHome", portalData);

    const handleCreatePortal = async () => {
        const portal = await createPortal({});
        if (portal.length === 0) {
            alert("Error creating portal");
            return;
        }
        await updateUser(auth.user.uid, { portal_id: portal[0].id });
    };

    return (
        <section className="py-6">
            <div className="container mx-auto">
                <div className="flex flex-wrap">
                    {portalData === undefined || portalData === null ? (
                        <div className="items center flex w-full justify-center p-4">
                            <div className="text-center">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        vectorEffect="non-scaling-stroke"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                                    />
                                </svg>
                                <h3 className="mt-2 text-sm font-semibold text-gray-900">
                                    No Feedback Portal
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Get started by initializing your feedback
                                    portal.
                                </p>
                                <div className="mt-6">
                                    <button
                                        type="button"
                                        onClick={() => handleCreatePortal()}
                                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                    >
                                        <PlusIcon
                                            className="-ml-0.5 mr-1.5 h-5 w-5"
                                            aria-hidden="true"
                                        />
                                        New Portal
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link href={`/portal/${portalData?.id}`}>
                            <button className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                                Go to Portal
                            </button>
                        </Link>
                    )}

                    {/* <div className="rounded border border-gray-200"> */}
                    {/* <DeepformTable host={host}/> */}
                    {/* </div> */}

                    {/* <div className="p-4 w-full md:w-1/2">
                        <div className="p-6 rounded-xl border border-gray-200 prose prose-a:text-indigo-600 max-w-none">
                            <h3 className="mb-4">Deepform Dashboard</h3>
                            <p>
                                Welcome to Deepform! On your left, you can
                                create your first Deepform by clicking "Create
                                Deepform". You can give it a name and tell the
                                AI what you want to learn about your customers.
                            </p>
                            <p>
                                Once you create a Deepform, you can click on it
                                to view the Deepform details. You can edit it,
                                delete it, view the live Deepform, or view the
                                Deepform results. Have fun!
                            </p>
                            <h3 className="mb-4">Your account info</h3>
                            <div>
                                You are signed in as{" "}
                                <strong>{auth.user.email}</strong>.
                            </div>

                            {auth.user.stripeSubscriptionId && (
                                <>
                                    <div>
                                        You are subscribed to the{" "}
                                        <strong>{auth.user.planId} plan</strong>
                                        .
                                    </div>
                                    <div>
                                        Your plan status is{" "}
                                        <strong>
                                            {auth.user.stripeSubscriptionStatus}
                                        </strong>
                                        .
                                    </div>
                                </>
                            )}

                            <div>
                                You can change your account info{` `}
                                {auth.user.stripeSubscriptionId && (
                                    <>and plan{` `}</>
                                )}
                                in{` `}
                                <Link href="/settings/general">
                                    <a>settings</a>
                                </Link>
                                .
                            </div>

                            {!auth.user.stripeSubscriptionId && (
                                <div>
                                    You can signup for a plan in{" "}
                                    <Link href="/pricing">
                                        <a>pricing</a>
                                    </Link>
                                    .
                                </div>
                            )}
                        </div>
                    </div> */}
                </div>
            </div>
        </section>
    );
}

export default DashboardHome;
