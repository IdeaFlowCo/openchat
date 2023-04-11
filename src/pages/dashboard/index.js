import React from "react";
import Meta from "components/Meta";
import DashboardSection from "components/DashboardSection";
import { requireAuth } from "util/auth";

function DashboardPage({ host }) {
    return (
        <>
            <Meta title="Dashboard" />
            <DashboardSection host={host} />
        </>
    );
}

export const getServerSideProps = async (context) => ({
    props: { host: context.req.headers.host || null },
});

export default requireAuth(DashboardPage);
