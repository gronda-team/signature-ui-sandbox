import * as React from 'react';
import PropTypes from 'prop-types';
import { BaseText } from './styles';

class Text extends React.Component {
  constructor(props) {
    super(props);

    this.TEXT = BaseText.withComponent(props.is);
  }

  render() {
    const { children, level, is, ...rest } = this.props;
    return (
      <this.TEXT
        {...rest}
        data-text-level={level}
      >
        { children }
      </this.TEXT>
    );
  }
}

Text.propTypes = {
  is: PropTypes.string,
  level: PropTypes.oneOf([
    'fontFamily', 'display1', 'display2', 'display3', 'display4', 'display5',
    'body1', 'body2', 'body3', 'micro', 'button', 'input'
  ]),
};

Text.defaultProps = {
  is: 'span',
  level: 'body3',
};

export default Text;
