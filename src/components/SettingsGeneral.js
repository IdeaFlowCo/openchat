import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from 'util/auth';

function SettingsGeneral(props) {
  const auth = useAuth();
  const [pending, setPending] = useState(false);

  const { register, handleSubmit, errors } = useForm();

  const onSubmit = (data) => {
    // Show pending indicator
    setPending(true);

    return auth
      .updateProfile(data)
      .then(() => {
        // Set success status
        props.onStatus({
          type: 'success',
          message: 'Your profile has been updated',
        });
      })
      .catch((error) => {
        if (error.code === 'auth/requires-recent-login') {
          props.onStatus({
            type: 'requires-recent-login',
            // Resubmit after reauth flow
            callback: () => onSubmit(data),
          });
        } else {
          // Set error status
          props.onStatus({
            type: 'error',
            message: error.message,
          });
        }
      })
      .finally(() => {
        // Hide pending indicator
        setPending(false);
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        Name
        <input
          className='mt-1 w-full rounded border border-gray-300 bg-white py-1 px-3 leading-8 outline-none focus:border-indigo-500 focus:ring-1'
          name='name'
          type='text'
          placeholder='Name'
          defaultValue={auth.user.name}
          ref={register({
            required: 'Please enter your name',
          })}
        />
        {errors.name && (
          <p className='mt-1 text-left text-sm text-red-600'>
            {errors.name.message}
          </p>
        )}
      </div>
      <div className='mt-3'>
        Email
        <input
          className='mt-1 w-full rounded border border-gray-300 bg-white py-1 px-3 leading-8 outline-none focus:border-indigo-500 focus:ring-1'
          name='email'
          type='email'
          placeholder='Email'
          defaultValue={auth.user.email}
          ref={register({
            required: 'Please enter your email',
          })}
        />
        {errors.email && (
          <p className='mt-1 text-left text-sm text-red-600'>
            {errors.email.message}
          </p>
        )}
      </div>
      <button
        className='mt-4 w-full rounded border-0 bg-indigo-500 py-2 px-4 text-white hover:bg-indigo-600 focus:outline-none'
        type='submit'
        disabled={pending}
      >
        {pending ? '...' : 'Save'}
      </button>
    </form>
  );
}

export default SettingsGeneral;
