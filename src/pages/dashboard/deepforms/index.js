import React from "react";
import Meta from "components/Meta";
import { requireAuth } from "util/auth";
import DashboardLayout from "components/dashboard/DashboardLayout";
import DashboardDeepforms from "components/old/deepforms/DashboardDeepforms";

function DashboardDeepformsPage({ host }) {
    return (
        <>
            <Meta title="Deepforms | Dashboard | Deepform" />
            {/* <DashboardSection host={host} /> */}
            <DashboardLayout currentPage="Deepforms">
                <DashboardDeepforms />
            </DashboardLayout>
        </>
    );
}

export const getServerSideProps = async (context) => ({
    props: { host: context.req.headers.host || null },
});

export default requireAuth(DashboardDeepformsPage, true);