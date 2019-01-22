import keys from 'lodash/keys';
import { Machine } from 'xstate';

export const UI_ACTION_TYPES = {
  ENABLE: 'ENABLE',
  DISABLE: 'DISABLE',
  FOCUS: 'FOCUS',
  BLUR: 'BLUR',
  ERROR: 'ERROR',
  RESOLVE: 'RESOLVE',
};

export const ALL_UI_ACTIONS = keys(UI_ACTION_TYPES);

export const UIMachine = Machine({
  parallel: true,
  states: {
    'disabled': {
      on: { [UI_ACTION_TYPES.ENABLE]: 'enabled.$history.$history' },
    },
    'enabled': {
      initial: 'normal',
      states: {
        'normal': {
          initial: 'idle',
          states: {
            'idle': {
              on: {
                [UI_ACTION_TYPES.FOCUS]: 'focus',
                [UI_ACTION_TYPES.ENTER]: 'active', // alias for one-way entering
              },
            },
            'focus': {
              on: {
                [UI_ACTION_TYPES.BLUR]: 'idle',
                [UI_ACTION_TYPES.ENTER]: 'active',
              },
            },
            'active': {
              on: {
                [UI_ACTION_TYPES.EXIT]: {
                  'focus': { cond: (extState, eventObj) => eventObj.from === 'dropdown' },
                  'idle': { cond: (extState, eventObj) => eventObj.from !== 'dropdown' },
                }
              },
            }
          },
          on: { [UI_ACTION_TYPES.ERROR]: 'error' },
        },
        'error': {
          on: {
            [UI_ACTION_TYPES.RESOLVE]: {
              'normal.active': { cond: (extState, eventObj) => eventObj.from === 'input' },
              'normal.focus': { cond: (extState, eventObj) => eventObj.from !== 'input' },
            }
          },
        },
      },
      on: { [UI_ACTION_TYPES.DISABLE]: 'disabled' },
    },
  },
});

export default UIMachine;
