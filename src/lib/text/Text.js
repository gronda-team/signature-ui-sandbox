import * as React from 'react';
import PropTypes from 'prop-types';
import { BaseText } from './styles';

BaseText.propTypes = {
  /** Alias SCv4 `as` prop */
  as: PropTypes.string,
  level: PropTypes.oneOf([
    'fontFamily', 'display1', 'display2', 'display3', 'display4', 'display5',
    'body1', 'body2', 'body3', 'micro', 'button', 'input'
  ]),
};

BaseText.defaultProps = {
  as: 'span',
  level: 'body3',
};

BaseText.displayName = 'Text';

export default BaseText;
