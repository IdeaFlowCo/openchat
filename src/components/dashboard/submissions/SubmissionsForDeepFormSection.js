import React from "react";
import { useRouter } from "next/router";
import { useDeepform, useSubmissionsByDeepform } from "util/db";
import { useAuth } from "util/auth";
import SingleSubmission from "./SingleSubmission";

function SubmissionsForDeepFormSection() {
    // Grab Deepform ID
    const router = useRouter();
    const auth = useAuth();
    const { deepform: deepformId } = router.query;

    const { data: deepformData, status: deepformStatus } =
        useDeepform(deepformId);
    const { data: submissionsData, status: submissionsByDeepformStatus } =
        useSubmissionsByDeepform(deepformId);
    console.log("submissionsData", submissionsData);

    // If this Deepform doesn't exist, redirect to dashboard
    if (
        submissionsByDeepformStatus &&
        submissionsByDeepformStatus === "error"
    ) {
        router.push("/");
    }

    // If the logged in user is not the owner of this Deepform,
    // redirect to dashboard
    if (deepformData && deepformData?.owner !== auth.user.uid) {
        router.push("/");
    }
    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-center items-center p-10">
                <h1 className="font-bold text-2xl">
                    Submissions for Deepform: {deepformData?.name}
                </h1>
            </div>
            <div className="flex flex-col justify-center items-center gap-4 container mx-auto">
                {submissionsData?.map((submission, index) => (
                    <SingleSubmission key={index} submission={submission} />
                ))}
            </div>
        </div>
    );
}

export default SubmissionsForDeepFormSection;
