import React from 'react';
import Meta from 'components/Meta';
import { requireAuth } from 'util/auth';
import { useRouter } from 'next/router';
import { useAuth } from 'util/auth';
import SubmissionTranscript from 'components/old/SubmissionTranscript';

// NOTE: NOT IN USE RIGHT NOW
function SubmissionPage(props) {
  // Grab Deepform ID
  const router = useRouter();
  const { deepform: deepformId, submission: submissionId } = router.query;

  return (
    <>
      <Meta title={'Submission Transcript | Deepform'} />
      <SubmissionTranscript submissionId={submissionId} />
    </>
  );
}

export default requireAuth(SubmissionPage);
