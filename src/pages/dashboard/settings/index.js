import React from "react";
import Meta from "components/Meta";
import DashboardHome from "components/old/home/DashboardHome";
import { requireAuth } from "../../../util/auth";
import { useRouter } from "next/router";
import { usePortal } from "util/db";
import PortalLayout from "components/portal/PortalLayout";
import PortalAdminDashboard from "components/dashboard/PortalAdminDashboard";
import { useAuth } from "util/auth";
import PortalSettingsGeneral from "components/portal/settings/PortalSettingsGeneral";
import PortalSettingsLayout from "components/portal/settings/PortalSettingsLayout";

function PortalSettingsGeneralPage() {
    const auth = useAuth();
    const router = useRouter();

    const { data: portalData, status: portalStatus } = usePortal(
        auth.user?.portal_id
    );
    // console.log("portalData", portalData);

    // If this Portal doesn't exist, redirect to dashboard
    if (portalStatus && portalStatus === "error") {
        router.push("/");
    }

    // If the user doesn't have a portalId, redirect to /
    if (auth.user && !auth.user.portal_id) {
        router.push("/portal/new");
    }

    if (!portalData) {
        // Return loader
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                Loading...
            </div>
        );
    }

    return (
        <>
            <Meta title="Settings | Dashboard | Deepform" />
            <PortalLayout
                portalData={portalData}
                adminMode={true}
                currentPage={""}
            >
                <PortalSettingsLayout
                    currentPage={"General"}
                    portalData={portalData}
                >
                    <PortalSettingsGeneral portalData={portalData} />
                </PortalSettingsLayout>
            </PortalLayout>
        </>
    );
}

export default requireAuth(PortalSettingsGeneralPage, true);
