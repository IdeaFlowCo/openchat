import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

export default function SpeakingRateDropdown({
  speakingRate,
  onChangeSpeakingRate,
}) {
  return (
    <div className='text-right'>
      <Menu as='div' className='relative inline-block text-left'>
        <Transition
          as={Fragment}
          enter='transition ease-out duration-100'
          enterFrom='transform opacity-0 scale-95'
          enterTo='transform opacity-100 scale-100'
          leave='transition ease-in duration-75'
          leaveFrom='transform opacity-100 scale-100'
          leaveTo='transform opacity-0 scale-95'
        >
          <Menu.Items className='absolute bottom-12 mt-2 w-24 origin-bottom divide-y divide-gray-100 rounded-md bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
            <div className='p-1'>
              {getSpeakigRates().map(({ label, value }) => (
                <Menu.Item key={value}>
                  <button
                    className={`${
                      value === speakingRate
                        ? 'bg-[#96BE64] text-white'
                        : 'text-gray-900'
                    } group flex w-full flex-col items-center rounded-md px-2 py-2 text-sm`}
                    onClick={() => onChangeSpeakingRate?.(value)}
                  >
                    {label}
                  </button>
                </Menu.Item>
              ))}
            </div>
          </Menu.Items>
        </Transition>
        <div className='min-w-[64px]'>
          <Menu.Button className='inline-flex w-full justify-center rounded-md bg-opacity-20 px-4 py-2 text-sm font-medium text-black hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75'>
            {`${speakingRate}x`}
          </Menu.Button>
        </div>
      </Menu>
    </div>
  );
}

const getSpeakigRates = () => {
  let rates = [];
  for (let i = 0.5; i <= 1; i += 0.5) {
    rates.push({
      label: `${i.toFixed(1)}x`,
      value: i,
    });
  }
  for (let j = 1.25; j <= 1.75; j += 0.25) {
    rates.push({
      label: `${j}x`,
      value: j,
    });
  }
  for (let k = 2; k <= 3; k += 0.5) {
    rates.push({
      label: `${k.toFixed(1)}x`,
      value: k,
    });
  }
  return rates;
};
