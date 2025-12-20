import * as ActionTypes from './ActionTypes';

const initialState = {
  isLoading: false,
  errMess: null,
  user: null,      // supabase user object
  session: null,   // supabase session
};

export const Auth = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.AUTH_LOADING:
      return { ...state, isLoading: true, errMess: null };

    case ActionTypes.AUTH_SUCCESS:
      return {
        ...state,
        isLoading: false,
        errMess: null,
        user: action.payload?.user ?? null,
        session: action.payload?.session ?? null,
      };

    case ActionTypes.AUTH_FAILED:
      return { ...state, isLoading: false, errMess: action.payload };

    case ActionTypes.AUTH_SIGNOUT:
      return { ...state, user: null, session: null };

    default:
      return state;
  }
};