# Rosmaro-Redux

Connects [Rosmaro](https://rosmaro.js.org), [Redux](https://redux.js.org) and [Redux-saga](https://redux-saga.js.org).

Uses [Rosmaro](https://rosmaro.js.org) to implement state-related functions, like the reducer.

Uses [Redux](https://redux.js.org) to build a stateful object - the store.

Uses [Redux-saga](https://redux-saga.js.org) to handle side-effects.

## How to set up rosmaro-redux

First, the package needs to be installed:
```
npm i rosmaro-redux
```

Then, all the dependencies need to be imported into the same file, where the Redux store is built:
```javascript
import {makeReducer, effectDispatcher} from 'rosmaro-redux';
```

Let's assume that `rosmaroModel` is a Rosmaro model, that is a `({state, action}) => ({state, result})` function. Then the reducer is built in the following way:
```javascript
import {makeReducer, effectDispatcher} from 'rosmaro-redux';

const reducer = makeReducer(rosmaroModel);
```

The store requires two middlewares:
```javascript
import {makeReducer, effectDispatcher} from 'rosmaro-redux';
import createSagaMiddleware from 'redux-saga';
import {createStore, applyMiddleware} from 'redux';

const reducer = makeReducer(rosmaroModel);
const sagaMiddleware = createSagaMiddleware();
const store = createStore(
  reducer,
  applyMiddleware(effectDispatcher, sagaMiddleware)
);
```

Assuming that `saga` is our saga, we run in in the following way:
```javascript
import {makeReducer, effectDispatcher} from 'rosmaro-redux';
import createSagaMiddleware from 'redux-saga';
import {createStore, applyMiddleware} from 'redux';

const reducer = makeReducer(rosmaroModel);
const sagaMiddleware = createSagaMiddleware();
const store = createStore(
  reducer,
  applyMiddleware(effectDispatcher, sagaMiddleware)
);
sagaMiddleware.run(saga);
```

## Using Rosmaro Redux with Redux DevTools
Due to `effectDispatcher`, which is a required middleware, we need to compose enhancers.

To make things easier, we can use the the `redux-devtools-extension` package:
```
npm i redux-devtools-extension
```
```javascript
import {makeReducer, effectDispatcher} from 'rosmaro-redux';
import createSagaMiddleware from 'redux-saga';
import {createStore, applyMiddleware} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';

const reducer = makeReducer(rosmaroModel);
const sagaMiddleware = createSagaMiddleware();
const store = createStore(
  reducer,
  composeWithDevTools(
    applyMiddleware(effectDispatcher, sagaMiddleware)
  )
);
sagaMiddleware.run(saga);
```

For more information, please check [the official documentation of Redux DevTools](http://extension.remotedev.io) out.

## How to write Rosmaro handlers

Every [Rosmaro handler](https://rosmaro.js.org/doc/#bindings) is supposed to return a result in the shape of `{data, effect}`.
While the `data` may be an arbitrary value, the `effect` needs to be either an action recognized as an effect by the saga or an array of effects.
This is a simple, valid result value:
```
{data: undefined, effect: {type: 'INCREMENT', value: 42}}
```
This is correct as well:
```
{
  data: undefined, 
  effect: [
    {type: 'INCREMENT', value: 1},
    {type: 'INCREMENT', value: 2},
    [
      {type: 'INCREMENT', value: 3},
      {type: 'INCREMENT', value: 4},
    ],
    {type: 'INCREMENT', value: 5}
  ]
}
```

You may like the [rosmaro-binding-utils](https://github.com/lukaszmakuch/rosmaro-binding-utils) package. It makes returning a result in the shape of `{data, effect}` easy.

## Redux-Saga - reacting only to effects
This package exports a tiny predicate - `isEffect`.
```javascript
import {isEffect} from 'rosmaro-redux';
```

This functions returns `true` when it's given an action which was returned as an `effect`. That way we can distinguish actions simply dispatched to the store from actions returned as effects.

Here's an example of taking only those `INCREMENT` actions which are effects:
```
import {isEffect} from 'rosmaro-redux';
// ...
yield takeEvery(action => isEffect(action) && action.type === 'INCREMENT', increment);
```