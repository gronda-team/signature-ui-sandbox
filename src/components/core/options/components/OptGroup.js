import * as React from 'react';
import PropTypes from 'prop-types';
import uniqueId from 'lodash/uniqueId';
import { OptGroupLabel } from './styles';

export default class OptGroup extends React.Component {
  id = uniqueId('opt-group-');
  render() {
    const { label, children, __SUI_INTERNAL_TYPE, ...restProps } = this.props;
    return (
      <div
        {...restProps}
        role="group"
        aria-labelledby={this.id}
        aria-disabled={this.props.disabled}
      >
        <OptGroupLabel id={this.id}>{ label }</OptGroupLabel>
        { React.Children.map(children, child => React.cloneElement(child, {
          group: label,
          disabled: this.props.disabled || child.props.disabled,
        })) }
      </div>
    )
  }
}

OptGroup.propTypes = {
  disabled: PropTypes.bool,
  label: PropTypes.string,
};

OptGroup.defaultProps = {
  disabled: false,
  label: null,
  __SUI_INTERNAL_TYPE: 'OptGroup',
};