import Logo from "components/atoms/Logo";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createPortal, updateUser } from "util/db";
import AddIdea from "./AddIdea";
import { useAuth } from "util/auth";
import { useRouter } from "next/router";

export default function NewPortal() {
    const router = useRouter();
    const auth = useAuth();
    const { register, handleSubmit, watch, errors } = useForm();
    const [loading, setLoading] = useState(false);
    const [portalId, setPortalId] = useState(null);
    const [step, setStep] = useState(1);

    // If the user already has a portal, redirect to it
    if (auth.user?.portal_id) {
        router.push(`/portal/${auth.user.portal_id}`);
    }
    const onSubmit = (data) => {
        setLoading(true);
        createPortal({
            ...data,
            statuses: [
                {
                    name: "Under Consideration",
                    textColor: "text-yellow-500",
                    borderColor: "border-yellow-500",
                    description: "This feature is under consideration",
                    backgroundColor: "bg-yellow-100",
                },
                {
                    name: "Planned",
                    textColor: "text-blue-500",
                    borderColor: "border-blue-500",
                    description: "This feature is planned",
                    backgroundColor: "bg-blue-100",
                },
                {
                    name: "In Development",
                    textColor: "text-green-500",
                    borderColor: "border-green-500",
                    description: "This feature is in development",
                    backgroundColor: "bg-green-100",
                },
                {
                    name: "Launched",
                    textColor: "text-orange-500",
                    borderColor: "border-orange-500",
                    description: "This feature has been launched",
                    backgroundColor: "bg-orange-100",
                },
                {
                    name: "Not in Scope",
                    textColor: "text-red-500",
                    borderColor: "border-red-500",
                    description: "This feature is not in scope",
                    backgroundColor: "bg-red-100",
                },
            ],
        })
            .then(async (res) => {
                console.log("res", res);
                await updateUser(auth.user.uid, { portal_id: res[0].id });
                setPortalId(res[0].id);
                setStep(2);
                setLoading(false);
            })
            .catch((err) => {
                console.log("err", err);
                setLoading(false);
            });
    };

    return (
        <>
            {/*
          This example requires updating your template:
  
          ```
          <html class="h-full bg-gray-50">
          <body class="h-full">
          ```
        */}
            <div className="fixed flex h-screen min-h-full w-screen flex-1 flex-col items-center justify-between py-6 px-4 sm:px-6 lg:px-8">
                <div className="w-fit self-start">
                    <Logo />
                </div>
                <div className="flex w-full flex-col items-center justify-start gap-4 sm:w-96">
                    {step === 1 && (
                        <>
                            <h1 className="font-satoshi text-3xl font-medium tracking-tight text-gray-900">
                                Welcome!
                            </h1>
                            <p className="font-light text-gray-700">
                                Let's get started by creating your portal.
                            </p>
                            {/* Form that asks questions one by one, like Typeform */}
                            <form
                                className="mt-4 w-full space-y-6"
                                onSubmit={handleSubmit(onSubmit)}
                            >
                                <div className="flex flex-col gap-5 -space-y-px rounded-md shadow-sm">
                                    <div>
                                        <label
                                            htmlFor="portal-name"
                                            className="block text-sm font-medium leading-6 text-gray-900"
                                        >
                                            Portal Name
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                type="portal_name"
                                                name="portal_name"
                                                id="portal_name"
                                                className="sm:text-md block w-full rounded-md border-0  p-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400  focus:outline-indigo-600 focus:ring-0 focus:ring-inset focus:ring-indigo-600 sm:leading-6"
                                                placeholder="Your company/product..."
                                                ref={register({
                                                    required:
                                                        "Please enter a portal name",
                                                })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                        >
                                            {loading
                                                ? "Creating..."
                                                : "Create Portal"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <h1 className="font-satoshi text-3xl font-medium tracking-tight text-gray-900">
                                All set! 🥳
                            </h1>
                            <p className="text-center font-light text-gray-700">
                                Now, let's create your first feature request.
                                What's a feature you're considering building?
                            </p>
                            <AddIdea portalId={portalId} />
                            {/* Go to newly created portal button */}
                            <button
                                type="button"
                                onClick={() => {
                                    router.push(`/portal/${portalId}`);
                                }}
                                className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                Go to Portal
                            </button>
                        </>
                    )}
                </div>
                <div />
            </div>
        </>
    );
}
