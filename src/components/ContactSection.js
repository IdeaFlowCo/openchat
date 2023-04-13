import React, { useState } from "react";
import { useForm } from "react-hook-form";
import contact from "util/contact";
import Link from "next/link";
import AbstractBg from "./AbstractBg";

function ContactSection(props) {
    const [pending, setPending] = useState(false);
    const [formAlert, setFormAlert] = useState(null);
    const { handleSubmit, register, errors, reset } = useForm();

    const onSubmit = (data) => {
        // Show pending indicator
        setPending(true);

        contact
            .submit(data)
            .then(() => {
                // Clear form
                reset();
                // Show success alert message
                setFormAlert({
                    type: "success",
                    message: "Your message has been sent!",
                });
            })
            .catch((error) => {
                // Show error alert message
                setFormAlert({
                    type: "error",
                    message: error.message,
                });
            })
            .finally(() => {
                // Hide pending indicator
                setPending(false);
            });
    };

    return (
        <section className="py-12 px-4 bg-white">
          <AbstractBg />
            <div className="container mx-auto max-w-2xl">
                <div className="py-12 lg:pb-20">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-2xl text-center">
                            <h1 className="font-satoshi text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                                We're building the future of user research.
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-gray-600">
                                Scalable, affordable, and 100x faster. Talk to us anytime!
                            </p>
                        </div>
                    </div>
                </div>

                {formAlert && (
                    <div
                        className={
                            "mb-4" +
                            (formAlert.type === "error"
                                ? " text-red-600"
                                : "") +
                            (formAlert.type === "success"
                                ? " text-green-600"
                                : "")
                        }
                    >
                        {formAlert.message}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <input
                            className="py-1 px-3 w-full leading-8 bg-white rounded border border-gray-300 outline-none focus:border-blue-500 focus:ring-1"
                            name="email"
                            type="email"
                            placeholder="Email"
                            ref={register({
                                required: "Please enter your email",
                            })}
                        />

                        {errors.email && (
                            <p className="mt-1 text-sm text-left text-red-600">
                                {errors.email.message}
                            </p>
                        )}
                    </div>
                    <div className="mt-3">
                        <textarea
                            className="py-1 px-3 w-full leading-8 bg-white rounded border border-gray-300 outline-none focus:border-blue-500 focus:ring-1"
                            name="message"
                            placeholder="Message"
                            ref={register({
                                required: "Please enter a message",
                            })}
                        />

                        {errors.message && (
                            <p className="mt-1 text-sm text-left text-red-600">
                                {errors.message.message}
                            </p>
                        )}
                    </div>
                    <button
                        className="py-2 px-4 mt-2 text-white bg-blue-500 rounded border-0 hover:bg-blue-600 focus:outline-none"
                        type="submit"
                        disabled={pending}
                    >
                        {pending ? "..." : "Send message"}
                    </button>
                </form>
            </div>
        </section>
    );
}

export default ContactSection;
