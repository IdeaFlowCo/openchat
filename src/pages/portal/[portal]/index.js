import React from "react";
import Meta from "components/Meta";
import { requireAuth } from "util/auth";
import { useRouter } from "next/router";
import { usePortal } from "util/db";
import PortalLayout from "components/portal/PortalLayout";
import PortalFeatureRequests from "components/portal/PortalFeatureRequests";

function PublicPortalPage(props) {
    // Grab Deepform ID
    const router = useRouter();
    const { portal: portalId } = router.query;

    const { data: portalData, status: portalStatus } = usePortal(portalId);
    // console.log("portalData", portalData);

    // If this Deepform doesn't exist, redirect to dashboard
    if (portalStatus && portalStatus === "error") {
        router.push("/");
    }

    return (
        <>
            <Meta title={"Feedback Portal"} />
            <PortalLayout portalId={portalData?.id} />
            <PortalFeatureRequests />
        </>
    );
}

export default PublicPortalPage;
