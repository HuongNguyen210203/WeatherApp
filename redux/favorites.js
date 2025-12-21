import * as ActionTypes from './ActionTypes';

const initialState = {
  isLoading: false,
  errMess: null,
  list: [],
};

export const Favorites = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.FAVORITES_LOADING:
      return { ...state, isLoading: true, errMess: null };

    case ActionTypes.FAVORITES_SUCCESS:
      return { ...state, isLoading: false, errMess: null, list: action.payload ?? [] };

    case ActionTypes.FAVORITES_FAILED:
      return { ...state, isLoading: false, errMess: action.payload };

    // Tuỳ chọn: nếu bạn vẫn muốn tối ưu UI (không bắt buộc)
    case ActionTypes.ADD_FAVORITE: {
      const city = action.payload;
      const exists = state.list.some((c) => c?.id === city?.id);
      return exists ? state : { ...state, list: [city, ...state.list] };
    }

    case ActionTypes.REMOVE_FAVORITE: {
      const cityId = action.payload;
      return { ...state, list: state.list.filter((c) => c?.id !== cityId) };
    }

    // Không còn auth nữa, nhưng vẫn có thể giữ để clear local list khi cần
    case ActionTypes.FAVORITES_CLEAR:
      return { ...state, isLoading: false, errMess: null, list: [] };

    default:
      return state;
  }
};
