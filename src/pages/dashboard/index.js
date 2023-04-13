import React from "react";
import Meta from "components/Meta";
import DashboardSection from "components/DashboardSection";
import { requireAuth } from "util/auth";
import NewDashboardSection from "components/NewDashboardSection";

function DashboardPage({ host }) {
    return (
        <>
            <Meta title="Dashboard" />
            {/* <DashboardSection host={host} /> */}
            <NewDashboardSection />
        </>
    );
}

export const getServerSideProps = async (context) => ({
    props: { host: context.req.headers.host || null },
});

export default requireAuth(DashboardPage);
