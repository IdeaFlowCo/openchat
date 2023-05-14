import React from "react";
import Link from "next/link";
import DeepformTable from "components/dashboard/DeepformTable";
import { useAuth } from "util/auth";
import SubmissionsForDeepFormSection from "./SubmissionsForDeepFormSection";

function DashboardSubmissions({ host }) {
    const auth = useAuth();

    return (
        <section className="py-6">
            <div className="container mx-auto">
                <div className="flex flex-wrap">
                    <div className="p-4 w-full md:w-1/2">
                        {/* <div className="rounded border border-gray-200"> */}
                            <SubmissionsForDeepFormSection />
                        {/* </div> */}
                    </div>
                    <div className="p-4 w-full md:w-1/2">
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
                    </div>
                </div>
            </div>
        </section>
    );
}

export default DashboardSubmissions;
