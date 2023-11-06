export default function Alert({ message, type, onClose }) {
  return (
    <div
      className={`mx-4 mt-2 rounded-full border-l-4 bg-gray-50 pl-3 md:mx-auto md:max-w-2xl md:pl-4 ${type === 'error'
          ? 'border-red-500'
          : type === 'success'
            ? 'border-green-500'
            : 'border-gray-500'
        }`}
    >
      <div className='flex justify-between py-3'>
        <div className='flex flex-1 items-center'>
          <div>
            {type === 'error' ? (
              <ErrorIcon />
            ) : type === 'success' ? (
              <SuccessIcon />
            ) : (
              <InfoIcon />
            )}
          </div>
          <div className='ml-2 flex flex-1 self-center'>
            <p
              className={`${type === 'error'
                  ? 'text-red-600'
                  : type === 'success'
                    ? 'text-green-600'
                    : 'text-gray-600'
                }`}
            >
              {message}
            </p>
          </div>
          <button
            className={`px-6 md:px-8 ${type === 'error'
                ? 'text-red-600'
                : type === 'success'
                  ? 'text-green-600'
                  : 'text-gray-600'
              }`}
            onClick={onClose}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                clipRule='evenodd'
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

const ErrorIcon = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      className='h-6 w-6 text-red-500'
      viewBox='0 0 20 20'
      fill='currentColor'
    >
      <path
        fillRule='evenodd'
        d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
        clipRule='evenodd'
      />
    </svg>
  );
};

const InfoIcon = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      className='h-6 w-6 text-blue-400'
      viewBox='0 0 20 20'
      fill='currentColor'
    >
      <path
        fillRule='evenodd'
        d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
        clipRule='evenodd'
      />
    </svg>
  );
};

const SuccessIcon = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      className='h-6 w-6 rounded-full text-green-500'
      viewBox='0 0 20 20'
      fill='currentColor'
    >
      <path
        fillRule='evenodd'
        d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
        clipRule='evenodd'
      />
    </svg>
  );
};
