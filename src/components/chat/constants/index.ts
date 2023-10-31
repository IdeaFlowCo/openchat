export const START_KEYWORDS = ['flow', 'start dictation'];
export const END_KEYWORDS = ['over', 'end dictation'];
export const STOP_TIMEOUT = 2; // 2 seconds
export const BE_CONCISE = 'Please, be concise.';

export const VOICE_COMMANDS = {
  OFF_AUTO_STOP: {
    command: 'off-auto-stop',
    matcher: 'turn off automatic response',
  },
  ON_AUTO_STOP: {
    command: 'on-auto-stop',
    matcher: 'turn on automatic response',
  },
  CHANGE_AUTO_STOP: {
    command: 'change-auto-stop',
    matcher: 'change automatic response to',
  },
  MAKE_AUTO_STOP: {
    command: 'make-auto-stop',
    matcher: 'make automatic response',
  },
  TURN_OFF_MIC: {
    command: 'turn-off-mic',
    matcher: 'turn off microphone',
  }
} as const;

export const TALKTOGPT_SOCKET_ENDPOINT =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8080'
    : 'https://talktogpt-cd054735c08a.herokuapp.com';
