import React from "react";
import Meta from "components/Meta";
import DashboardSubmissions from "components/dashboard/submissions/DashboardSubmissions";
import { requireAuth } from "util/auth";
import DashboardLayout from "components/dashboard/DashboardLayout";

function DashboardSubmissionsPage({ host }) {
    return (
        <>
            <Meta title="Submissions | Dashboard | Deepform" />
            {/* <DashboardSection host={host} /> */}
            <DashboardLayout currentPage="Submissions">
                <DashboardSubmissions host={host} />
            </DashboardLayout>
        </>
    );
}

export const getServerSideProps = async (context) => ({
    props: { host: context.req.headers.host || null },
});

export default requireAuth(DashboardSubmissionsPage);