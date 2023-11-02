import { VoiceCommand } from '../../../types/useWhisperTypes';
import wordsToNumbers from 'words-to-numbers';
import { END_KEYWORDS, START_KEYWORDS, VOICE_COMMANDS } from '../constants';
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
  for (const keyword of START_KEYWORDS) {
    if (interimText.toLowerCase().includes(keyword.toLowerCase())) {
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

  START_KEYWORDS.forEach((keyword) => {
    const keywordIndex = lowerCaseText.indexOf(keyword.toLowerCase());
    if (keywordIndex !== -1) {
      text = text.substring(keywordIndex + keyword.length);
    }
  });

  END_KEYWORDS.forEach((keyword) => {
    const endKeywordIndex = lowerCaseText.lastIndexOf(keyword.toLowerCase());
    if (endKeywordIndex !== -1) {
      text = text.substring(0, endKeywordIndex).trim();
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
  for (const keyword of END_KEYWORDS) {
    isKeywordDetected ||= interimText.toLowerCase().includes(keyword.toLowerCase());
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
