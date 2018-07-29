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
import {makeReducer, effectDispatcher, emitter} from 'rosmaro-redux';
```

Let's assume that `rosmaroModel` is a Rosmaro model, that is a `({state, action}) => ({state, result})` function. Then the reducer is built in the following way:
```javascript
import {makeReducer, effectDispatcher, emitter} from 'rosmaro-redux';

const rootReducer = makeReducer(rosmaroModel);
```

We must provide a special emmiter to the Redux-Saga middleware:
```javascript
import {makeReducer, effectDispatcher, emitter} from 'rosmaro-redux';
import createSagaMiddleware from 'redux-saga';

const rootReducer = makeReducer(rosmaroModel);
const sagaMiddleware = createSagaMiddleware({emitter});
```

The store requires two middlewares:
```javascript
import {makeReducer, effectDispatcher, emitter} from 'rosmaro-redux';
import createSagaMiddleware from 'redux-saga';
import {createStore, applyMiddleware} from 'redux';

const rootReducer = makeReducer(rosmaroModel);
const sagaMiddleware = createSagaMiddleware({emitter});
const store = createStore(
  rootReducer,
  applyMiddleware(effectDispatcher, sagaMiddleware)
);
```

Assuming that `saga` is our saga, we run in in the following way:
```javascript
import {makeReducer, effectDispatcher, emitter} from 'rosmaro-redux';
import createSagaMiddleware from 'redux-saga';
import {createStore, applyMiddleware} from 'redux';

const rootReducer = makeReducer(rosmaroModel);
const sagaMiddleware = createSagaMiddleware({emitter});
const store = createStore(
  rootReducer,
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
import {makeReducer, effectDispatcher, emitter} from 'rosmaro-redux';
import createSagaMiddleware from 'redux-saga';
import {createStore, applyMiddleware} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension';

const rootReducer = makeReducer(rosmaroModel);
const sagaMiddleware = createSagaMiddleware({emitter});
const store = createStore(
  rootReducer,
  composeWithDevTools(
    applyMiddleware(effectDispatcher, sagaMiddleware)
  )
);
sagaMiddleware.run(saga);
```

For more information, please check [the official documentation of Redux DevTools](http://extension.remotedev.io) out.

## How to write Rosmaro handlers

Every [Rosmaro handler](https://rosmaro.js.org/doc/#bindings) is supposed to return a result in the shape of `{data, effect}`.
While the `data` may be an arbitrary value, the `effect` needs to be either an an effect object recognized by the saga or an array of effect objects (or arrays of them).
This is a simple, valid result value:
```
{data: undefined, effect: {type: 'INCREMENT', value: 42}}
```
But also this is correct:
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