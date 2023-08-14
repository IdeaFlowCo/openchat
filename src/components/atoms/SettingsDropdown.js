import { Switch, Popover, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { usePopper } from 'react-popper'

export default function SettingsDropdown({
  autoStopTimeout,
  isAutoStop,
  onChangeAutoStopTimeout,
  onChangeIsAutoStop,
  onChangePorcupineAccessKey,
}) {
  let [referenceElement, setReferenceElement] = useState()
  let [popperElement, setPopperElement] = useState()
  let { styles, attributes } = usePopper(referenceElement, popperElement)

  const increment = () => {
    onChangeAutoStopTimeout(autoStopTimeout + 1)
  }

  const decrement = () => {
    if (autoStopTimeout > 0) {
      onChangeAutoStopTimeout(autoStopTimeout - 1)
    }
  }

  return (
    <Popover className="relative">
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <Popover.Panel
          ref={setPopperElement}
          className="absolute z-10 my-4 w-screen max-w-sm px-4 sm:px-0"
          style={styles.popper}
          {...attributes.popper}
        >
          <div className="overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            {onChangePorcupineAccessKey ? (
              <div className="border-b border-gray-200 p-2">
                <button
                  onClick={onChangePorcupineAccessKey}
                  className="flex w-full flex-col items-center rounded-md px-2 py-3 text-sm hover:bg-[#96BE64] hover:text-white"
                >
                  Change Porcupine Access Key
                </button>
              </div>
            ) : null}
            <div className="flex flex-col p-4">
              <div className="mb-2 flex flex-row items-center">
                <Switch
                  checked={isAutoStop}
                  onChange={onChangeIsAutoStop}
                  className={`${
                    isAutoStop ? 'bg-[#96BE64]' : 'bg-gray-400'
                  } relative inline-flex h-6 w-11 items-center rounded-full`}
                >
                  <span className="sr-only">Auto Respond</span>
                  <span
                    className={`${
                      isAutoStop ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
                <div className="flex flex-row items-center">
                  <button
                    className={`group flex flex-row items-center px-2 py-2 text-sm text-gray-900`}
                    onClick={() => onChangeIsAutoStop?.(!isAutoStop)}
                  >
                    Automatic respond
                  </button>
                </div>
              </div>
              <div class="custom-number-input w-full text-right">
                <div class="relative flex h-10 w-full flex-row items-center overflow-hidden rounded-lg border bg-transparent">
                  <button
                    data-action="decrement"
                    class="h-full w-20 cursor-pointer rounded-l border-r border-r-gray-200 outline-none hover:bg-[#96BE64] hover:text-white"
                    onClick={decrement}
                  >
                    <span class="m-auto text-2xl font-thin">&minus;</span>
                  </button>
                  <input
                    type="number"
                    class="text-md md:text-basecursor-default mr-[1px] flex h-9 w-full items-center border-none font-semibold text-gray-700 outline-none hover:text-black focus:text-black focus:outline-none"
                    name="custom-input-number"
                    value={autoStopTimeout}
                    onChange={(e) => onChangeAutoStopTimeout?.(e.target.value)}
                  />
                  <button
                    data-action="increment"
                    class="h-full w-20 cursor-pointer rounded-r border-l border-l-gray-200 hover:bg-[#96BE64] hover:text-white"
                    onClick={increment}
                  >
                    <span class="m-auto text-2xl font-thin">+</span>
                  </button>
                </div>
                <label className="text-xs">
                  {toHoursAndMinutes(autoStopTimeout)}
                </label>
              </div>
            </div>
          </div>
        </Popover.Panel>
      </Transition>
      <Popover.Button
        ref={setReferenceElement}
        className="inline-flex w-full justify-center rounded-md bg-opacity-20 px-4 py-2 text-sm font-medium text-black hover:bg-opacity-30 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
      >
        <SettingIcon className="h6 w-6" />
      </Popover.Button>
    </Popover>
  )
}

function toHoursAndMinutes(totalSeconds) {
  const totalMinutes = Math.floor(totalSeconds / 60)

  const seconds = totalSeconds % 60
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${hours}h ${minutes}m ${seconds}s`
}

const SettingIcon = (props) => {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g
        id="SVGRepo_tracerCarrier"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></g>
      <g id="SVGRepo_iconCarrier">
        {' '}
        <path
          d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
          stroke={props.color ?? '#000000'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></path>{' '}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14.2703 4.54104C14.2703 3.68995 13.5803 3 12.7292 3H11.2706C10.4195 3 9.72953 3.68995 9.72953 4.54104C9.72953 5.19575 9.30667 5.76411 8.73133 6.07658C8.64137 6.12544 8.55265 6.17624 8.46522 6.22895C7.90033 6.56948 7.19241 6.65124 6.6199 6.32367C5.87282 5.89621 4.92082 6.15129 4.48754 6.89501L3.78312 8.10415C3.35155 8.84495 3.60624 9.79549 4.35038 10.2213C4.92043 10.5474 5.2042 11.1992 5.19031 11.8558C5.1893 11.9037 5.18879 11.9518 5.18879 12C5.18879 12.0482 5.1893 12.0963 5.19032 12.1443C5.20421 12.8009 4.92043 13.4526 4.3504 13.7787C3.60628 14.2045 3.35159 15.155 3.78315 15.8958L4.48759 17.105C4.92086 17.8487 5.87286 18.1038 6.61993 17.6763C7.19243 17.3488 7.90034 17.4305 8.46523 17.7711C8.55266 17.8238 8.64138 17.8746 8.73133 17.9234C9.30667 18.2359 9.72953 18.8042 9.72953 19.459C9.72953 20.3101 10.4195 21 11.2706 21H12.7292C13.5803 21 14.2703 20.3101 14.2703 19.459C14.2703 18.8042 14.6931 18.2359 15.2685 17.9234C15.3584 17.8746 15.4471 17.8238 15.5346 17.7711C16.0994 17.4305 16.8074 17.3488 17.3799 17.6763C18.1269 18.1038 19.0789 17.8487 19.5122 17.105L20.2167 15.8958C20.6482 15.1551 20.3935 14.2045 19.6494 13.7788C19.0794 13.4526 18.7956 12.8009 18.8095 12.1443C18.8105 12.0963 18.811 12.0482 18.811 12C18.811 11.9518 18.8105 11.9037 18.8095 11.8558C18.7956 11.1992 19.0794 10.5474 19.6494 10.2213C20.3936 9.79548 20.6482 8.84494 20.2167 8.10414L19.5123 6.89501C19.079 6.15128 18.127 5.8962 17.3799 6.32366C16.8074 6.65123 16.0995 6.56948 15.5346 6.22894C15.4471 6.17624 15.3584 6.12543 15.2685 6.07658C14.6931 5.76411 14.2703 5.19575 14.2703 4.54104Z"
          stroke={props.color ?? '#000000'}
          strokeWidth="2"
        ></path>{' '}
      </g>
    </svg>
  )
}
