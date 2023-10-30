import SubmissionTranscript from 'components/old/SubmissionTranscript';
import Link from 'next/link';
import React, { useState } from 'react';
import { deleteSubmission } from 'util/db';

function SingleSubmission({ submission }) {
  const [toggleTranscript, setToggleTranscript] = useState(false);

  const confirmDelete = () => {
    if (window.confirm('Are you sure you want to delete this submission?')) {
      deleteSubmission(submission?.id);
    }
  };

  return (
    <div className='flex w-full flex-col gap-4 rounded-xl border border-black/10 p-8'>
      <h1 className='text-sm text-black/40'>Submission Id: {submission?.id}</h1>
      {toggleTranscript ? (
        <>
          <button
            onClick={() => setToggleTranscript(false)}
            className=' inline-flex w-fit justify-center rounded-md border border-gray-300 bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-500'
          >
            Back to Summary
          </button>
          <SubmissionTranscript submissionId={submission?.id} />
        </>
      ) : (
        <>
          <p>{submission?.summary}</p>
          <div className='flex flex-wrap justify-between gap-2'>
            {/* <Link
                    href={`/form/${submission?.id}/submission/${submission?.id}`}
                >
                    <button className=" inline-flex justify-center py-2 px-4 w-fit text-sm font-medium rounded-md bg-indigo-600 hover:bg-indigo-500 text-white border border-gray-300">
                        {" "}
                        View Transcript
                    </button>
                </Link> */}
            <button
              onClick={() => setToggleTranscript(true)}
              className=' inline-flex w-fit justify-center rounded-md border border-gray-300 bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-500'
            >
              {' '}
              View Transcript
            </button>
            <button
              className=' inline-flex w-fit justify-center rounded-md border border-gray-300 py-2 px-4 text-sm font-medium hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'
              onClick={() => (submission?.id ? confirmDelete() : null)}
            >
              Delete Submission
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default SingleSubmission;
