import React, { useState } from 'react';
import { useRouter } from 'next/router';
import AuthForm from './AuthForm';
import AuthSocial from './AuthSocial';

function Auth({
  redirect = true,
  afterAuthPath,
  type,
  buttonAction,
  providers,
}) {
  const router = useRouter();
  const [formAlert, setFormAlert] = useState(null);

  const handleAuth = (user) => {
    if (redirect) {
      router.push(afterAuthPath);
    }
  };

  const handleFormAlert = (data) => {
    setFormAlert(data);
  };

  return (
    <>
      {formAlert && (
        <div
          className={
            'mb-4' +
            (formAlert.type === 'error' ? ' text-red-600' : '') +
            (formAlert.type === 'success' ? ' text-green-600' : '')
          }
        >
          {formAlert.message}
        </div>
      )}

      <AuthForm
        type={type}
        buttonAction={buttonAction}
        onAuth={handleAuth}
        onFormAlert={handleFormAlert}
      />

      {/* {["signup", "signin"].includes(props.type) && (
        <>
          {props.providers && props.providers.length && (
            <AuthSocial
              buttonAction={props.buttonAction}
              providers={props.providers}
              showLastUsed={true}
              onAuth={handleAuth}
              onError={(message) => {
                handleFormAlert({
                  type: "error",
                  message: message,
                });
              }}
            />
          )}
        </>
      )} */}
    </>
  );
}

export default Auth;
