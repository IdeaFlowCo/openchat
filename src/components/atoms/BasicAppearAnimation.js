import React from 'react';
import { Transition } from '@headlessui/react';

function AppearAnimation({ children, className }) {
  return (
    <Transition
      appear={true}
      show={true}
      enter='transition ease-out duration-200'
      enterFrom='opacity-0 translate-y-1'
      enterTo='opacity-100 translate-y-0'
      leave='transition ease-in duration-150'
      leaveFrom='opacity-100 translate-y-0'
      leaveTo='opacity-0 translate-y-1'
      className={className}
    >
      {/* Your content goes here*/}
      {children}
    </Transition>
  );
}

export default AppearAnimation;
