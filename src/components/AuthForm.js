import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "util/auth";
import { updateUser } from "util/db";

function AuthForm(props) {
    const auth = useAuth();

    const [pending, setPending] = useState(false);
    const { handleSubmit, register, errors, getValues } = useForm();

    const submitHandlersByType = {
        signin: ({ email, pass }) => {
            return auth.signin(email, pass).then((user) => {
                // Call auth complete handler
                props.onAuth(user);
            });
        },
        signup: ({ name, email, pass }) => {
            return auth.signup(email, pass).then(async (user) => {
                console.log("user", user);
                // Add display name
                await updateUser(user.id, {
                    name: name,
                });
                // Call auth complete handler
                props.onAuth(user);
            });
        },
        forgotpass: ({ email }) => {
            return auth.sendPasswordResetEmail(email).then(() => {
                setPending(false);
                // Show success alert message
                props.onFormAlert({
                    type: "success",
                    message: "Password reset email sent",
                });
            });
        },
        changepass: ({ pass }) => {
            return auth.confirmPasswordReset(pass).then(() => {
                setPending(false);
                // Show success alert message
                props.onFormAlert({
                    type: "success",
                    message: "Your password has been changed",
                });
            });
        },
    };

    // Handle form submission
    const onSubmit = ({ name, email, pass }) => {
        // Show pending indicator
        setPending(true);

        // Call submit handler for auth type
        submitHandlersByType[props.type]({
            name,
            email,
            pass,
        }).catch((error) => {
            setPending(false);
            // Show error alert message
            props.onFormAlert({
                type: "error",
                message: error.message,
            });
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {["signup"].includes(props.type) && (
                <div className="flex flex-col items-start">
                    <label
                        htmlFor="name"
                        className="hidden text-sm font-medium leading-6 text-gray-900"
                    >
                        Full Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        placeholder="Full Name"
                        ref={register({
                            required: "Please enter your name",
                        })}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                    {errors.name && (
                        <p className="mt-1 text-left text-sm text-red-600">
                            {errors.name.message}
                        </p>
                    )}
                </div>
                // <div className="mb-2">
                //     <input
                //         className="w-full rounded border border-gray-300 bg-white py-1 px-3 leading-8 outline-none focus:border-indigo-500 focus:ring-1"
                //         name="name"
                //         type="text"
                //         placeholder="Full Name"
                //         ref={register({
                //             required: "Please enter your name",
                //         })}
                //     />

                //     {errors.name && (
                //         <p className="mt-1 text-left text-sm text-red-600">
                //             {errors.name.message}
                //         </p>
                //     )}
                // </div>
            )}
            {["signup", "signin", "forgotpass"].includes(props.type) && (
                // <div className="mb-2">
                //     <input
                //         className="w-full rounded border border-gray-300 bg-white py-1 px-3 leading-8 outline-none focus:border-indigo-500 focus:ring-1"
                //         name="email"
                //         type="email"
                //         placeholder="Email"
                //         ref={register({
                //             required: "Please enter an email",
                //         })}
                //     />

                //     {errors.email && (
                //         <p className="mt-1 text-left text-sm text-red-600">
                //             {errors.email.message}
                //         </p>
                //     )}
                // </div>
                <div className="flex flex-col items-start">
                    <label
                        htmlFor="email"
                        className="hidden text-sm font-medium leading-6 text-gray-900"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="Email"
                        ref={register({
                            required: "Please enter your email",
                        })}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                    {errors.email && (
                        <p className="mt-1 text-left text-sm text-red-600">
                            {errors.email.message}
                        </p>
                    )}
                </div>
            )}

            {["signup", "signin", "changepass"].includes(props.type) && (
                // <div className="mb-2">
                //     <input
                //         className="w-full rounded border border-gray-300 bg-white py-1 px-3 leading-8 outline-none focus:border-indigo-500 focus:ring-1"
                //         name="pass"
                //         type="password"
                //         placeholder="Password"
                //         ref={register({
                //             required: "Please enter a password",
                //         })}
                //     />

                //     {errors.pass && (
                //         <p className="mt-1 text-left text-sm text-red-600">
                //             {errors.pass.message}
                //         </p>
                //     )}
                // </div>
                <div className="flex flex-col items-start">
                    <label
                        htmlFor="pass"
                        className="hidden text-sm font-medium leading-6 text-gray-900"
                    >
                        Password
                    </label>
                    <input
                        id="pass"
                        name="pass"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Password"
                        ref={register({
                            required: "Please enter a password",
                        })}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                    {errors.pass && (
                        <p className="mt-1 text-left text-sm text-red-600">
                            {errors.pass.message}
                        </p>
                    )}
                </div>
            )}

            {["signup", "changepass"].includes(props.type) && (
                // <div className="mb-2">
                //     <input
                //         className="w-full rounded border border-gray-300 bg-white py-1 px-3 leading-8 outline-none focus:border-indigo-500 focus:ring-1"
                //         name="confirmPass"
                //         type="password"
                //         placeholder="Confirm Password"
                //         ref={register({
                //             required: "Please enter your password again",
                //             validate: (value) => {
                //                 if (value === getValues().pass) {
                //                     return true;
                //                 } else {
                //                     return "This doesn't match your password";
                //                 }
                //             },
                //         })}
                //     />

                //     {errors.confirmPass && (
                //         <p className="mt-1 text-left text-sm text-red-600">
                //             {errors.confirmPass.message}
                //         </p>
                //     )}
                // </div>
                <div className="flex flex-col items-start">
                    <label
                        htmlFor="confirmPass"
                        className="hidden text-sm font-medium leading-6 text-gray-900"
                    >
                        Confirm Password
                    </label>
                    <input
                        id="confirmPass"
                        name="confirmPass"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Confirm Password"
                        ref={register({
                            required: "Please confirm your password",
                        })}
                        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    />
                    {errors.confirmPass && (
                        <p className="mt-1 text-left text-sm text-red-600">
                            {errors.confirmPass.message}
                        </p>
                    )}
                </div>
            )}

            <button
                className="mt-4 flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                type="submit"
                disabled={pending}
            >
                {pending ? "..." : props.buttonAction}
            </button>
        </form>
    );
}

export default AuthForm;
