import {makeReducer, effectDispatcher, emitter} from './index';
import {createStore, applyMiddleware} from 'redux';
import createSagaMiddleware from 'redux-saga';
import {put, takeEvery, all} from 'redux-saga/effects'

describe('rosmaro-redux', () => {

  it('connects Rosmaro, Redux and Redux-saga', () => {

    const rosmaroModel = ({state = 0, action}) => {
      switch (action.type) {
        case 'INCREMENT':
          return {
            state,
            result: {
              data: undefined,
              effect: {type: 'INCREMENT'}
            }
          };
        case 'ACTUALLY_INCREMENT':
          return {
            state: state + 1,
            result: {data: undefined, effect: undefined}
          };
        default:
          return {state, result: {data: undefined, effect: undefined}};
      }
    };

    const increment = function* () {
      yield put({type: 'ACTUALLY_INCREMENT'});
    };

    const watchIncrement = function* () {
      yield takeEvery('INCREMENT', increment);
    };

     const saga = function* () {
      yield all([
        watchIncrement()
      ]);
    };

    const rootReducer = makeReducer(rosmaroModel);

    const sagaMiddleware = createSagaMiddleware({emitter});

    const store = createStore(
      rootReducer,
      applyMiddleware(effectDispatcher, sagaMiddleware)
    );
    sagaMiddleware.run(saga);

    expect(store.getState()).toEqual({state: 0, effect: undefined});
    store.dispatch({type: 'INCREMENT'});
    expect(store.getState()).toEqual({state: 1, effect: undefined});

  });

  it('unpacks multiple effects', () => {
    const rosmaroModel = ({state = 0, action}) => {
      switch (action.type) {
        case 'INCREMENT':
          return {
            state,
            result: {
              data: undefined,
              effect: [
                {type: 'INCREMENT'},
                [
                  {type: 'INCREMENT'},
                  {type: 'INCREMENT'},
                  [
                    {type: 'INCREMENT'},
                  ]
                ]
              ]
            }
          };
        case 'ACTUALLY_INCREMENT':
          return {
            state: state + 1,
            result: {data: undefined, effect: undefined}
          };
        default:
          return {state, result: {data: undefined, effect: undefined}};
      }
    };

    const increment = function* () {
      yield put({type: 'ACTUALLY_INCREMENT'});
    };

    const watchIncrement = function* () {
      yield takeEvery('INCREMENT', increment);
    };

     const saga = function* () {
      yield all([
        watchIncrement()
      ]);
    };

    const rootReducer = makeReducer(rosmaroModel);

    const sagaMiddleware = createSagaMiddleware({emitter});

    const store = createStore(
      rootReducer,
      applyMiddleware(effectDispatcher, sagaMiddleware)
    );
    sagaMiddleware.run(saga);

    expect(store.getState()).toEqual({state: 0, effect: undefined});
    store.dispatch({type: 'INCREMENT'});
    expect(store.getState()).toEqual({state: 4, effect: undefined});
    store.dispatch({type: 'INCREMENT'});
    expect(store.getState()).toEqual({state: 8, effect: undefined});
  });

});