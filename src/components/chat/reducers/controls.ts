import { STOP_TIMEOUT } from "../constants";

interface GoogleSttControlsState {
  speakingRate: number;
  autoStopTimeout: number;
}

export enum ControlsActions {
  SET_AUTO_STOP_TIMEOUT = 'set_auto_stop_timeout',
  SET_SPEANKING_RATE = 'set_speanking_rate',
}

interface GoogleSttControlsAction {
  type: ControlsActions;
  value?: number;
}

export const initialControlsState: GoogleSttControlsState = {
  speakingRate: 1,
  autoStopTimeout: STOP_TIMEOUT,
};

export function controlsReducer(state: GoogleSttControlsState, action: GoogleSttControlsAction) {
  // console.log(action.type)
  if (action.type === ControlsActions.SET_AUTO_STOP_TIMEOUT) {
    return {
      ...state,
      autoStopTimeout: action.value,
    };
  }
  if (action.type === ControlsActions.SET_SPEANKING_RATE) {
    return {
      ...state,
      speakingRate: action.value,
    };
  }
  throw Error('Unknown action.');
}