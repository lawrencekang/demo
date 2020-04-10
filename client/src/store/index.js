import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';

import { composeWithDevTools } from 'redux-devtools-extension';
import chatReducer from './reducer';

export default function configureStore() {
  const store = createStore(
    chatReducer,
    composeWithDevTools(
      applyMiddleware(
        thunkMiddleware,
      ),
    ),
  );
  return store;
}
