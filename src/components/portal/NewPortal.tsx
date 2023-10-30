import Logo from 'components/atoms/Logo';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createPortal, updateUser, useUsers } from 'util/db';
import AddIdea from './AddIdea';
import { useAuth } from 'util/auth';
import { useRouter } from 'next/router';
import { Transition } from '@headlessui/react';
import { toast } from 'react-hot-toast';
import { SignUpEmailProps } from 'types/emailTypes';
import { getFirstName } from 'util/string';

export default function NewPortal() {
  const router = useRouter();
  const auth = useAuth();
  const { register, handleSubmit, watch, errors } = useForm();
  const { data: usersData }: any = useUsers();
  const [loading, setLoading] = useState(false);
  const [portalId, setPortalId] = useState(null);
  const [step, setStep] = useState(1);
  // console.log("users", usersData)
  // If the user already has a portal, redirect to it
  if (step === 1 && !loading && auth.user?.portal_id) {
    router.push(`/portal/${auth.user.portal_id}`);
  }

  //TODO: If I ever add multiple portals, def. needs to be updated.
  // And don't send the sign up email!!! Only on the first call.
  const onSubmit = (data) => {
    setLoading(true);
    createPortal({
      ...data,
      statuses: [
        {
          name: 'Under Consideration',
          textColor: 'text-yellow-500',
          borderColor: 'border-yellow-500',
          description: 'This feature is under consideration',
          backgroundColor: 'bg-yellow-100',
        },
        {
          name: 'Planned',
          textColor: 'text-blue-500',
          borderColor: 'border-blue-500',
          description: 'This feature is planned',
          backgroundColor: 'bg-blue-100',
        },
        {
          name: 'In Development',
          textColor: 'text-green-500',
          borderColor: 'border-green-500',
          description: 'This feature is in development',
          backgroundColor: 'bg-green-100',
        },
        {
          name: 'Launched',
          textColor: 'text-orange-500',
          borderColor: 'border-orange-500',
          description: 'This feature has been launched',
          backgroundColor: 'bg-orange-100',
        },
        {
          name: 'Not in Scope',
          textColor: 'text-red-500',
          borderColor: 'border-red-500',
          description: 'This feature is not in scope',
          backgroundColor: 'bg-red-100',
        },
      ],
    })
      .then(async (res) => {
        console.log('res', res);
        await updateUser(auth.user.uid, { portal_id: res[0].id });
        setPortalId(res[0].id);
        setStep(2);
        setLoading(false);
        let capitalizedFirstName = getFirstName(auth.user?.name);
        // // Send SignUp email
        const emailData: SignUpEmailProps = {
          portalId: res[0].id,
          userFirstName: capitalizedFirstName,
          to: auth.user?.email,
        };
        fetch('/api/email/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData),
        })
          .then((res) => res.json())
          .then((res) => {
            console.log('res', res);
          });
      })
      .catch((err) => {
        console.log('err', err);
        toast.error(
          'Error creating portal, please refresh or email alan@deepform.ai.'
        );
        setLoading(false);
      });
  };

  return (
    <>
      <div className='fixed flex h-screen min-h-full w-screen flex-1 flex-col items-center justify-between py-6 px-4 sm:px-6 lg:px-8'>
        <div className='w-fit self-start'>
          <Logo />
        </div>
        <div className='flex w-full flex-col items-center justify-start gap-4 sm:w-96'>
          {step === 1 && (
            <Transition
              appear={true}
              show={true}
              enter='transition ease-out duration-500 delay-500'
              enterFrom='opacity-0 translate-y-1'
              enterTo='opacity-100 translate-y-0'
              leave='transition ease-in duration-150'
              leaveFrom='opacity-100 translate-y-0'
              leaveTo='opacity-0 translate-y-1'
              className='flex w-full flex-col items-center justify-start gap-4 sm:w-96'
            >
              <h1 className='font-satoshi text-3xl font-medium tracking-tight text-gray-900'>
                Welcome!
              </h1>
              <p className='font-light text-gray-700'>
                Let&apos;s get started by creating your portal.
              </p>
              {/* Form that asks questions one by one, like Typeform */}
              <form
                className='mt-4 w-full space-y-6'
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className='flex flex-col gap-5 -space-y-px rounded-md shadow-sm'>
                  <div>
                    <label
                      htmlFor='portal-name'
                      className='block text-sm font-medium leading-6 text-gray-900'
                    >
                      Portal Name
                    </label>
                    <div className='mt-2'>
                      <input
                        type='portal_name'
                        name='portal_name'
                        id='portal_name'
                        className='sm:text-md block w-full rounded-md border-0  p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400  focus:outline-indigo-600 focus:ring-0 focus:ring-inset focus:ring-indigo-600 sm:leading-6'
                        placeholder='Your company/product...'
                        ref={register({
                          required: 'Please enter a portal name',
                        })}
                      />
                    </div>
                  </div>
                  <div>
                    <button
                      type='submit'
                      disabled={loading}
                      className='group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
                    >
                      {loading ? 'Creating...' : 'Create Portal'}
                    </button>
                  </div>
                </div>
              </form>
            </Transition>
          )}
          {step === 2 && (
            <Transition
              appear={true}
              show={true}
              enter='transition ease-out duration-500 delay-500'
              enterFrom='opacity-0 translate-y-1'
              enterTo='opacity-100 translate-y-0'
              leave='transition ease-in duration-150'
              leaveFrom='opacity-100 translate-y-0'
              leaveTo='opacity-0 translate-y-1'
              className='flex w-full flex-col items-center justify-start gap-4 sm:w-96'
            >
              <h1 className='font-satoshi text-3xl font-medium tracking-tight text-gray-900'>
                All set! 🥳
              </h1>
              <p className='text-center font-light text-gray-700'>
                Now, let&apos;s create your first feature request. What&apos;s a feature
                you&apos;re considering building? Click &quot;Add an Idea&quot; to add it!
              </p>
              <AddIdea
                portalId={portalId}
                disableFixed={true}
                onboardingMode={true}
              />
              {/* Go to newly created portal button */}
              <button
                type='button'
                onClick={() => {
                  router.push(`/portal/${portalId}`);
                }}
                className='group relative mt-4 flex w-fit justify-center rounded-md border border-gray-900/20 bg-white py-3 px-4 text-sm font-medium text-gray-900 shadow-sm  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
              >
                Go to Portal
              </button>
            </Transition>
          )}
        </div>
        <div />
      </div>
    </>
  );
}
