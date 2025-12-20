import * as ActionTypes from './ActionTypes';

const initialState = {
  isLoading: false,
  errMess: null,
  data: null,
};

export const Weather = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.WEATHER_LOADING:
      return { ...state, isLoading: true, errMess: null };

    case ActionTypes.WEATHER_SUCCESS:
      return { ...state, isLoading: false, errMess: null, data: action.payload };

    case ActionTypes.WEATHER_FAILED:
      return { ...state, isLoading: false, errMess: action.payload };

    default:
      return state;
  }
};
