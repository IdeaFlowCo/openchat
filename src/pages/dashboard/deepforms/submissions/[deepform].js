import React from "react";
import Meta from "components/Meta";
import { requireAuth } from "util/auth";
import SubmissionsForDeepFormSection from "components/dashboard/deepforms/SubmissionsForDeepFormSection";
import { useRouter } from "next/router";
import { useDeepform } from "util/db";

function SubmissionsForDeepform(props) {
    const router = useRouter();
    const { deepform: deepformId } = router.query;
    const { data: deepformData, status: deepformStatus } =
        useDeepform(deepformId);

    return (
        <>
            <Meta
                title={"Submissions for " + deepformData?.name + " | Deepform"}
            />
            {/* <AnswerDeepform id={deepformId} /> */}
            <SubmissionsForDeepFormSection />
        </>
    );
}

export default requireAuth(SubmissionsForDeepform);
