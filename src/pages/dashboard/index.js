import React from "react";
import Meta from "components/Meta";
import DashboardHome from "components/dashboard/home/DashboardHome";
import { requireAuth } from "util/auth";
import { useRouter } from "next/router";
import { usePortal } from "util/db";
import PortalLayout from "components/portal/PortalLayout";
import PortalAdminDashboard from "components/dashboard/PortalAdminDashboard";
import { useAuth } from "util/auth";
function DashboardHomePage() {
    const auth = useAuth();

    // Grab Deepform ID
    const router = useRouter();

    const { data: portalData, status: portalStatus } = usePortal(auth.user?.portal_id);
    // console.log("portalData", portalData);

    // If this Deepform doesn't exist, redirect to dashboard
    if (portalStatus && portalStatus === "error") {
        router.push("/");
    }

    // If the user doesn't have a portalId, redirect to /
    if (auth.user && !auth.user.portal_id) {
        router.push("/portal/new");
    }

    if (!portalData) {
        // Return loader
        return <div className="w-screen h-screen flex justify-center items-center">Loading...</div>;
    }

    return (
        <>
            <Meta title="Dashboard | Deepform" />
            {/* <DashboardSection host={host} /> */}
            <PortalLayout portalId={portalData.id} adminMode={true} currentPage={""}>
                <PortalAdminDashboard portalData={portalData} />
            </PortalLayout>
        </>
    );
}

export default requireAuth(DashboardHomePage);
