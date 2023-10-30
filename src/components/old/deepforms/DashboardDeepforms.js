import React from 'react';
import Link from 'next/link';
import DeepformTable from 'components/old/deepforms/DeepformTable';
import { useAuth } from 'util/auth';
import { useDeepformsByOwner } from 'util/db';

function DashboardDeepforms({ host }) {
  const auth = useAuth();
  const {
    data: deepforms,
    status: deepformsStatus,
    error: deepformsError,
  } = useDeepformsByOwner(auth.user.uid);

  return (
    <section className='py-6'>
      <div className='container mx-auto'>
        <div className='flex flex-wrap'>
          <div className='w-full p-4 md:w-1/2'>
            {/* <div className="rounded border border-gray-200"> */}
            <DeepformTable host={host} />
            {/* </div> */}
          </div>
          <div className='w-full p-4 md:w-1/2'>
            <div className='prose max-w-none rounded-xl border border-gray-200 p-6 prose-a:text-indigo-600'>
              {/* Rich analytics for Deepforms*/}
              <h3 className='mb-4'>Deepform Analytics</h3>
              {/* <h3 className="mb-4">Deepform Dashboard</h3>
                            <p>
                                Welcome to Deepform! On your left, you can
                                create your first Deepform by clicking "Create
                                Deepform". You can give it a name and tell the
                                AI what you want to learn about your customers.
                            </p>
                            <p>
                                Once you create a Deepform, you can click on it
                                to view the Deepform details. You can edit it,
                                delete it, view the live Deepform, or view the
                                Deepform results. Have fun!
                            </p> */}
              {/* <h3 className="mb-4">Your account info</h3>
                            <div>
                                You are signed in as{" "}
                                <strong>{auth.user.email}</strong>.
                            </div>

                            {auth.user.stripeSubscriptionId && (
                                <>
                                    <div>
                                        You are subscribed to the{" "}
                                        <strong>{auth.user.planId} plan</strong>
                                        .
                                    </div>
                                    <div>
                                        Your plan status is{" "}
                                        <strong>
                                            {auth.user.stripeSubscriptionStatus}
                                        </strong>
                                        .
                                    </div>
                                </>
                            )}

                            <div>
                                You can change your account info{` `}
                                {auth.user.stripeSubscriptionId && (
                                    <>and plan{` `}</>
                                )}
                                in{` `}
                                <Link href="/settings/general">
                                    <a>settings</a>
                                </Link>
                                .
                            </div>

                            {!auth.user.stripeSubscriptionId && (
                                <div>
                                    You can signup for a plan in{" "}
                                    <Link href="/pricing">
                                        <a>pricing</a>
                                    </Link>
                                    .
                                </div>
                            )} */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DashboardDeepforms;
