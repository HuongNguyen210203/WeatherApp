import * as ActionTypes from './ActionTypes';

const initialState = {
  isLoading: false,
  errMess: null,
  list: [],
  selected: null,
};

export const Cities = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.CITIES_LOADING:
      return { ...state, isLoading: true, errMess: null };

    case ActionTypes.CITIES_SUCCESS:
      return { ...state, isLoading: false, list: action.payload };

    case ActionTypes.CITIES_FAILED:
      return { ...state, isLoading: false, errMess: action.payload };

    case ActionTypes.SELECT_CITY:
      return { ...state, selected: action.payload };

    default:
      return state;
  }
};
