export const isEffect = effect => effect.isARosmaroEffect;
const markAsEffect = effect => ({...effect, isARosmaroEffect: true});

export const makeReducer = model => (
  {state, effect} = {state: undefined, effect: undefined}, 
  action
) => {
  if (isEffect(action)) {
    return {state, effect: undefined};
  }

  const {
    state: newState,
    result: {effect: newEffect}
  } = model({state, action});
  return {state: newState, effect: newEffect};
};

export const effectDispatcher = ({getState, dispatch}) => next => action => {
  const result = next(action);
  const {effect} = getState();
  if (effect) {
    if (Array.isArray(effect)) {
      effect.forEach(e => dispatch(markAsEffect(e)))
    } else {
      dispatch(markAsEffect(effect));
    }
  }

  return result;
};