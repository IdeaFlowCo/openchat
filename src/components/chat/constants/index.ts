export const START_KEYWORDS = ['Alexa', 'Alex']
export const END_KEYWORD = 'Terminator'
export const STOP_TIMEOUT = 3 // 3 seconds
export const VOICE_COMMANDS = [
    {
        command: 'off-auto-stop',
        matcher: 'turn off automatic response',
    },
    {
        command: 'on-auto-stop',
        matcher: 'turn on automatic response',
    },
    {
        command: 'change-auto-stop',
        matcher: 'change automatic response',
    },
] as const
export const TALKTOGPT_SOCKET_ENDPOINT =
    process.env.NODE_ENV === 'development'
        ? 'http://localhost:8080'
        : 'https://talktogpt-cd054735c08a.herokuapp.com'