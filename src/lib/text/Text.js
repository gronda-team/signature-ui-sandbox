import * as React from 'react';
import PropTypes from 'prop-types';
import { BaseText } from './styles';
import { getDisplayName } from '../../cdk/util';

function Text({ children, level, as, forwardedRef, ...rest }) {
  return (
    <BaseText
      {...rest}
      as={as}
      ref={forwardedRef}
      data-text-level={level}
    >
      { children }
    </BaseText>
  );
}

Text.propTypes = {
  /** Alias SCv4 `as` prop */
  as: PropTypes.string,
  level: PropTypes.oneOf([
    'fontFamily', 'display1', 'display2', 'display3', 'display4', 'display5',
    'body1', 'body2', 'body3', 'micro', 'button', 'input'
  ]),
};

Text.defaultProps = {
  as: 'span',
  level: 'body3',
};

Text.displayName = 'Text';

const TextWithForwardedRef = React.forwardRef((props, ref) => (
  <Text {...props} forwardedRef={ref} />
));

TextWithForwardedRef.propTypes = Text.propTypes;
TextWithForwardedRef.defaultProps = Text.defaultProps;

export default TextWithForwardedRef;
