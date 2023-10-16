import { VoiceCommand } from "../../../types/useWhisperTypes";
import wordsToNumbers from "words-to-numbers";
import { END_KEYWORD, START_KEYWORDS, VOICE_COMMANDS } from "../constants";
import { Message } from "ai";

type VoiceCommandAction =
    | { type: 'SET_IS_AUTO_STOP', value: boolean }
    | { type: 'SET_AUTO_STOP_TIMEOUT', value: number }
    | { type: 'SHOW_MESSAGE', messageType: 'error' | 'success', message: string }
    | null;

export const getVoiceCommandAction = (voiceCommand: VoiceCommand): VoiceCommandAction => {
    switch (voiceCommand.command) {
        case 'off-auto-stop':
            return { type: 'SET_IS_AUTO_STOP', value: false };
        case 'on-auto-stop':
            return { type: 'SET_IS_AUTO_STOP', value: true };
        case 'change-auto-stop':
            if (voiceCommand.args && typeof voiceCommand.args === 'number') {
                return { type: 'SET_AUTO_STOP_TIMEOUT', value: voiceCommand.args };
            } else {
                return { type: 'SHOW_MESSAGE', messageType: 'error', message: 'incorrect voice command.' };
            }
        default:
            return null;
    }
}

export const checkIsVoiceCommand = (text: string): VoiceCommand | undefined => {
    for (const voiceCommand of VOICE_COMMANDS) {
        if (text.toLocaleLowerCase().includes(voiceCommand.matcher.toLocaleLowerCase())) {
            if (voiceCommand.command === 'change-auto-stop') {
                let args = wordsToNumbers(text);
                if (typeof args === 'string') {
                    args = args.match(/\d+/)[0];
                    args = parseInt(args, 10);
                }
                return {...voiceCommand, args};
            } else {
                return voiceCommand;
            }
        }
    }
    return undefined;
};

export const extractStartKeyword = (interimText: string): string | null => {
    for (const keyword of START_KEYWORDS) {
        if (interimText.toLowerCase().includes(keyword.toLowerCase())) {
            return keyword;
        }
    }
    return null;
};

export const trimText = (text: string): string => {
    return text.trim().replace(/,$/, '');
}

export const handleStartKeywords = (text: string): string => {
    const lowerCaseText = text.toLowerCase();

    START_KEYWORDS.forEach((keyword) => {
        const keywordIndex = lowerCaseText.indexOf(keyword.toLowerCase());
        if (keywordIndex !== -1) {
            text = text.substring(keywordIndex + keyword.length);
        }
    });

    const endKeywordIndex = lowerCaseText.lastIndexOf(END_KEYWORD.toLowerCase());
    if (endKeywordIndex !== -1) {
        text = text.substring(0, endKeywordIndex).trim();
    }

    return trimText(text);
}


export const blobToBase64 = (blob: Blob): Promise<string | null> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result?.toString().split(',')[1] || null;
            resolve(base64data);
        };
        reader.readAsDataURL(blob);
    });
};

export const whisperTranscript = async (base64: string): Promise<string> => {
    console.log("WHISPER")
    try {
        const body = {
            file: base64,
        };
        const headers = {
            'Content-Type': 'application/json',
        };
        const {default: axios} = await import('axios');
        const response = await axios.post('/api/openai/whisper', JSON.stringify(body), {
            headers,
            maxBodyLength: 25 * 1024 * 1024,
        });
        return response?.data?.text || '';
    } catch (error) {
        console.warn('whisperTranscript', {error});
        return '';
    }
};

export const detectEndKeyword = (interimText: string): boolean => {
    return interimText.toLowerCase().includes(END_KEYWORD.toLowerCase());
};


export const splitTextsBySeparator = (texts: Message[], separator:string): Message[] => {
    const finalMessages = []
    texts.forEach(text => {
        const exploded = text.content.split(separator)
        if (exploded.length === 1) {
            finalMessages.push(text)
        }else{
            exploded.forEach(explodedMsg => {
                finalMessages.push({
                ...text,
                content: explodedMsg
                })
                
            })
        }
    });
    
    return finalMessages
}