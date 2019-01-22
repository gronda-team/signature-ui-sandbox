import keys from 'lodash/keys';
import { Machine } from 'xstate';

export const UI_ACTION_TYPES = {
  ENABLE: 'ENABLE',
  FOCUS: 'FOCUS',
  ENTER: 'ENTER',
  BLUR: 'BLUR',
  EXIT: 'EXIT',
  ERROR: 'ERROR',
  RESOLVE: 'RESOLVE',
  DISABLE: 'DISABLE',
  REQUIRE: 'REQUIRE',
  UNREQUIRE: 'UNREQUIRE',
};

export const ALL_UI_ACTIONS = keys(UI_ACTION_TYPES);

export const UIMachine = Machine({
  parallel: true,
  states: {
    'ui': {
      initial: 'enabled',
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
                  },
                },
                'focus': {
                  on: {
                    [UI_ACTION_TYPES.BLUR]: 'idle',
                  },
                },
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
    },
    'required-status': {
      initial: 'optional',
      states: {
        'optional': {
          on: { [UI_ACTION_TYPES.REQUIRE]: 'required' },
        },
        'required': {
          on: { [UI_ACTION_TYPES.UNREQUIRE]: 'optional' },
        }
      }
    }
  },
});

export default UIMachine;
