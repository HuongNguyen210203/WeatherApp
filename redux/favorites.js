// import * as ActionTypes from './ActionTypes';

// const initialState = {
//   isLoading: false,
//   errMess: null,
//   // ids: [], // lưu city_id favorites
//   list: [],
// };

// export const Favorites = (state = initialState, action) => {
//   switch (action.type) {
//     case ActionTypes.FAVORITES_LOADING:
//       return { ...state, isLoading: true, errMess: null };

//     case ActionTypes.FAVORITES_SUCCESS:
//       return { ...state, isLoading: false, errMess: null, ids: action.payload };

//     case ActionTypes.FAVORITES_FAILED:
//       return { ...state, isLoading: false, errMess: action.payload };

//     case ActionTypes.ADD_FAVORITE:
//       return state.ids.includes(action.payload)
//         ? state
//         : { ...state, ids: state.ids.concat(action.payload) };

//     case ActionTypes.REMOVE_FAVORITE:
//       return { ...state, ids: state.ids.filter((id) => id !== action.payload) };

//     default:
//       return state;
//   }
// };
import * as ActionTypes from './ActionTypes';

const initialState = {
  isLoading: false,
  errMess: null,
  list: [], // ✅ mảng city objects
};

export const Favorites = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.FAVORITES_LOADING:
      return { ...state, isLoading: true, errMess: null };

    case ActionTypes.FAVORITES_SUCCESS:
      // payload: mảng city objects
      return { ...state, isLoading: false, errMess: null, list: action.payload ?? [] };

    case ActionTypes.FAVORITES_FAILED:
      return { ...state, isLoading: false, errMess: action.payload };

    case ActionTypes.ADD_FAVORITE: {
      const city = action.payload; 
      const exists = state.list.some((c) => c.id === city.id);
      return exists ? state : { ...state, list: [city, ...state.list] };
    }

    case ActionTypes.REMOVE_FAVORITE: {
      const cityId = action.payload;
      return { ...state, list: state.list.filter((c) => c.id !== cityId) };
    }

    case ActionTypes.FAVORITES_CLEAR:
      return { ...state, isLoading: false, errMess: null, list: [] };


    default:
      return state;
  }
};
