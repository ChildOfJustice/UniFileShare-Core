import { Constants, DemoActions, IDemoState } from './types';

const init: IDemoState = {
  authToken: '',
  idToken: '',
  loading: false
};

export function demoReducer(state: IDemoState = init, action: DemoActions): IDemoState {
  switch (action.type) {
    case Constants.LOAD_STORE:
      const loadedState = JSON.parse(localStorage.getItem('store') || '') as IDemoState
      state.idToken = loadedState.idToken
      state.authToken = loadedState.authToken
      state.loading = loadedState.loading
      return {...state};
    case Constants.SAVE_STORE:
      localStorage.removeItem('store')
      localStorage.setItem('store', JSON.stringify(state))
      return {...state};
    case Constants.SET_ID_TOKEN:
      return {...state, ...action.payload};
    case Constants.SET_AUTH_TOKEN:
      return {...state, ...action.payload};
    case Constants.SET_LOADING:
      return {...state, ...action.payload};
    default:
      return state;
  }
}