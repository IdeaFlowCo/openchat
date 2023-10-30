import React from 'react';
import Meta from 'components/Meta';
import DashboardHome from 'components/old/home/DashboardHome';
import { requireAuth } from 'util/auth';
import { useRouter } from 'next/router';
import { usePortal } from 'util/db';
import PortalLayout from 'components/portal/PortalLayout';
import PortalAdminDashboard from 'components/dashboard/PortalAdminDashboard';
import { useAuth } from 'util/auth';
import PageLoader from 'components/PageLoader';
function DashboardHomePage() {
  const auth = useAuth();
  const router = useRouter();

  const { data: portalData, status: portalStatus } = usePortal(
    auth.user?.portal_id
  );
  // console.log("portalData", portalData);

  // If this Portal doesn't exist, redirect to dashboard
  if (portalStatus && portalStatus === 'error') {
    router.push('/');
  }

  // If the user doesn't have a portalId, redirect to /
  // if (auth.user && !auth.user.portal_id) {
  //     router.push("/portal/new");
  // }

  if (portalData === undefined || portalData === null || !portalData) {
    // Return loader
    return <PageLoader />;
  }

  return (
    <>
      <Meta title='Dashboard | Deepform' />
      {/* <DashboardSection host={host} /> */}
      <PortalLayout
        portalData={portalData}
        adminMode={true}
        currentPage={'Dashboard'}
      >
        <PortalAdminDashboard portalData={portalData} />
      </PortalLayout>
    </>
  );
}

export default requireAuth(DashboardHomePage, true);
