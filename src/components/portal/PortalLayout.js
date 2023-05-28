import { Fragment, useState } from "react";
import { Disclosure, Menu, Transition, Dialog } from "@headlessui/react";
import {
    Bars3Icon,
    BellIcon,
    XMarkIcon,
    HomeIcon,
    UsersIcon,
    FolderIcon,
    CalendarIcon,
    DocumentDuplicateIcon,
    ChartPieIcon,
} from "@heroicons/react/24/outline";
import { PlusIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import { useAuth } from "util/auth";
import Link from "next/link";

function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}
const navigation = [
    { name: "Feature Requests", href: "#", icon: HomeIcon, current: true },
    // { name: "Team", href: "#", icon: UsersIcon, current: false },
    // { name: "Projects", href: "#", icon: FolderIcon, current: false },
    // { name: "Calendar", href: "#", icon: CalendarIcon, current: false },
    // {
    //     name: "Documents",
    //     href: "#",
    //     icon: DocumentDuplicateIcon,
    //     current: false,
    // },
    // { name: "Reports", href: "#", icon: ChartPieIcon, current: false },
];

export default function PortalLayout({ portalId }) {
    const auth = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (
        <>
            <Disclosure as="nav" className="bg-white border-b w-screen fixed top-0">
                {({ open }) => (
                    <>
                        <div className="mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex h-16 justify-between">
                                <div className="flex">
                                    <div className="-ml-2 mr-2 flex items-center lg:hidden">
                                        {/* Mobile menu button */}
                                        <button
                                            type="button"
                                            className="m-1 p-2.5 text-gray-700 lg:hidden"
                                            onClick={() => setSidebarOpen(true)}
                                        >
                                            <span className="sr-only">
                                                Open sidebar
                                            </span>
                                            <Bars3Icon
                                                className="h-6 w-6"
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </div>
                                    <div className="flex flex-shrink-0 items-center">
                                        <img
                                            className="block h-8 w-auto lg:hidden"
                                            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                                            alt="Your Company"
                                        />
                                        <img
                                            className="hidden h-8 w-auto lg:block"
                                            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                                            alt="Your Company"
                                        />
                                    </div>
                                    <div className="hidden lg:ml-6 lg:flex lg:space-x-8">
                                        {/* Current: "border-indigo-500 text-gray-900", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" */}
                                        <a
                                            href="#"
                                            className="inline-flex items-center border-b-2 border-indigo-500 px-1 pt-1 text-sm font-medium text-gray-900"
                                        >
                                            Feature Requests
                                        </a>
                                        {/* <a
                                        href="#"
                                        className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                    >
                                        Team
                                    </a>
                                    <a
                                        href="#"
                                        className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                    >
                                        Projects
                                    </a>
                                    <a
                                        href="#"
                                        className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                                    >
                                        Calendar
                                    </a> */}
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    {auth.user ? (
                                        <div className="flex items-center gap-x-4 lg:gap-x-6 ">
                                            {/* <div className="flex-shrink-0">
                                                <button
                                                    type="button"
                                                    className="relative inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                                >
                                                    <PlusIcon
                                                        className="-ml-0.5 h-5 w-5"
                                                        aria-hidden="true"
                                                    />
                                                    New Request
                                                </button>
                                            </div> */}
                                            {/* TODO: Notifications */}
                                            {/* <button
                                    type="button"
                                    className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
                                >
                                    <span className="sr-only">
                                        View notifications
                                    </span>
                                    <BellIcon
                                        className="h-6 w-6"
                                        aria-hidden="true"
                                    />
                                </button> */}

                                            {/* Profile dropdown */}
                                            <Menu as="div" className="relative">
                                                <Menu.Button className="ml-2 items-center p-1.5 hidden lg:flex">
                                                    <span className="sr-only">
                                                        Open user menu
                                                    </span>
                                                    {/* <img
                                            className="h-8 w-8 rounded-full bg-gray-50"
                                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                            alt=""
                                        /> */}
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="w-6 h-6"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                                                        />
                                                    </svg>

                                                    <span className="hidden lg:flex lg:items-center">
                                                        <span
                                                            className="ml-4 text-sm font-semibold leading-6 text-gray-900"
                                                            aria-hidden="true"
                                                        >
                                                            {auth.user?.name
                                                                ? auth.user.name
                                                                : "Account"}
                                                        </span>
                                                        <ChevronDownIcon
                                                            className="ml-2 h-5 w-5 text-gray-400"
                                                            aria-hidden="true"
                                                        />
                                                    </span>
                                                </Menu.Button>
                                                <Transition
                                                    as={Fragment}
                                                    enter="transition ease-out duration-100"
                                                    enterFrom="transform opacity-0 scale-95"
                                                    enterTo="transform opacity-100 scale-100"
                                                    leave="transition ease-in duration-75"
                                                    leaveFrom="transform opacity-100 scale-100"
                                                    leaveTo="transform opacity-0 scale-95"
                                                >
                                                    <Menu.Items className="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none">
                                                        {/* {userNavigation.map((item) => (
                                                <Menu.Item key={item.name}>
                                                    {({ active }) => (
                                                        <a
                                                            href={item.href}
                                                            className={classNames(
                                                                active
                                                                    ? "bg-gray-50"
                                                                    : "",
                                                                "block px-3 py-1 text-sm leading-6 text-gray-900"
                                                            )}
                                                        >
                                                            {item.name}
                                                        </a>
                                                    )}
                                                </Menu.Item>
                                            ))} */}
                                                        <Menu.Item key="settings">
                                                            {({ active }) => (
                                                                <Link href="/settings/general">
                                                                    <button
                                                                        className={classNames(
                                                                            active
                                                                                ? "bg-gray-50"
                                                                                : "",
                                                                            "block px-3 py-1 text-sm leading-6 text-gray-900"
                                                                        )}
                                                                    >
                                                                        Settings
                                                                    </button>
                                                                </Link>
                                                            )}
                                                        </Menu.Item>
                                                        <Menu.Item key="signout">
                                                            {({ active }) => (
                                                                <Link href="/auth/signout">
                                                                    <button
                                                                        className={classNames(
                                                                            active
                                                                                ? "bg-gray-50"
                                                                                : "",
                                                                            "block px-3 py-1 text-sm leading-6 text-gray-900"
                                                                        )}
                                                                        onClick={(
                                                                            e
                                                                        ) => {
                                                                            e.preventDefault();
                                                                            auth.signout();
                                                                        }}
                                                                    >
                                                                        Sign out
                                                                    </button>
                                                                </Link>
                                                            )}
                                                        </Menu.Item>
                                                    </Menu.Items>
                                                </Transition>
                                            </Menu>
                                        </div>
                                    ) : (
                                        <div>
                                            <Link
                                                href={`/auth/signin?next=/portal/${portalId}`}
                                            >
                                                <button
                                                    type="button"
                                                    className="mr-2 relative inline-flex items-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 border-[0.5px] border-gray-300 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                                >
                                                    Login
                                                    {/* <span aria-hidden="true">
                                                        &rarr;
                                                    </span> */}
                                                </button>
                                            </Link>
                                            <Link
                                                href={`/auth/signup?next=/portal/${portalId}`}
                                            >
                                                <button
                                                    type="button"
                                                    className="relative inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                                                >
                                                    Sign Up
                                                    {/* <span aria-hidden="true">
                                                        &rarr;
                                                    </span> */}
                                                </button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Transition.Root show={sidebarOpen} as={Fragment}>
                            <Dialog
                                as="div"
                                className="relative z-50 lg:hidden"
                                onClose={setSidebarOpen}
                            >
                                <Transition.Child
                                    as={Fragment}
                                    enter="transition-opacity ease-linear duration-300"
                                    enterFrom="opacity-0"
                                    enterTo="opacity-100"
                                    leave="transition-opacity ease-linear duration-300"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <div className="fixed inset-0 bg-gray-900/80" />
                                </Transition.Child>

                                <div className="fixed inset-0 flex">
                                    <Transition.Child
                                        as={Fragment}
                                        enter="transition ease-in-out duration-300 transform"
                                        enterFrom="-translate-x-full"
                                        enterTo="translate-x-0"
                                        leave="transition ease-in-out duration-300 transform"
                                        leaveFrom="translate-x-0"
                                        leaveTo="-translate-x-full"
                                    >
                                        <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                                            <Transition.Child
                                                as={Fragment}
                                                enter="ease-in-out duration-300"
                                                enterFrom="opacity-0"
                                                enterTo="opacity-100"
                                                leave="ease-in-out duration-300"
                                                leaveFrom="opacity-100"
                                                leaveTo="opacity-0"
                                            >
                                                <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                                                    <button
                                                        type="button"
                                                        className="-m-2.5 p-2.5"
                                                        onClick={() =>
                                                            setSidebarOpen(
                                                                false
                                                            )
                                                        }
                                                    >
                                                        <span className="sr-only">
                                                            Close sidebar
                                                        </span>
                                                        <XMarkIcon
                                                            className="h-6 w-6 text-white"
                                                            aria-hidden="true"
                                                        />
                                                    </button>
                                                </div>
                                            </Transition.Child>
                                            {/* Sidebar component, swap this element with another sidebar if you like */}
                                            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
                                                <div className="flex h-16 shrink-0 items-center">
                                                    <img
                                                        className="h-8 w-auto"
                                                        src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                                                        alt="Your Company"
                                                    />
                                                </div>
                                                <nav className="flex flex-1 flex-col">
                                                    <ul
                                                        role="list"
                                                        className="flex flex-1 flex-col gap-y-7"
                                                    >
                                                        <li>
                                                            <ul
                                                                role="list"
                                                                className="-mx-2 space-y-1"
                                                            >
                                                                {navigation.map(
                                                                    (item) => (
                                                                        <li
                                                                            key={
                                                                                item.name
                                                                            }
                                                                        >
                                                                            <a
                                                                                href={
                                                                                    item.href
                                                                                }
                                                                                className={classNames(
                                                                                    item.current
                                                                                        ? "bg-gray-50 text-indigo-600"
                                                                                        : "text-gray-700 hover:text-indigo-600 hover:bg-gray-50",
                                                                                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                                                                                )}
                                                                            >
                                                                                <item.icon
                                                                                    className={classNames(
                                                                                        item.current
                                                                                            ? "text-indigo-600"
                                                                                            : "text-gray-400 group-hover:text-indigo-600",
                                                                                        "h-6 w-6 shrink-0"
                                                                                    )}
                                                                                    aria-hidden="true"
                                                                                />
                                                                                {
                                                                                    item.name
                                                                                }
                                                                            </a>
                                                                        </li>
                                                                    )
                                                                )}
                                                            </ul>
                                                        </li>
                                                    </ul>
                                                </nav>
                                            </div>
                                        </Dialog.Panel>
                                    </Transition.Child>
                                </div>
                            </Dialog>
                        </Transition.Root>
                        <Disclosure.Panel className="md:hidden">
                            <div className="space-y-1 pb-3 pt-2">
                                {/* Current: "bg-indigo-50 border-indigo-500 text-indigo-700", Default: "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700" */}
                                <Disclosure.Button
                                    as="a"
                                    href="#"
                                    className="block border-l-4 border-indigo-500 bg-indigo-50 py-2 pl-3 pr-4 text-base font-medium text-indigo-700 sm:pl-5 sm:pr-6"
                                >
                                    Feature Requests
                                </Disclosure.Button>
                                {/* <Disclosure.Button
                                as="a"
                                href="#"
                                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 sm:pl-5 sm:pr-6"
                            >
                                Team
                            </Disclosure.Button>
                            <Disclosure.Button
                                as="a"
                                href="#"
                                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 sm:pl-5 sm:pr-6"
                            >
                                Projects
                            </Disclosure.Button>
                            <Disclosure.Button
                                as="a"
                                href="#"
                                className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 sm:pl-5 sm:pr-6"
                            >
                                Calendar
                            </Disclosure.Button> */}
                            </div>
                            <div className="border-t border-gray-200 pb-3 pt-4">
                                <div className="flex items-center px-4 sm:px-6">
                                    <div className="flex-shrink-0">
                                        <img
                                            className="h-10 w-10 rounded-full"
                                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                            alt=""
                                        />
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-base font-medium text-gray-800">
                                            Tom Cook
                                        </div>
                                        <div className="text-sm font-medium text-gray-500">
                                            tom@example.com
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className="ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        <span className="sr-only">
                                            View notifications
                                        </span>
                                        <BellIcon
                                            className="h-6 w-6"
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>
                                <div className="mt-3 space-y-1">
                                    <Disclosure.Button
                                        as="a"
                                        href="#"
                                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6"
                                    >
                                        Your Profile
                                    </Disclosure.Button>
                                    <Disclosure.Button
                                        as="a"
                                        href="#"
                                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6"
                                    >
                                        Settings
                                    </Disclosure.Button>
                                    <Disclosure.Button
                                        as="a"
                                        href="#"
                                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6"
                                    >
                                        Sign out
                                    </Disclosure.Button>
                                </div>
                            </div>
                        </Disclosure.Panel>
                    </>
                )}
            </Disclosure>
        </>
    );
}
