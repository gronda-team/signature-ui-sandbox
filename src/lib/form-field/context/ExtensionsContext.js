import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { getDisplayName } from '../../../cdk/util';

export const ExtensionPropTypes = PropTypes.shape({
  /** Update the extension data in the FormField so that it will */
  updateExtensionData: PropTypes.func,
  /** Update the extension attributes in the FormField so that it will */
  updateExtensionAttributes: PropTypes.func,
  /** Extended attributes */
  extendedAttributes: PropTypes.object,
  /** Consolidates all of the extensions' onChange methods */
  extendedOnChange: PropTypes.func,
  /** Consolidates all of the extensions' onFocus methods */
  extendedOnFocus: PropTypes.func,
  /** Consolidates all of the extensions' onBlur methods */
  extendedOnBlur: PropTypes.func,
  /** Consolidates all of the extensions' onKeyDown methods */
  extendedOnKeyDown: PropTypes.func,
  /** Set the control */
  setControl: PropTypes.func,
  /** Set the input props */
  setProps: PropTypes.func,
  /** Set the available extensions */
  setExtensions: PropTypes.func,
});

export const ExtensionDefaultProps = {
  updateExtensionData: _.noop,
  updateExtensionAttributes: _.noop,
  extendedAttributes: {},
  extendedOnChange: _.noop,
  extendedOnFocus: _.noop,
  extendedOnBlur: _.noop,
  extendedOnKeyDown: _.noop,
  setControl: _.noop,
  setProps: _.noop,
  setExtensions: _.noop,
};

export const {
  Provider: ExtensionsProvider,
  Consumer: ExtensionsConsumer,
} = React.createContext(ExtensionDefaultProps);

export function withExtensionManager(Component) {
  // Must be a class component since refs can't exist on functional components
  class WithExtensionManager extends React.Component {
    render() {
      const { forwardedRef, ...restProps } = this.props;
      return (
        <ExtensionsConsumer>
          { manager => (
            <Component
              {...restProps}
              __extensionManager={manager}
              ref={forwardedRef}
            />
          ) }
        </ExtensionsConsumer>
      );
    }
  }

  // Create a forward ref to pass any refs through
  function forwardRef(props, ref) {
    return <WithExtensionManager {...props} forwardedRef={ref} />;
  }

  forwardRef.displayName = `WithExtensionManager(${getDisplayName(Component)})`;

  return React.forwardRef(forwardRef);
}

