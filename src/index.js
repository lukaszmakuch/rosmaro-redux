export const makeReducer = rosmaroModel => 
  (stateAndEffect = {state: undefined, effect: undefined}, action) => {
    if (action.type === 'EFFECT') {
      return {state: stateAndEffect.state, effect: undefined};
    }

    const {
      state: newState,
      result: {effect}
    } = rosmaroModel({
      state: stateAndEffect.state,
      action
    });
    return {state: newState, effect};
  };

const flattenEffects = effect => {
  if (Array.isArray(effect)) {
    return effect.reduce(
      (flat, effects) => [...flat, ...flattenEffects(effects)], 
      []
    );
  } else {
    return [effect];
  }
};

export const emitter = emit => action => {
  if (action.type === 'EFFECT') {
    flattenEffects(action.effect).forEach(emit);
  }
};

export const effectDispatcher = store => next => action => {
  next(action);
  const {effect} = store.getState();
  if (effect) store.dispatch({type: 'EFFECT', effect});
};