import keys from 'lodash/keys';
import { Machine } from 'xstate';

export const FORM_ACTIONS = [
  'INVALIDATE',
  'VALIDATE',
  'VALIDATE_ASYNC',
  'DISABLE',
  'ENABLE',
  'EDIT',
  'TOUCH',
];

export const FORM_ACTION_TYPES = FORM_ACTIONS.reduce((acc, action) => {
  acc[action] = action;
  return acc;
}, {});

export const UIMachine = Machine({
  states: {
    'valid': {
      on: { [FORM_ACTION_TYPES.INVALIDATE]: 'enabled.$history.$history' },
    },
    'invalid': {
    
    }
  },
});

export default UIMachine;
