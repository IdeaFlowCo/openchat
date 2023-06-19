import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { useAuth } from "util/auth";
import { toast } from "react-hot-toast";
import { updateUser } from "util/db";

interface AuthModalProps {
    open: boolean;
    setOpenAuthModal: (arg0: boolean) => void;
}
export default function AuthModal({ open, setOpenAuthModal }: AuthModalProps) {
    const auth = useAuth();

    const [authType, setAuthType] = useState("signup");
    const [pending, setPending] = useState(false);
    const { handleSubmit, register, errors, getValues } = useForm();

    const submitHandlersByType = {
        signin: ({ email, pass }) => {
            return auth.signin(email, pass).then((user) => {
                setPending(false);
                setOpenAuthModal(false);
                // // Call auth complete handler
                // props.onAuth(user);
            });
        },
        signup: ({ name, email, pass }) => {
            return auth.signup(email, pass).then(async (user) => {
                console.log("user", user);
                // Add display name
                await updateUser(user.id, {
                    name: name,
                });
                setPending(false);
                setOpenAuthModal(false);
                // // Call auth complete handler
                // props.onAuth(user);
            });
        },
        forgotpass: ({ email }) => {
            return auth.sendPasswordResetEmail(email).then(() => {
                setPending(false);
                // // Show success alert message
                // props.onFormAlert({
                //     type: "success",
                //     message: "Password reset email sent",
                // });
                toast.success("Password reset email sent");
            });
        },
        changepass: ({ pass }) => {
            return auth.confirmPasswordReset(pass).then(() => {
                setPending(false);
                // Show success alert message
                // props.onFormAlert({
                //     type: "success",
                //     message: "Your password has been changed",
                // });
                toast.success("Your password has been changed");
            });
        },
    };

    // Handle form submission
    const onSubmit = ({ name, email, pass }) => {
        // Show pending indicator
        setPending(true);

        // Call submit handler for auth type
        submitHandlersByType[authType]({
            name,
            email,
            pass,
        }).catch((error) => {
            setPending(false);
            // // Show error alert message
            // props.onFormAlert({
            //     type: "error",
            //     message: error.message,
            // });
            toast.error(error.message);
        });
    };

    // To fix this: https://stackoverflow.com/questions/54954385/react-useeffect-causing-cant-perform-a-react-state-update-on-an-unmounted-comp
    useEffect(() => {
        return () => {
            setPending(false);
            setOpenAuthModal(false);
        };
    }, []);

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-10"
                onClose={setOpenAuthModal}
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"/>
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="container relative mx-auto max-w-sm transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-center shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                                <h1 className="mb-6 font-satoshi text-3xl font-medium tracking-tight">
                                    {authType === "signup"
                                        ? "Sign up to continue!"
                                        : authType === "signin"
                                        ? "Sign in to continue!"
                                        : authType === "forgotpass"
                                        ? "Forgot Password"
                                        : authType === "changepass"
                                        ? "Change Password"
                                        : "Submit"}
                                </h1>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    {["signup"].includes(authType) && (
                                        <div className="mb-2">
                                            <input
                                                className="w-full rounded border border-gray-300 bg-white py-1 px-3 leading-8 outline-none focus:border-indigo-500 focus:ring-1"
                                                name="name"
                                                type="name"
                                                placeholder="Full Name"
                                                ref={register({
                                                    required:
                                                        "Please enter your full name",
                                                })}
                                            />

                                            {errors.name && (
                                                <p className="mt-1 text-left text-sm text-red-600">
                                                    {errors.name.message}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    {[
                                        "signup",
                                        "signin",
                                        "forgotpass",
                                    ].includes(authType) && (
                                        <div className="mb-2">
                                            <input
                                                className="w-full rounded border border-gray-300 bg-white py-1 px-3 leading-8 outline-none focus:border-indigo-500 focus:ring-1"
                                                name="email"
                                                type="email"
                                                placeholder="Email"
                                                ref={register({
                                                    required:
                                                        "Please enter an email",
                                                })}
                                            />

                                            {errors.email && (
                                                <p className="mt-1 text-left text-sm text-red-600">
                                                    {errors.email.message}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {[
                                        "signup",
                                        "signin",
                                        "changepass",
                                    ].includes(authType) && (
                                        <div className="mb-2">
                                            <input
                                                className="w-full rounded border border-gray-300 bg-white py-1 px-3 leading-8 outline-none focus:border-indigo-500 focus:ring-1"
                                                name="pass"
                                                type="password"
                                                placeholder="Password"
                                                ref={register({
                                                    required:
                                                        "Please enter a password",
                                                })}
                                            />

                                            {errors.pass && (
                                                <p className="mt-1 text-left text-sm text-red-600">
                                                    {errors.pass.message}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {["signup", "changepass"].includes(
                                        authType
                                    ) && (
                                        <div className="mb-2">
                                            <input
                                                className="w-full rounded border border-gray-300 bg-white py-1 px-3 leading-8 outline-none focus:border-indigo-500 focus:ring-1"
                                                name="confirmPass"
                                                type="password"
                                                placeholder="Confirm Password"
                                                ref={register({
                                                    required:
                                                        "Please enter your password again",
                                                    validate: (value) => {
                                                        if (
                                                            value ===
                                                            getValues().pass
                                                        ) {
                                                            return true;
                                                        } else {
                                                            return "This doesn't match your password";
                                                        }
                                                    },
                                                })}
                                            />

                                            {errors.confirmPass && (
                                                <p className="mt-1 text-left text-sm text-red-600">
                                                    {errors.confirmPass.message}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <button
                                        className="w-full rounded border-0 bg-indigo-600 py-2 px-4 text-white hover:bg-indigo-500 focus:outline-none"
                                        type="submit"
                                        disabled={pending}
                                    >
                                        {pending
                                            ? "..."
                                            : authType === "signup"
                                            ? "Sign Up"
                                            : authType === "signin"
                                            ? "Sign In"
                                            : authType === "forgotpass"
                                            ? "Send Reset Email"
                                            : authType === "changepass"
                                            ? "Change Password"
                                            : "Submit"}
                                    </button>
                                </form>
                                {/* AUTH MODAL FOOTER */}
                                <div className="mt-6 px-3 text-sm">
                                    {authType === "signup" && (
                                        <>
                                            <div className="mb-3">
                                                By signing up, you are agreeing
                                                to our{" "}
                                                <a
                                                    href={
                                                        "/legal/terms-of-service"
                                                    }
                                                    target="_blank"
                                                    className="text-indigo-600"
                                                >
                                                    Terms of Service
                                                </a>{" "}
                                                and{" "}
                                                <a
                                                    href={
                                                        "/legal/privacy-policy"
                                                    }
                                                    target="_blank"
                                                    className="text-indigo-600"
                                                >
                                                    Privacy Policy
                                                </a>
                                                .
                                            </div>
                                            Already have an account?
                                            <button
                                                onClick={() =>
                                                    setAuthType("signin")
                                                }
                                                className="ml-3 text-indigo-600"
                                            >
                                                Sign in
                                            </button>
                                        </>
                                    )}

                                    {authType === "signin" && (
                                        <>
                                            <button
                                                onClick={() =>
                                                    setAuthType("signup")
                                                }
                                                className="text-indigo-600"
                                            >
                                                Create an account
                                            </button>

                                            <button
                                                onClick={() =>
                                                    setAuthType("forgotpass")
                                                }
                                                className="ml-4 text-indigo-600"
                                            >
                                                Forgot Password?
                                            </button>
                                        </>
                                    )}

                                    {authType === "forgotpass" && (
                                        <>
                                            Remember it after all?
                                            <button
                                                onClick={() =>
                                                    setAuthType("signin")
                                                }
                                                className="ml-3 text-indigo-600"
                                            >
                                                Sign in
                                            </button>
                                        </>
                                    )}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
