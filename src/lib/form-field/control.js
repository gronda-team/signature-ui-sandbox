import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

export const FormFieldPropTypes = PropTypes.shape({
  ui: PropTypes.shape({}),
  transitionUi: PropTypes.func,
  id: PropTypes.string,
  placeholder: PropTypes.string,
  containerClick: PropTypes.func,
  setId: PropTypes.func,
  setPlaceholder: PropTypes.func,
  setContainerClick: PropTypes.func,
  describedByIds: PropTypes.arrayOf(PropTypes.string),
  changeDescribedByIds: PropTypes.func,
});

export const FormFieldDefaultProps = {
  // ui interfacing
  ui: {},
  // transitioning the UI
  transitionUi: _.noop,
  // element ID for the control
  id: '',
  // placeholder for the control
  placeholder: '',
  // callback for container click
  containerClick: _.noop,
  // updating ID
  setId: _.noop,
  // updating the placeholder
  setPlaceholder: _.noop,
  // set container click
  setContainerClick: _.noop,
  // described by IDs
  describedByIds: [],
  // change described by IDs
  changeDescribedByIds: _.noop,
};

export const { Provider, Consumer } = React.createContext(FormFieldDefaultProps);

export function withFormFieldConsumer(Component) {
  return props => (
    <Consumer>
      { context => (
        <Component {...props} __formFieldControl={context} />
      ) }
    </Consumer>
  )
}

