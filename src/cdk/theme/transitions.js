export const TRANSITION_CURVE = {
  DEFAULT: 'cubic-bezier(0.2, 0, 0.6, 1)',
};

export const TRANSITION_TIMING = {
  FAST: '50ms',
  DEFAULT: '200ms',
  SLOW: '250ms',
};

export const TRANSITION = ({speed = 'DEFAULT', curve = 'DEFAULT'} = {speed: 'DEFAULT', curve: 'DEFAULT'}) =>
  `${TRANSITION_TIMING[speed]} ${TRANSITION_CURVE[curve]}`;