import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import DividerRoot from './styles';

function Divider({ vertical, inset, ...restProps }) {
  return (
    <DividerRoot
      {...restProps}
      role="separator"
      data-inset={inset.toString()}
      aria-orientation={vertical ? 'vertical' : 'horizontal'}
    />
  )
}

Divider.propTypes = {
  /** Whether the divider is vertically aligned. */
  vertical: PropTypes.bool,
  /** Whether the divider is an inset divider. */
  inset: PropTypes.bool,
};

Divider.defaultProps = {
  vertical: false,
  inset: false,
};
