import { useEffect, useRef } from 'react';

export default function GoogleSTTInput({
  isListening, // listening to wakeword
  isLoading, // when end keyword is detected
  isSpeaking, // when microphone detect sound
  isRecording, // useWhisper start recording
  isWhisperPrepared,
  query,
  onChangeQuery,
  onForceStopRecording,
  onStartListening,
  onStopListening,
  onStopUttering,
  onSubmitQuery,
}) {
  const waveRef = useRef();

  useEffect(() => {
    const initWaveform = async () => {
      const SiriWave = (await import('siriwave')).default;
      waveRef.current = new SiriWave({
        container: document.getElementById('siri-wave'),
        width: 80,
        height: 64,
        style: 'ios9',
        amplitude: 4,
        autostart: true,
      });
    };
    if (isRecording && !waveRef.current) {
      initWaveform();
    }
  }, [isRecording]);

  useEffect(() => {
    if (waveRef.current) {
      if (isSpeaking) {
        waveRef.current.setAmplitude(4);
      } else {
        waveRef.current.setAmplitude(1);
      }
    }
  }, [isSpeaking]);

  return (
    <div className='flex w-screen justify-center py-4'>
      <div className='flex min-w-[90%] items-center justify-center px-2'>
        <div className='relative flex min-w-[200px] flex-grow flex-row items-center rounded-full bg-[#f4f7fb] shadow-sm sm:min-w-[300px]'>
          <label htmlFor='chat' className='sr-only'>
            Chat
          </label>

          <input
            name='chat'
            id='chat'
            className='flex h-16 w-full rounded-md border-0 bg-transparent px-2 text-gray-900 placeholder:text-gray-400 focus:outline-0 sm:px-4 sm:py-1.5 sm:text-sm sm:leading-6'
            placeholder='Type your response...'
            value={query}
            autoComplete='off'
            onChange={onChangeQuery}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query) {
                onSubmitQuery?.(query);
              }
            }}
          />

          <div className='mr-2 text-sm sm:mr-4'>⏎</div>
        </div>

        <div className='relative min-h-[64px] min-w-[80px]'>
          <div
            id='siri-wave'
            style={{ display: isRecording ? 'unset' : 'none' }}
          ></div>

          {isLoading ? (
            <div
              className='absolute inset-0 flex items-center justify-center bg-white'
              role='status'
            >
              <svg
                aria-hidden='true'
                className='inline h-8 w-8 animate-spin fill-yellow-400 text-gray-200 dark:text-gray-400'
                viewBox='0 0 100 101'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                  fill='currentColor'
                />
                <path
                  d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                  fill='currentFill'
                />
              </svg>
              <span className='sr-only'>Loading...</span>
            </div>
          ) : null}
        </div>

        <div className='w-[3.125rem]'>
          {isRecording && isWhisperPrepared && (
            <button
              onClick={async () => {
                await onForceStopRecording();
              }}
              className='rounded-full border bg-[#96BE64] p-3'
            >
              {isSpeaking ? <MicWaveIcon /> : <MicIcon />}
            </button>
          )}

          {!(isRecording && isWhisperPrepared) && isSpeaking && (
            <button
              onClick={async () => {
                onStopUttering?.();
                onStopListening?.();
              }}
              disabled={isLoading}
              className={`rounded-full border ${
                isListening ? 'bg-[#F2C80F]' : 'bg-[#96BE64]'
              } p-3`}
            >
              <MicWaveIcon />
            </button>
          )}

          {!(isRecording && isWhisperPrepared) &&
            !isSpeaking &&
            isListening && (
              <button
                onClick={() => {
                  onStopUttering?.();
                  onStopListening?.();
                }}
                disabled={isLoading}
                className='rounded-full border bg-[#F2C80F] p-3'
              >
                <MicIcon />
              </button>
            )}

          {!(isRecording && isWhisperPrepared) &&
            !isSpeaking &&
            !isListening && (
              <button
                onClick={async () => {
                  onStartListening?.();
                }}
                className='rounded-full border bg-white p-3 text-white hover:opacity-70 '
              >
                <MicIcon color='#4F46DC' />
              </button>
            )}
        </div>
      </div>
    </div>
  );
}

const MicWaveIcon = () => {
  return (
    <svg
      viewBox='0 0 512.000000 512.000000'
      className='h-6 w-6'
      preserveAspectRatio='xMidYMid meet'
    >
      <g
        transform='translate(0.000000,512.000000) scale(0.100000,-0.100000)'
        fill='#FFFFFF'
        stroke='none'
      >
        <path
          d='M2410 4945 c-283 -63 -487 -250 -581 -530 -23 -70 -24 -72 -27 -662
                                      l-3 -593 761 0 761 0 -3 593 c-3 589 -4 592 -27 662 -50 151 -133 275 -248
                                      369 -75 62 -198 127 -288 151 -85 23 -264 28 -345 10z'
        />
        <path
          d='M543 4769 c-44 -13 -179 -159 -264 -287 -417 -623 -359 -1455 141
                                      -2013 77 -87 112 -109 168 -109 100 0 168 84 147 180 -4 17 -32 59 -62 93
                                      -181 201 -289 407 -345 658 -30 137 -32 397 -5 529 54 254 162 469 336 663 39
                                      44 73 92 76 109 16 73 -33 158 -103 178 -42 11 -46 11 -89 -1z'
        />
        <path
          d='M4486 4770 c-41 -13 -85 -58 -98 -101 -19 -64 -4 -102 73 -187 171
                                      -188 282 -407 336 -662 27 -132 25 -392 -5 -529 -54 -239 -152 -435 -309 -615
                                      -37 -43 -76 -92 -85 -109 -51 -92 22 -207 131 -207 60 0 93 21 171 109 223
                                      248 361 551 405 888 63 478 -93 972 -415 1315 -95 102 -131 119 -204 98z'
        />
        <path
          d='M965 4336 c-60 -26 -181 -183 -244 -317 -69 -143 -92 -243 -98 -409
                                      -9 -246 43 -437 170 -625 96 -142 168 -205 237 -205 50 0 107 35 130 80 37 73
                                      24 123 -59 217 -65 74 -118 166 -148 258 -35 108 -43 278 -18 392 23 107 91
                                      243 164 328 67 77 86 120 78 171 -16 96 -120 150 -212 110z'
        />
        <path
          d='M4024 4336 c-62 -28 -97 -111 -75 -177 6 -19 38 -65 71 -104 74 -85
                                      133 -201 161 -314 18 -70 21 -105 17 -205 -8 -187 -62 -326 -179 -459 -83 -94
                                      -96 -144 -59 -217 13 -26 34 -47 60 -60 85 -43 149 -17 242 99 119 149 183
                                      283 220 461 17 79 19 121 15 245 -6 178 -29 273 -106 430 -49 100 -160 249
                                      -213 288 -34 25 -113 32 -154 13z'
        />
        <path
          d='M1403 3919 c-41 -12 -106 -86 -146 -168 -30 -63 -32 -72 -32 -181 1
                                      -132 18 -189 82 -274 48 -63 92 -89 148 -88 132 2 191 143 105 252 -26 33 -35
                                      54 -38 96 -4 50 -2 59 37 116 33 50 41 70 41 107 0 61 -29 107 -83 131 -46 21
                                      -66 23 -114 9z'
        />
        <path
          d='M3603 3910 c-54 -24 -83 -70 -83 -131 0 -37 8 -57 41 -107 39 -57 41
                                      -66 37 -116 -3 -42 -12 -63 -38 -96 -86 -108 -27 -250 104 -252 59 -1 100 24
                                      151 94 64 86 89 172 83 291 -3 78 -9 102 -36 158 -42 87 -103 155 -150 169
                                      -50 13 -60 13 -109 -10z'
        />
        <path
          d='M1802 2568 c4 -271 6 -298 27 -363 68 -209 207 -372 395 -464 122
                                      -60 190 -75 336 -75 146 0 214 15 336 75 188 92 327 255 395 464 21 65 23 92
                                      27 363 l4 292 -762 0 -762 0 4 -292z'
        />
        <path
          d='M1278 2539 c-24 -12 -46 -35 -59 -61 -20 -38 -21 -53 -15 -145 29
                                      -475 306 -893 741 -1117 108 -56 270 -110 383 -127 l82 -13 0 -308 0 -308
                                      -245 0 c-227 0 -249 -2 -285 -20 -45 -23 -80 -80 -80 -130 0 -50 35 -107 80
                                      -130 38 -19 58 -20 680 -20 622 0 642 1 680 20 45 23 80 80 80 130 0 50 -35
                                      107 -80 130 -36 18 -58 20 -285 20 l-245 0 0 308 0 308 82 13 c252 39 511 170
                                      709 359 121 114 207 232 279 377 87 178 125 319 136 508 6 92 5 107 -15 145
                                      -38 75 -124 101 -201 62 -52 -26 -80 -81 -80 -153 0 -71 -25 -215 -52 -297
                                      -91 -280 -320 -528 -596 -645 -150 -63 -238 -80 -417 -79 -174 1 -232 12 -390
                                      73 -227 87 -441 285 -555 511 -65 129 -110 307 -110 438 0 133 -113 209 -222
                                      151z'
        />
      </g>
    </svg>
  );
};

const MicIcon = ({ color = '#FFFFFF' }) => {
  return (
    <svg
      viewBox='0 0 512.000000 512.000000'
      className='h-6 w-6'
      preserveAspectRatio='xMidYMid meet'
    >
      <g
        transform='translate(0.000000,512.000000) scale(0.100000,-0.100000)'
        fill={color}
        stroke='none'
      >
        <path
          d='M2420 4784 c-234 -50 -436 -254 -485 -489 -22 -104 -22 -1766 0
                                    -1870 60 -287 330 -505 625 -505 237 0 462 139 568 350 73 147 72 119 72 1090
                                    0 971 1 943 -72 1090 -129 257 -422 396 -708 334z'
        />
        <path
          d='M1375 3026 c-37 -17 -70 -52 -84 -89 -17 -45 -14 -596 4 -698 38
                                    -220 140 -411 307 -576 191 -187 407 -299 686 -354 l112 -22 0 -323 0 -323
                                    -349 -3 c-335 -3 -351 -4 -377 -24 -53 -39 -69 -71 -69 -134 0 -63 16 -95 69
                                    -134 27 -21 34 -21 886 -21 852 0 859 0 886 21 53 39 69 71 69 134 0 63 -16
                                    95 -69 134 -26 20 -42 21 -377 24 l-349 3 0 323 0 324 98 17 c264 47 496 163
                                    678 337 147 141 243 291 297 463 42 132 48 215 45 537 -3 281 -4 298 -24 324
                                    -39 53 -71 69 -134 69 -63 0 -95 -16 -134 -69 -20 -26 -21 -44 -27 -359 -5
                                    -326 -6 -334 -32 -412 -37 -110 -89 -195 -176 -288 -225 -237 -579 -349 -927
                                    -292 -237 38 -427 136 -579 297 -84 88 -136 175 -172 283 -26 78 -27 86 -32
                                    412 -6 315 -7 333 -27 359 -11 15 -32 37 -46 47 -34 25 -113 32 -153 13z'
        />
      </g>
    </svg>
  );
};
