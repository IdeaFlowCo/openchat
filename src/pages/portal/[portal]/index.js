import React, { useState, useEffect } from "react";
import Meta from "components/Meta";
import { requireAuth } from "util/auth";
import { useRouter } from "next/router";
import { usePortal } from "util/db";
import PortalLayout from "components/portal/PortalLayout";
import PortalFeatureRequests from "components/portal/PortalFeatureRequests";
import { useAuth } from "util/auth";

function PublicPortalPage(props) {
    const auth = useAuth();
    // Grab Deepform ID
    const router = useRouter();
    const { portal: portalId } = router.query;
    // const [userIsAdmin, setUserIsAdmin] = useState(false);
    if (portalId === "undefined") {
        console.log("portalId is undefined");
        router.push("/");
        return <div></div>;
    }
    const { data: portalData, status: portalStatus } = usePortal(portalId);

    // console.log("portalData", portalData);

    // If this Deepform doesn't exist, redirect to dashboard
    if (portalStatus && portalStatus === "error") {
        router.push("/");
    }

    let userIsAdmin = auth.user?.portal_id === portalData?.id;
    return (
        <>
            <Meta title={"Feedback Portal"} />
            <PortalLayout
                portalData={portalData}
                adminMode={userIsAdmin}
                currentPage={"Feature Requests"}
            >
                <PortalFeatureRequests portalData={portalData} />
            </PortalLayout>
        </>
    );
}

export default PublicPortalPage;
