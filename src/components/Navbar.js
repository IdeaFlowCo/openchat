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
        router.pathname.startsWith("/dashboard")
    ) {
        return null;
    }

    return (
        // <div className="bg-transparent">
        <header className="z-50 relative">
            <nav
                className="flex items-center justify-between p-6 lg:px-20"
                aria-label="Global"
            >
                <div className="flex lg:flex-1">
                    <span className="sr-only">Deepform</span>
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

                    {/* {(!auth.user || !auth.user.stripeSubscriptionId) && ( */}
                    <Link href="/pricing">
                        <button className="text-sm font-semibold leading-6 text-gray-900">
                            Pricing
                        </button>
                    </Link>
                    {/* )} */}

                    {auth.user && (
                        <>
                            <Link href="/dashboard">
                                <button className="text-sm font-semibold leading-6 text-gray-900">
                                    Dashboard
                                </button>
                            </Link>
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
                        <span className="sr-only">Deepform</span>
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

                                {(!auth.user ||
                                    !auth.user.stripeSubscriptionId) && (
                                    <Link href="/pricing">
                                        <button className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                                            Pricing
                                        </button>
                                    </Link>
                                )}

                                {auth.user && (
                                    <>
                                        <Link href="/dashboard">
                                            <button className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                                                Dashboard
                                            </button>
                                        </Link>
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
