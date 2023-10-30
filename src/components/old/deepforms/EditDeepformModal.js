import React, { useRef, useState } from 'react';
import { Transition, Dialog } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { useAuth } from 'util/auth';
// import { useItem, updateItem, createItem } from "util/db";
import {
  useDeepform,
  updateDeepform,
  createDeepform,
  useSubmissionsByDeepform,
} from 'util/db';
import { useRouter } from 'next/router';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import IconCopyToClipboard from '../IconCopyToClipboard';
import SingleSubmission from './SingleSubmission';

function EditDeepformModal({ id, onDone, host }) {
  const auth = useAuth();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [formAlert, setFormAlert] = useState(null);
  const [isCreate, setIsCreate] = useState(!id);
  const [toggleSubmissions, setToggleSubmissions] = useState(false);
  const cancelButtonRef = useRef(null);

  const { register, handleSubmit, errors } = useForm();

  // This will fetch Deepform if id is defined
  // Otherwise query does nothing and we assume
  // we are creating a new Deepform.
  const { data: deepformData, status: deepformStatus } = useDeepform(id);
  const { data: submissionsData, status: submissionsByDeepformStatus } =
    useSubmissionsByDeepform(id);

  // If we are updating an existing Deepform
  // don't show modal until Deepform data is fetched.
  if (id && deepformStatus !== 'success') {
    return null;
  }

  const onSubmit = (data) => {
    setPending(true);

    const query = !isCreate
      ? updateDeepform(id, data)
      : createDeepform({ owner: auth.user.uid, ...data });

    query
      .then(() => {
        // Let parent know we're done so they can hide modal
        onDone();
      })
      .catch((error) => {
        // Hide pending indicator
        setPending(false);
        // Show error alert message
        setFormAlert({
          type: 'error',
          message: error.message,
        });
      });
  };

  return (
    <Transition appear={true} show={true}>
      <Dialog
        as='div'
        className='fixed inset-0 z-10 overflow-y-auto'
        onClose={() => onDone()}
      >
        <div className='min-h-screen px-4 text-center'>
          <Transition.Child
            as={React.Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <Dialog.Overlay className='fixed inset-0 bg-gray-500 bg-opacity-75' />
          </Transition.Child>
          <span
            className='inline-block h-screen align-middle'
            aria-hidden='true'
          >
            &#8203;
          </span>
          <Transition.Child
            as={React.Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='my-8 inline-block w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
              <Dialog.Title
                as='h3'
                className='text-lg font-medium leading-6 text-gray-900'
              >
                {id ? '' : 'Create'} Deepform
              </Dialog.Title>
              {toggleSubmissions ? (
                <div className='flex flex-col gap-4'>
                  <div className='flex items-center justify-center p-10'>
                    <h1 className='font-satoshi text-2xl font-medium'>
                      Submissions for Deepform: {deepformData?.name}
                    </h1>
                  </div>
                  <button
                    onClick={() => setToggleSubmissions(false)}
                    className='inline-flex w-fit justify-center rounded-md border border-gray-300 py-2 px-4 text-sm font-medium hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'
                  >
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth={1.5}
                      stroke='currentColor'
                      className='h-6 w-6'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        d='M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3'
                      />
                    </svg>
                  </button>
                  <div className='container mx-auto flex flex-col items-center justify-center gap-4'>
                    {submissionsData?.map((submission, index) => (
                      <SingleSubmission key={index} submission={submission} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className='mt-4'>
                  {formAlert && (
                    <div className='mb-4 text-red-600'>{formAlert.message}</div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className='flex flex-col gap-4'>
                      <p>Name</p>
                      <input
                        className='w-full rounded border border-gray-300 bg-white py-1 px-3 leading-8 outline-none focus:border-indigo-500 focus:ring-1'
                        name='name'
                        type='text'
                        placeholder='Name'
                        defaultValue={deepformData && deepformData.name}
                        ref={register({
                          required: 'Please enter a name for your Deepform',
                        })}
                      />
                      <p>What do you want to learn about your user?</p>
                      <textarea
                        className='w-full rounded border border-gray-300 bg-white py-1 px-3 leading-8 outline-none focus:border-indigo-500 focus:ring-1'
                        name='prompt'
                        rows={7}
                        type='text'
                        placeholder='I want to see what they think about this new feature...'
                        defaultValue={deepformData && deepformData.prompt}
                        ref={register({
                          required: 'Please enter a prompt for your Deepform',
                        })}
                      />
                    </div>

                    {errors.name && (
                      <p className='mt-1 text-left text-sm text-red-600'>
                        {errors.name.message}
                      </p>
                    )}

                    <div className='mt-4'>
                      <button
                        className='inline-flex justify-center rounded-md border border-gray-300 py-2 px-4 text-sm font-medium hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'
                        type='button'
                        onClick={() => onDone()}
                        ref={cancelButtonRef}
                      >
                        Cancel
                      </button>
                      <button
                        className='ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-500 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'
                        type='submit'
                        disabled={pending}
                      >
                        {pending ? '...' : 'Save'}
                      </button>
                    </div>
                    <div className='mt-4 flex gap-4'>
                      {!isCreate && (
                        <>
                          <div className='flex w-fit items-center justify-center gap-2'>
                            <Link href={`/form/${id}`} legacyBehavior>
                              <button
                                className='inline-flex justify-center rounded-md border border-gray-300 py-2 px-4 text-sm font-medium hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'

                                // target={"_blank"}
                              >
                                View Live
                              </button>
                            </Link>
                            <CopyToClipboard
                              text={`${host}/form/${id}`}
                              onCopy={() => toast('Link Copied!')}
                            >
                              <button type='button' className=''>
                                <IconCopyToClipboard />
                              </button>
                            </CopyToClipboard>
                          </div>
                          {/* <Link
                                                        href={`/dashboard/deepforms/submissions/${id}`}
                                                        // target={"_blank"}
                                                    > */}
                          <button
                            onClick={() => setToggleSubmissions(true)}
                            className='inline-flex justify-center rounded-md border border-gray-300 py-2 px-4 text-sm font-medium hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2'
                          >
                            Submissions
                          </button>
                          {/* </Link> */}
                        </>
                      )}
                    </div>
                  </form>
                </div>
              )}
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

export default EditDeepformModal;
