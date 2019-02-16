import PropTypes from 'prop-types';

/**
 * Function that can be bound to class instances
 * (like this.isRtl = isRtl.bind(this) in the
 * constructor) to detect whether the current prop
 * is an RTL context.
 * @returns {boolean}
 */
export function isRtl() {
  return this.props.dir === 'rtl';
}

/**
 * RTL prop types and default props
 */
export const RTLPropTypes = {
  dir: PropTypes.oneOf(['ltr', 'rtl', 'auto']),
};

export const RTLDefaultProps = {
  dir: 'ltr',
};
