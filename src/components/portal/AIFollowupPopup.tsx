import React, { useRef, useState } from "react";
import { Transition, Dialog } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { useAuth } from "util/auth";
import { useRouter } from "next/router";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function AIFollowupPopup({ }) {
    

    return (
        <Transition appear={true} show={true}>
            <Dialog
                as="div"
                className="overflow-y-auto fixed inset-0 z-10"
                onClose={() => null}
            >
                <div className="px-4 min-h-screen text-center">
                    <Transition.Child
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75" />
                    </Transition.Child>
                    <span
                        className="inline-block h-screen align-middle"
                        aria-hidden="true"
                    >
                        &#8203;
                    </span>
                    <Transition.Child
                        as={React.Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="inline-block overflow-hidden p-6 my-8 w-full max-w-3xl text-left align-middle bg-white rounded-2xl shadow-xl transition-all transform">
                            <Dialog.Title
                                as="h3"
                                className="text-lg font-medium leading-6 text-gray-900"
                            >
                                Followup Questions
                            </Dialog.Title>
                            
                                
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
}

