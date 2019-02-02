import { Machine } from 'xstate';

export const UIMachine = Machine({
  parallel: true,
  states: {
    'field': {
      initial: 'enabled',
      states: {
        'disabled': {
          on: { ENABLE: 'enabled.$history' },
        },
        'enabled': {
          initial: 'idle',
          states: {
            'idle': {
              on: { FOCUS: 'focused' },
            },
            'focused': {
              on: { BLUR: 'idle' },
            },
          },
          on: { DISABLE: 'disabled' },
        },
      },
    },
    'value': {
      /*
      Handle whether or not the form field has a value. Affects idle styling
       */
      initial: 'empty',
      states: {
        'empty': {
          on: { FILL: 'filled' },
        },
        'filled': {
          on: { CLEAR: 'empty' },
        },
      },
    },
    'required-status': {
      initial: 'optional',
      states: {
        'optional': {
          on: { REQUIRE: 'required' },
        },
        'required': {
          on: { UNREQUIRE: 'optional' },
        },
      },
    },
    'autofilled-status': {
      initial: 'empty',
      states: {
        'empty': {
          on: { AUTOFILL: 'filled' },
        },
        'filled': {
          on: { REMOVE_AUTOFILL: 'empty' },
        },
      },
    },
  },
});

export default UIMachine;
