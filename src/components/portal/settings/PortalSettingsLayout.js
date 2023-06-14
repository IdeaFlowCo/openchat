import React from "react";
import Link from "next/link";
import { Cog6ToothIcon, HomeIcon } from "@heroicons/react/24/outline";
const desktopSidebarNav = [
    { name: "General", href: "/dashboard/settings" },
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

const classNames = (...classes) => {
    return classes.filter(Boolean).join(" ");
};

export default function PortalSettingsLayout({
    children,
    portalData,
    currentPage = "General",
}) {
    return (
        <>
            {/* Sidebar component, swap this element with another sidebar if you like */}
            <ul
                role="list"
                className="fixed hidden h-[calc(100vh-65px)] grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 px-6 lg:flex lg:w-52 lg:flex-col lg:justify-between lg:py-4 xl:w-64"
            >
                <li>
                    <ul role="list" className="-mx-2 space-y-1">
                        {desktopSidebarNav.map((item) => (
                            <li key={item.name}>
                                <Link href={item.href}>
                                    <button
                                        className={classNames(
                                            item.name === currentPage
                                                ? "bg-gray-50 text-indigo-600"
                                                : "text-gray-700 hover:bg-gray-50 hover:text-indigo-600",
                                            "group flex w-full gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 "
                                        )}
                                    >
                                        {/* <item.icon
                                        className={classNames(
                                            item.current
                                                ? "text-indigo-600"
                                                : "text-gray-400 group-hover:text-indigo-600",
                                            "h-6 w-6 shrink-0"
                                        )}
                                        aria-hidden="true"
                                    /> */}
                                        {item.name}
                                    </button>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </li>
                {/* <li className="">
                    <Link href="/dashboard/settings">
                        <div className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:cursor-pointer hover:bg-gray-50 hover:text-indigo-600">
                            <Cog6ToothIcon
                                className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-indigo-600"
                                aria-hidden="true"
                            />
                            Settings
                        </div>
                    </Link>
                </li> */}
            </ul>
            <main className="flex h-fit min-h-[100vh] w-screen items-start justify-center bg-gray-50 py-6 px-4 sm:py-8 lg:ml-52 lg:py-10 xl:ml-64">
                <section className="flex w-full max-w-3xl flex-col gap-12 lg:w-5/6">
                    {children}
                </section>
            </main>
        </>
    );
}
