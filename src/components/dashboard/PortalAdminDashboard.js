import React from 'react';
import Link from 'next/link';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';

const oldNav = [
  // { name: "Dashboard", href: "#", icon: HomeIcon, current: true },
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
export default function PortalAdminDashboard({ portalData }) {
  return (
    <>
      {/* Sidebar component, swap this element with another sidebar if you like */}
      <ul
        role='list'
        className='fixed hidden h-[calc(100vh-65px)] grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 px-6 lg:flex lg:w-52 lg:flex-col lg:justify-between lg:py-4 xl:w-64'
      >
        {/* <nav className="mt-10 flex flex-1 flex-col b"> */}
        {/* <ul role="list" className="flex flex-1 flex-col "> */}
        <li>
          <ul role='list' className='-mx-2 space-y-1'>
            {oldNav.map((item) => (
              <li key={item.name}>
                <a
                  href={item.href}
                  className={classNames(
                    item.current
                      ? 'bg-gray-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
                    'group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
                  )}
                >
                  <item.icon
                    className={classNames(
                      item.current
                        ? 'text-indigo-600'
                        : 'text-gray-400 group-hover:text-indigo-600',
                      'h-6 w-6 shrink-0'
                    )}
                    aria-hidden='true'
                  />
                  {item.name}
                </a>
              </li>
            ))}
          </ul>
        </li>
        <li className=''>
          <Link href='/dashboard/settings' legacyBehavior>
            <div className='group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:cursor-pointer hover:bg-gray-50 hover:text-indigo-600'>
              <Cog6ToothIcon
                className='h-6 w-6 shrink-0 text-gray-400 group-hover:text-indigo-600'
                aria-hidden='true'
              />
              Settings
            </div>
          </Link>
        </li>
        {/* </ul> */}
        {/* </nav> */}
      </ul>
      <main className='flex h-full w-screen items-center justify-center bg-gray-50 py-6 px-4 sm:py-8 lg:ml-52 lg:py-10 xl:ml-64'>
        <section className='flex w-full max-w-3xl flex-col gap-12 lg:w-5/6'>
          <div className='flex justify-center px-2 md:px-10 '>
            <div className='flex flex-col gap-4'>
              <h1 className='font-satoshi text-3xl font-medium tracking-tight text-gray-900 md:text-4xl'>
                Welcome to your admin dashboard!
              </h1>
              <p className='text-gray-500'>
                This is where you will manage your Deepform Portal. More to come
                soon! For now, you can access your portal by clicking &quot;Feature
                Requests&quot; in the navbar above!
              </p>
            </div>
          </div>
          <div className=''></div>
        </section>
      </main>
    </>
  );
}
