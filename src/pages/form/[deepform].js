import React from "react";
import Meta from "components/Meta";
import { requireAuth } from "util/auth";
import { useRouter } from "next/router";
import { useDeepform } from "util/db";
import AnswerDeepform from "components/AnswerDeepform";
import { useAuth } from "util/auth";

function DeepformPage(props) {
    // Grab Deepform ID
    const router = useRouter()
    const { deepform: deepformId } = router.query

    const { data: deepformData, status: deepformStatus } = useDeepform(deepformId);
    // console.log("deepformData", deepformData);

    // If this Deepform doesn't exist, redirect to dashboard
    if (deepformStatus && deepformStatus === "error") {
        router.push("/");
    }

    return (
        <>
            <Meta title={deepformData?.name + " | Deepform"} />
            <AnswerDeepform id={deepformId} />
        </>
    );
}

export default DeepformPage;
