import { VoiceCommand } from '../../../types/useWhisperTypes';
import wordsToNumbers from 'words-to-numbers';
import { END_WORDS, WAKE_WORDS, VOICE_COMMANDS } from '../constants';
import { Message } from 'ai';

type VoiceCommandAction =
  | { type: 'SET_IS_AUTO_STOP'; value: boolean }
  | { type: 'SET_AUTO_STOP_TIMEOUT'; value: number | string }
  | { type: 'SET_MICROPHONE_OFF'; value: boolean }
  | { type: 'SHOW_MESSAGE'; messageType: 'error' | 'success'; message: string }
  | null;

export const getVoiceCommandAction = (voiceCommand: VoiceCommand): VoiceCommandAction => {
  switch (voiceCommand.command) {
    case VOICE_COMMANDS.OFF_AUTO_STOP.command:
      return { type: 'SET_IS_AUTO_STOP', value: false };

    case VOICE_COMMANDS.ON_AUTO_STOP.command:
      return { type: 'SET_IS_AUTO_STOP', value: true };

    case VOICE_COMMANDS.TURN_OFF_MIC.command:
      return { type: 'SET_MICROPHONE_OFF', value: false };

    case VOICE_COMMANDS.CHANGE_AUTO_STOP.command:
      if (voiceCommand.args && typeof voiceCommand.args === 'number') {
        return { type: 'SET_AUTO_STOP_TIMEOUT', value: voiceCommand.args };
      } else {
        return {
          type: 'SHOW_MESSAGE',
          messageType: 'error',
          message: 'incorrect voice command.',
        };
      }

    case VOICE_COMMANDS.MAKE_AUTO_STOP.command:
      return { type: 'SET_AUTO_STOP_TIMEOUT', value: voiceCommand.args };

    default:
      return null;
  }
};

export const checkIsVoiceCommand = (text: string): VoiceCommand | undefined => {
  const voiceCommands = Object.values(VOICE_COMMANDS);
  if (text) {
    for (const voiceCommand of voiceCommands) {
      if (text.match(voiceCommand.matcher)) {
        if (voiceCommand.command === VOICE_COMMANDS.CHANGE_AUTO_STOP.command) {
          let args = wordsToNumbers(text);
          if (typeof args === 'string') {
            args = args.match(/\d+/)[0];
            args = parseInt(args, 10);
          }
          return { ...voiceCommand, args };
        } else if (voiceCommand.command === VOICE_COMMANDS.MAKE_AUTO_STOP.command) {
          const commands = [
            { command: 'faster', index: text.toLocaleLowerCase().indexOf('faster') },
            { command: 'slower', index: text.toLocaleLowerCase().indexOf('slower') },
          ]
            .sort((a, b) => a.index - b.index)
            .filter((c) => c.index !== -1);

          return { ...voiceCommand, args: commands.length > 0 ? commands[0].command : '' };
        } else {
          return voiceCommand;
        }
      }
    }
  }

  return undefined;
};

export const extractStartKeyword = (interimText: string): string | null => {
  const wake_words = process.env.NEXT_PUBLIC_WAKEWORDS?.split(',') || WAKE_WORDS;
  for (const keyword of wake_words) {
    if (sanitizeText(interimText).includes(sanitizeText(keyword))) {
      return keyword;
    }
  }
  return null;
};

export const trimText = (text: string): string => {
  const textStripCommas = text
    .trim()
    .replace(/(^,|,$|^\.)/, '')
    .trim();
  return `${textStripCommas.charAt(0).toLocaleUpperCase()}${textStripCommas.substring(1)}`;
};

export const handleKeywords = (text: string): string => {
  const lowerCaseText = text.toLowerCase();
  const wake_words = process.env.NEXT_PUBLIC_WAKEWORDS?.split(',') || WAKE_WORDS;
  wake_words.forEach((keyword) => {
    const last_keyword_chunk = keyword.split(' ').reverse()[0];
    const keywordIndex = lowerCaseText.indexOf(sanitizeText(last_keyword_chunk));

    if (keywordIndex !== -1) {
      text = text.substring(keywordIndex + last_keyword_chunk.length);
    }
  });

  const end_words = process.env.NEXT_PUBLIC_ENDWORDS?.split(',') || END_WORDS;
  end_words.forEach((keyword) => {
    const first_keyword_chunk = keyword.split(' ')[0];
    const endKeywordIndex = text.lastIndexOf(sanitizeText(first_keyword_chunk));
    if (endKeywordIndex !== -1) {
      const keywordChunk = text.substring(endKeywordIndex).substring(first_keyword_chunk.length).trim();
      text = text.substring(0, endKeywordIndex).trim().concat(' ', keywordChunk);
    }
  });

  return trimText(text);
};

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
  console.log('WHISPER');
  try {
    const body = {
      file: base64,
    };
    const headers = {
      'Content-Type': 'application/json',
    };
    const { default: axios } = await import('axios');
    const response = await axios.post('/api/openai/whisper', JSON.stringify(body), {
      headers,
      maxBodyLength: 25 * 1024 * 1024,
    });
    return response?.data?.text || '';
  } catch (error) {
    console.warn('whisperTranscript', { error });
    return '';
  }
};

export const detectEndKeyword = (interimText: string): boolean => {
  let isKeywordDetected = false;
  const end_words = process.env.NEXT_PUBLIC_ENDWORDS?.split(',') || END_WORDS;
  for (const keyword of end_words) {
    isKeywordDetected ||= sanitizeText(interimText).includes(sanitizeText(keyword));
  }
  return isKeywordDetected;
};

export const splitTextsBySeparator = (texts: Message[], separator: string): Message[] => {
  const finalMessages = [];
  texts.forEach((text) => {
    const exploded = text.content.split(separator);
    if (exploded.length === 1) {
      finalMessages.push(text);
    } else {
      exploded.forEach((explodedMsg) => {
        finalMessages.push({
          ...text,
          content: explodedMsg,
        });
      });
    }
  });

  return finalMessages;
};

export const sanitizeText = (keyword: string): string => {
  return keyword
    .replaceAll(/[,|.]/g, '')
    .replaceAll(/\n\n|\n/g, '')
    .trim()
    .toLocaleLowerCase();
};

// export const getIndexLastKeyword = (interims: string[]): number => {
//   const wake_words = process.env.NEXT_PUBLIC_WAKEWORKDS?.split(',') || WAKE_WORDS;
//   const wake_words_index = wake_words.map((keyword) => {
//     const index = interims.findLastIndex((interim) => sanitizeText(interim).includes(sanitizeText(keyword)));
//     return { keyword, index };
//   });

//   return wake_words_index.toSorted((a, b) => a.index - b.index)[0].index;
// };
