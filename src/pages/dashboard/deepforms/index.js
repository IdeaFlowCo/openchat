import React from "react";
import Meta from "components/Meta";
import DashboardSubmissions from "components/dashboard/submissions/DashboardSubmissions";
import { requireAuth } from "util/auth";
import DashboardLayout from "components/dashboard/DashboardLayout";
import DashboardDeepforms from "components/dashboard/deepforms/DashboardDeepforms";

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

export default requireAuth(DashboardDeepformsPage);