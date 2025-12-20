import { createStore, combineReducers, applyMiddleware } from 'redux';
import {thunk} from 'redux-thunk';

import { Cities } from './cities';
import { Weather } from './weather';
import { Favorites } from './favorites';
import { Auth } from './auth';

export const ConfigureStore = () => {
  const store = createStore(
    combineReducers({
      cities: Cities,
      weather: Weather,
      favorites: Favorites,
      auth: Auth,
    }),
    applyMiddleware(thunk)
  );

  return store;
};
