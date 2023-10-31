interface GoogleSttFlagsState {
  isAutoStop: boolean;
  isListening: boolean;
  isLoading: boolean;
  isSending: boolean;
  isSpeaking: boolean;
  isUttering: boolean;
  isWhisperPrepared: boolean;
  isFinalData: boolean;
}

interface GoogleSttAction {
  type: FlagsActions;
  value?: boolean;
}

export enum FlagsActions {
  TOGGLE_AUTO_STOP = 'toggle_auto_stop',
  START_LISTENING = 'start_listening',
  STOP_LISTENING = 'stop_listening',
  STOP_SENDING_CHAT = 'stop_sending_chat',
  START_SENDING_CHAT = 'start_sending_chat',
  STOP_LOADING = 'stop_loading',
  START_LOADING = 'start_loading',
  STOP_SPEAKING = 'stop_speaking',
  START_SPEAKING = 'start_speaking',
  STOP_UTTERING = 'stop_uttering',
  START_UTTERING = 'start_uttering',
  PREPARE_WHISPER = 'prepare_whisper',
  DISABLE_WHISPER = 'disable_whisper',
  NOT_FINAL_DATA_RECEIVED = 'not_final_data_received',
  FINAL_DATA_RECEIVED = 'final_data_received',
}

export const initialFlagsState = {
  isAutoStop: true,
  isListening: true,
  isLoading: false,
  isSending: false,
  isSpeaking: false,
  isUttering: false,
  isWhisperPrepared: false,
  isFinalData: false,
};



export function flagsReducer(state: GoogleSttFlagsState, action: GoogleSttAction) {
  // console.log(action.type)
  if (action.type === FlagsActions.TOGGLE_AUTO_STOP) {
    return {
      ...state,
      isAutoStop: action.value,
    };
  }
  if (action.type === FlagsActions.START_LISTENING) {
    return {
      ...state,
      isListening: true,
    };
  }
  if (action.type === FlagsActions.STOP_LISTENING) {
    return {
      ...state,
      isListening: false,
    };
  }
  if (action.type === FlagsActions.STOP_SENDING_CHAT) {
    return {
      ...state,
      isSending: false,
      isLoading: false,
    };
  }
  if (action.type === FlagsActions.START_SENDING_CHAT) {
    return {
      ...state,
      isSending: true,
      isLoading: true,
    };
  }
  if (action.type === FlagsActions.STOP_SPEAKING) {
    return {
      ...state,
      isSpeaking: false,
    };
  }
  if (action.type === FlagsActions.START_SPEAKING) {
    return {
      ...state,
      isSpeaking: true,
    };
  }
  if (action.type === FlagsActions.STOP_LOADING) {
    return {
      ...state,
      isLoading: false,
    };
  }
  if (action.type === FlagsActions.START_LOADING) {
    return {
      ...state,
      isLoading: true,
    };
  }
  if (action.type === FlagsActions.STOP_UTTERING) {
    return {
      ...state,
      isUttering: false,
    };
  }
  if (action.type === FlagsActions.START_UTTERING) {
    return {
      ...state,
      isUttering: true,
    };
  }
  if (action.type === FlagsActions.PREPARE_WHISPER) {
    return {
      ...state,
      isWhisperPrepared: true,
    };
  }
  if (action.type === FlagsActions.DISABLE_WHISPER) {
    return {
      ...state,
      isWhisperPrepared: false,
    };
  }
  if (action.type === FlagsActions.NOT_FINAL_DATA_RECEIVED) {
    return {
      ...state,
      isFinalData: false,
    };
  }
  if (action.type === FlagsActions.FINAL_DATA_RECEIVED) {
    return {
      ...state,
      isFinalData: true,
    };
  }
  throw Error('Unknown action.');
}
