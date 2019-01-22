import React from 'react';
import PropTypes from 'prop-types';
import isNil from 'lodash/isNil';
import { LabelRequiredStatus, LabelStyle } from './styles';

export default class Label extends React.Component {
  renderRequiredStatus() {
    if (this.props.display === 'optional') {
      return this.props.required || isNil(this.props.optional) ?
        null :
        <LabelRequiredStatus data-state={this.props['data-state']} status={'optional'}>&nbsp;{ this.props.optional }</LabelRequiredStatus>;
    }
    
    return this.props.required ?
      <LabelRequiredStatus data-state={this.props['data-state']} status={'required'}>&nbsp;*</LabelRequiredStatus> : // a lonely star
      null;
  }
  
  render() {
    const { children, display, required, optional, htmlFor, ...restProps } = this.props;
    return (
      <LabelStyle {...restProps} htmlFor={htmlFor} aria-owns={htmlFor}>
        { children }
        { this.renderRequiredStatus() }
      </LabelStyle>
    )
  }
}

Label.propTypes = {
  htmlFor: PropTypes.string,
  optional: PropTypes.node,
  display: PropTypes.oneOf(['optional', 'required']),
  required: PropTypes.bool,
};

Label.defaultProps = {
  htmlFor: undefined,
  optional: null,
  display: 'required',
  required: false,
};
