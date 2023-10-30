import { Fragment, useState, useEffect } from 'react';
import { Disclosure, Menu, Transition, Dialog } from '@headlessui/react';
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
  LightBulbIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { PlusIcon, ChevronDownIcon } from '@heroicons/react/20/solid';

import { useAuth } from 'util/auth';
import Link from 'next/link';
import Logo from 'components/atoms/Logo';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function PortalLayout({
  portalData,
  children,
  adminMode,
  currentPage = 'Feature Requests',
}) {
  const auth = useAuth();

  const [desktopNavigation, setDesktopNavigation] = useState([
    {
      name: 'Feature Requests',
      href: `/portal/${portalData?.id}`,
      current: currentPage === 'Feature Requests',
    },
  ]);

  const [mobileNavigation, setMobileNavigation] = useState([
    {
      name: 'Dashboard',
      href: `/dashboard`,
      current: currentPage === 'Dashboard',
      icon: HomeIcon,
    },
    {
      name: 'Feature Requests',
      href: `/portal/${portalData?.id}`,
      current: currentPage === 'Feature Requests',
      icon: LightBulbIcon,
      alwaysShow: true,
    },
    {
      name: 'Settings',
      href: `/dashboard/settings`,
      current: currentPage === 'Settings',
      icon: Cog6ToothIcon,
      children: [
        {
          name: '· General',
          href: `/dashboard/settings`,
          current: currentPage === 'General',
        },
      ],
    },
  ]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      <div className='fixed z-10 flex h-16 w-screen justify-between border bg-white px-4 sm:px-6 lg:px-8'>
        <div className='flex'>
          <div className='-ml-2 mr-2 flex items-center lg:hidden'>
            {/* Mobile menu button */}
            <button
              type='button'
              className='m-1 p-2.5 text-gray-700 lg:hidden'
              onClick={() => setSidebarOpen(true)}
            >
              <span className='sr-only'>Open sidebar</span>
              <Bars3Icon className='h-6 w-6' aria-hidden='true' />
            </button>
          </div>
          <div className='flex flex-shrink-0 items-center'>
            <Link href={`/portal/${portalData?.id}`} legacyBehavior>
              <button className='flex cursor-pointer items-center justify-center gap-3'>
                <div className='flex h-9 w-9 items-center justify-center rounded-md border border-indigo-200 bg-indigo-100 text-indigo-600'>
                  <h1 className='text-md font-semibold'>
                    {portalData?.portal_name?.charAt(0)}
                  </h1>
                </div>
                <h2 className='font-satoshi text-xl font-medium text-gray-900'>
                  {portalData?.portal_name}
                </h2>
              </button>
            </Link>
          </div>
          <div className='hidden items-center justify-center lg:ml-6 lg:flex lg:space-x-8'>
            {/* Current: "border-indigo-500 text-gray-900", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" */}
            {adminMode && (
              <div className='border-x px-2 '>
                <Link href={`/dashboard`} legacyBehavior>
                  <div className='cursor-pointer rounded-md p-1 hover:bg-gray-100 hover:text-gray-700'>
                    <HomeIcon
                      className='h-6 w-6 text-gray-900'
                      aria-hidden='true'
                    />
                  </div>
                </Link>
              </div>
            )}
            {desktopNavigation.map((item) => (
              <Link href={item.href} key={item.name} legacyBehavior>
                <div
                  className={classNames(
                    item.current
                      ? 'border-indigo-500 text-gray-900'
                      : 'text-gray-500 hover:border-gray-300 hover:text-gray-700',
                    'inline-flex h-full items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium hover:cursor-pointer'
                  )}
                >
                  {item.name}
                </div>
              </Link>
            ))}
            {/* <a
                            href="#"
                            className="inline-flex h-full items-center border-b-2 border-indigo-500 px-1 text-sm font-medium text-gray-900"
                        >
                            Feature Requests
                        </a> */}
            {/* <a
                            href="#"
                            className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                        >
                            Team
                        </a> */}
            {/* <a
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
        <div className='flex items-center'>
          {auth.user ? (
            <div className='flex items-center gap-x-4 lg:gap-x-6 '>
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
              <Menu as='div' className='relative'>
                <Menu.Button className='ml-2 flex items-center p-1.5'>
                  <span className='sr-only'>Open user menu</span>
                  {/* <img
                                            className="h-8 w-8 rounded-full bg-gray-50"
                                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                            alt=""
                                        /> */}
                  {/* <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="h-6 w-6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg> */}
                  <div className='flex h-8 w-8 items-center justify-center rounded-full border border-indigo-300 bg-indigo-100'>
                    <h1 className='text-indigo-500 '>
                      {auth.user?.name?.charAt(0)}
                    </h1>
                  </div>

                  <span className='hidden lg:flex lg:items-center'>
                    <span
                      className='ml-4 text-sm font-semibold leading-6 text-gray-900'
                      aria-hidden='true'
                    >
                      {auth.user?.name ? auth.user.name : 'Account'}
                    </span>
                    <ChevronDownIcon
                      className='ml-2 h-5 w-5 text-gray-400'
                      aria-hidden='true'
                    />
                  </span>
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter='transition ease-out duration-100'
                  enterFrom='transform opacity-0 scale-95'
                  enterTo='transform opacity-100 scale-100'
                  leave='transition ease-in duration-75'
                  leaveFrom='transform opacity-100 scale-100'
                  leaveTo='transform opacity-0 scale-95'
                >
                  <Menu.Items className='absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none'>
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
                    <Menu.Item key='dashboard'>
                      {/* {({ active }) => ( */}
                      <Link href='/dashboard' legacyBehavior>
                        <button
                          className={classNames(
                            // active
                            //     ? "bg-gray-50"
                            //     : "",
                            'block px-3 py-1 text-sm leading-6 text-gray-900'
                          )}
                        >
                          Dashboard
                        </button>
                      </Link>
                      {/* )} */}
                    </Menu.Item>
                    <Menu.Item key='settings'>
                      {/* {({ active }) => ( */}
                      <Link href='/settings/general' legacyBehavior>
                        <button
                          className={classNames(
                            // active
                            //     ? "bg-gray-50"
                            //     : "",
                            'block px-3 py-1 text-sm leading-6 text-gray-900'
                          )}
                        >
                          Settings
                        </button>
                      </Link>
                      {/* )} */}
                    </Menu.Item>
                    <Menu.Item key='signout'>
                      {/* {({ active }) => ( */}
                      {/* <Link href="/auth/signout"> */}
                      <button
                        className={classNames(
                          // active
                          //     ? "bg-gray-50"
                          //     : "",
                          'block px-3 py-1 text-sm leading-6 text-gray-900'
                        )}
                        onClick={(e) => {
                          e.preventDefault();
                          auth.signout();
                        }}
                      >
                        Sign out
                      </button>
                      {/* </Link> */}
                      {/* )} */}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          ) : (
            <div className='whitespace-nowrap'>
              <Link
                href={`/auth/signin?next=/portal/${portalData?.id}`}
                legacyBehavior
              >
                <button
                  type='button'
                  className='relative mr-2 inline-flex items-center gap-x-1.5 rounded-md border-[0.5px] border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                >
                  Login
                  {/* <span aria-hidden="true">
                                                        &rarr;
                                                    </span> */}
                </button>
              </Link>
              <Link
                href={`/auth/signup?next=/portal/${portalData?.id}`}
                legacyBehavior
              >
                <button
                  type='button'
                  className='relative hidden items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:inline-flex'
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
      {/* </div> */}
      <Transition.Root show={sidebarOpen} as='div'>
        <Dialog
          as='div'
          className='relative z-50 lg:hidden'
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter='transition-opacity ease-linear duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='transition-opacity ease-linear duration-300'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-gray-900/80' />
          </Transition.Child>

          <div className='fixed inset-0 flex'>
            <Transition.Child
              as={Fragment}
              enter='transition ease-in-out duration-300 transform'
              enterFrom='-translate-x-full'
              enterTo='translate-x-0'
              leave='transition ease-in-out duration-300 transform'
              leaveFrom='translate-x-0'
              leaveTo='-translate-x-full'
            >
              <Dialog.Panel className='relative mr-16 flex w-full max-w-xs flex-1'>
                <Transition.Child
                  as={Fragment}
                  enter='ease-in-out duration-300'
                  enterFrom='opacity-0'
                  enterTo='opacity-100'
                  leave='ease-in-out duration-300'
                  leaveFrom='opacity-100'
                  leaveTo='opacity-0'
                >
                  <div className='absolute left-full top-0 flex w-16 justify-center pt-5'>
                    <button
                      type='button'
                      className='-m-2.5 p-2.5'
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className='sr-only'>Close sidebar</span>
                      <XMarkIcon
                        className='h-6 w-6 text-white'
                        aria-hidden='true'
                      />
                    </button>
                  </div>
                </Transition.Child>
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <div className='flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2'>
                  <div className='flex h-16 shrink-0 items-center'>
                    {/* <img
                                            className="h-8 w-auto"
                                            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                                            alt="Your Company"
                                        /> */}
                    <Logo />
                  </div>
                  <nav className='flex flex-1 flex-col'>
                    <ul role='list' className='flex flex-1 flex-col gap-y-7'>
                      <li>
                        <ul role='list' className='-mx-2 space-y-1'>
                          {mobileNavigation.map(
                            (item) =>
                              (auth?.user?.portal_id === portalData?.id ||
                                item.alwaysShow) && (
                                <div key={item.name}>
                                  <li>
                                    <Link href={item.href} legacyBehavior>
                                      <button
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
                                      </button>
                                    </Link>
                                  </li>
                                  {item.children && (
                                    <li key={item.name}>
                                      <ul
                                        role='list'
                                        className='-mx-2 space-y-1'
                                      >
                                        {item.children.map((child) => (
                                          <li key={child.name}>
                                            <Link
                                              href={child.href}
                                              legacyBehavior
                                            >
                                              <button
                                                className={classNames(
                                                  child.current
                                                    ? 'bg-gray-50 text-indigo-600'
                                                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600',
                                                  'group ml-16 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
                                                )}
                                              >
                                                {child.name}
                                              </button>
                                            </Link>
                                          </li>
                                        ))}
                                      </ul>
                                    </li>
                                  )}
                                </div>
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
      <main className='fixed bottom-0 flex h-full w-screen overflow-auto pt-[65px]'>
        {/* Your content */}
        {children}
      </main>
    </>
  );
}
