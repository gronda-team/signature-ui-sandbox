import { Machine } from 'xstate';

const LOG_OUT = 'LOG_OUT';
const LOG_IN = 'LOG_IN';

export const StateMachine = Machine({
  initial: 'unauthorized',
  states: {
    'unauthorized': {
      on: { [LOG_IN]: 'authorized' },
    },
    'authorized': {
      on: { [LOG_OUT]: 'unauthorized' },
      initial: 'explore',
      
    }
  },
});