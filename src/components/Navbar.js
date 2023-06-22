import { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Logo from "./atoms/Logo";
import Link from "next/link";
import { useAuth } from "util/auth";
import { useRouter } from "next/router";

// const navigation = [
//     { name: "Product", href: "#" },
//     { name: "Features", href: "#" },
//     { name: "Marketplace", href: "#" },
//     { name: "Company", href: "#" },
// ];

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const auth = useAuth();
    const router = useRouter();

    // UseEffect to close mobile menu when user clicks a Link
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [router.pathname]);

    // If the url is /forms/[id] then we are on a form page. Don't show navbar.
    if (
        router.pathname.startsWith("/form") ||
        router.pathname.startsWith("/dashboard") ||
        router.pathname.startsWith("/portal") ||
        router.pathname.startsWith("/auth") ||
        router.pathname.startsWith("/chat")
    ) {
        return null;
    }

    return (
        // <div className="bg-transparent">
        <header className="relative z-50">
            <nav
                className="flex items-center justify-between p-6 lg:px-20"
                aria-label="Global"
            >
                <div className="flex lg:flex-1">
                    <span className="sr-only">TalkToGPT</span>
                    {/* <img
                                className="h-8 w-auto"
                                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                                alt=""
                            /> */}
                    <Logo />
                </div>
                <div className="flex lg:hidden">
                    <button
                        type="button"
                        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <span className="sr-only">Open main menu</span>
                        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                    </button>
                </div>
                <div className="hidden lg:flex lg:gap-x-12">
                    {/* {navigation.map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                            className="text-sm font-semibold leading-6 text-gray-900"
                        >
                            {item.name}
                        </a>
                    ))} */}
                    <Link href="/about">
                        <button className="text-sm font-semibold leading-6 text-gray-900">
                            About
                        </button>
                    </Link>
                    {/* <a
                        href="https://deepform.ai/form/36"
                        target="_blank"
                        className="text-sm font-semibold leading-6 text-gray-900"
                    >
                        Demo Deepform
                    </a> */}

                    {/* {(!auth.user || !auth.user.stripeSubscriptionId) && ( */}
                    {/* <Link href="/pricing">
                        <button className="text-sm font-semibold leading-6 text-gray-900">
                            Pricing
                        </button>
                    </Link> */}
                    {/* )} */}
                    <Link href="/chat">
                        <button className="text-sm font-semibold leading-6 text-gray-900">
                            Chat
                        </button>
                    </Link>
                    {auth.user && (
                        <>
                            <Link href="/settings/general">
                                <button className="text-sm font-semibold leading-6 text-gray-900">
                                    Settings
                                </button>
                            </Link>
                        </>
                    )}
                </div>
                <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                    {/* <a
                        href="#"
                        className="text-sm font-semibold leading-6 text-gray-900"
                    >
                        Log in <span aria-hidden="true">&rarr;</span>
                    </a> */}
                    {!auth.user ? (
                        <Link href="/auth/signin">
                            <button className="text-sm font-semibold leading-6 text-gray-900">
                                Sign in <span aria-hidden="true">&rarr;</span>
                            </button>
                        </Link>
                    ) : (
                        <Link href="/auth/signout">
                            <button
                                className="text-sm font-semibold leading-6 text-gray-900"
                                onClick={(e) => {
                                    e.preventDefault();
                                    auth.signout();
                                }}
                            >
                                Sign out
                            </button>
                        </Link>
                    )}
                </div>
            </nav>
            <Dialog
                as="div"
                className="lg:hidden"
                open={mobileMenuOpen}
                onClose={setMobileMenuOpen}
            >
                <div className="fixed inset-0 z-50" />
                <Dialog.Panel className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                    <div className="flex items-center justify-between">
                        <span className="sr-only">TalkToGPT</span>
                        {/* <img
                                    className="h-8 w-auto"
                                    src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                                    alt=""
                                /> */}
                        <Logo />
                        <button
                            type="button"
                            className="-m-2.5 rounded-md p-2.5 text-gray-700"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="sr-only">Close menu</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                    <div className="mt-6 flow-root">
                        <div className="-my-6 divide-y divide-gray-500/10">
                            <div className="space-y-2 py-6">
                                <Link href="/about">
                                    <button className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                                        About
                                    </button>
                                </Link>

                                {/* <a
                                    href="https://deepform.ai/portal/10"
                                    target="_blank"
                                    className="-mx-3 flex items-center justify-start gap-2 rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                >
                                    See our portal
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="mt-[0.5px] h-4 w-4"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                                            clipRule="evenodd"
                                        />
                                        <path
                                            fillRule="evenodd"
                                            d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </a> */}

                                {/* {(!auth.user || !auth.user.stripeSubscriptionId) && ( */}
                                {/* <Link href="/pricing">
                                    <button className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                                        Pricing
                                    </button>
                                </Link> */}
                                {/* )} */}
                                <Link href="/chat">
                                    <button className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                                        Chat
                                    </button>
                                </Link>
                                {auth.user && (
                                    <>
                                        <Link href="/settings/general">
                                            <button className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                                                Settings
                                            </button>
                                        </Link>
                                    </>
                                )}
                            </div>
                            <div className="py-6">
                                {!auth.user ? (
                                    <Link href="/auth/signin">
                                        <button className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                                            Sign in
                                        </button>
                                    </Link>
                                ) : (
                                    <Link href="/auth/signout">
                                        <button
                                            className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                auth.signout();
                                            }}
                                        >
                                            Sign out
                                        </button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </Dialog.Panel>
            </Dialog>
        </header>
        // </div>
    );
}
