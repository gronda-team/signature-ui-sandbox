import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {getDisplayName} from '../../../cdk/util';

export const FormFieldPropTypes = PropTypes.shape({
  ui: PropTypes.shape({}),
  id: PropTypes.string,
  type: PropTypes.string,
  extensions: PropTypes.objectOf(PropTypes.shape({})),
  el: PropTypes.object,
  placeholder: PropTypes.string,
  describedByIds: PropTypes.arrayOf(PropTypes.string),
  transitionUi: PropTypes.func,
  containerClick: PropTypes.func,
  setId: PropTypes.func,
  setPlaceholder: PropTypes.func,
  setContainerClick: PropTypes.func,
  setControlType: PropTypes.func,
  changeDescribedByIds: PropTypes.func,
});

export const FormFieldDefaultProps = {
  /** ui interfacing */
  ui: {},
  /** element ID for the control */
  id: '',
  /** Control type (select, input, textarea, etc.) -- used for styling */
  type: null,
  /** Extensions */
  extensions: {},
  /** Form field element (useful for autocomplete) */
  el: null,
  /** placeholder for the control */
  placeholder: '',
  /** described by IDs */
  describedByIds: [],
  /** transitioning the UI */
  transitionUi: _.noop,
  /** callback for container click */
  containerClick: _.noop,
  /** updating ID */
  setId: _.noop,
  /** updating the placeholder */
  setPlaceholder: _.noop,
  /** set container click */
  setContainerClick: _.noop,
  /** set what the control type is (required for styling) */
  setControlType: _.noop,
  /** change described by IDs */
  changeDescribedByIds: _.noop,
};

export const {
  Provider: FormFieldControlProvider,
  Consumer: FormFieldControlConsumer,
} = React.createContext(FormFieldDefaultProps);

export function withFormFieldConsumer(Component) {
  // Must be a class component since refs can't exist on functional components
  class WithFormFieldControl extends React.Component {
    render() {
      const { forwardedRef, ...restProps } = this.props;
      return (
        <FormFieldControlConsumer>
          { control => (
            <Component
              {...restProps}
              __formFieldControl={control}
              ref={forwardedRef}
            />
          ) }
        </FormFieldControlConsumer>
      );
    }
  }

  // Create a forward ref to pass any refs through
  function forwardRef(props, ref) {
    return <WithFormFieldControl {...props} forwardedRef={ref} />;
  }

  forwardRef.displayName = `WithFormFieldControl(${getDisplayName(Component)})`;

  return React.forwardRef(forwardRef);
}
