import * as React from 'react';
import PropTypes from 'prop-types';

export default function Check({ stroke, ...restProps }) {
  return (
    <svg {...restProps} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" version="1.1">
      <path stroke={stroke} d="M 5,10 8,13 15,7" />
    </svg>
  );
}

Check.propTypes = {
  stroke: PropTypes.string,
};

Check.defaultProps = {
  stroke: undefined,
};

Check.displayName = 'CheckIcon';
