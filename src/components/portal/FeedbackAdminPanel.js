import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { updateFeedback } from 'util/db';
import { toast } from 'react-hot-toast';
import {
  TrashIcon,
  PlusSmallIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { deleteFeedback } from 'util/db';
import ContentFeedbackAdminPanel from './ContentFeedbackAdminPanel';

const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export default function FeedbackAdminPanel({ feedbackData, portalData }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* DESKTOP SIDE STATIC PANEL */}
      <div className='hidden lg:static lg:inset-0 lg:block'>
        <ContentFeedbackAdminPanel
          feedbackData={feedbackData}
          portalData={portalData}
        />
      </div>

      {/* MOBILE SIDE SLIDEOVER PANEL */}
      {/* Mobile Button to open admin panel */}
      <button
        type='button'
        onClick={() => setOpen(true)}
        className=' text-md fixed bottom-5 right-5 z-50 mt-2 flex h-fit w-fit items-center justify-center gap-[2px] whitespace-nowrap rounded-md border border-gray-900/20 bg-white px-3.5 py-2.5 font-medium text-gray-900 shadow-xl transition-all hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 lg:hidden'
      >
        {/* <PlusSmallIcon className="-ml-2 h-5 w-5" /> */}
        Admin Panel
      </button>

      <Transition.Root show={open} as={Fragment}>
        <Dialog as='div' className='relative z-10' onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter='ease-in-out duration-500'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in-out duration-500'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-hidden'>
            <div className='absolute inset-0 overflow-hidden'>
              <div className='pointer-events-none fixed inset-y-0 left-0 flex max-w-full '>
                <Transition.Child
                  as={Fragment}
                  enter='transform transition ease-in-out duration-300 sm:duration-400'
                  enterFrom='-translate-x-full'
                  enterTo='translate-x-0'
                  leave='transform transition ease-in-out duration-300 sm:duration-400'
                  leaveFrom='translate-x-0'
                  leaveTo='-translate-x-[300px]'
                >
                  <Dialog.Panel className='pointer-events-auto'>
                    <div className='flex h-full flex-col overflow-y-scroll shadow-xl '>
                      <div className='px-4 sm:px-6'>
                        <div className='flex items-start justify-between'>
                          <div />
                          <div className='ml-3 flex h-7 items-center'>
                            <button
                              type='button'
                              className='z-[100] rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                              onClick={() => setOpen(false)}
                            >
                              <span className='sr-only'>Close panel</span>
                              <XMarkIcon
                                className='h-6 w-6'
                                aria-hidden='true'
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className='b relative -mt-3 flex flex-1 flex-col gap-10 px-4 sm:px-10'>
                        {/* CONTENT OF SLIDEOVER */}
                        <ContentFeedbackAdminPanel
                          feedbackData={feedbackData}
                          portalData={portalData}
                        />
                        {/* END CONTENT OF SLIDEOVER */}
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
