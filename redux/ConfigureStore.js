import { createStore, combineReducers, applyMiddleware } from 'redux';
import {thunk} from 'redux-thunk';

import { Cities } from './cities';
import { Weather } from './weather';
import { Favorites } from './favorites';

export const ConfigureStore = () => {
  const store = createStore(
    combineReducers({
      cities: Cities,
      weather: Weather,
      favorites: Favorites,
    }),
    applyMiddleware(thunk)
  );

  return store;
};
