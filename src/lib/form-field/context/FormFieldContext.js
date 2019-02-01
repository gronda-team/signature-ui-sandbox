import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

const FormFieldPropTypes = PropTypes.shape({
  /** DOM element for root */
  root: PropTypes.any,
  /** Get the connected origin */
  getConnectedOrigin: PropTypes.func,
  /** Unique id for the internal form field label. */
  labelId: PropTypes.string,
});
