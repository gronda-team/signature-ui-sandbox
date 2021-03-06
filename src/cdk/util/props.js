import PropTypes from 'prop-types';

export const PROP_TYPE_STRING_OR_NUMBER =
  PropTypes.oneOfType([PropTypes.string, PropTypes.number]);

export function getDisplayName(Component) {
  return Component.displayName
  || Component.name
  || 'Component';
}
