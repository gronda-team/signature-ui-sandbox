import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {getDisplayName} from '../../../cdk/util';

/**
 * We require a manager and context because when
 * dialogs are opened, the accessibility of
 * non-dialog content must be managed (hidden from
 * screen readers and the like).
 *
 * This requires a root-level manager similar to
 * the OverlayContainer and others. This way,
 * we won't have to worry about managing accessibility
 * concerns at the dialog level.
 */

const DialogManagerPropTypes = PropTypes.shape({
  /** Unchanging ID of the dialog manager */
  id: PropTypes.string,
  /** Add a dialog to the list of managed dialogs */
  add: PropTypes.func,
  /** Remove a dialog from the list of managed dialogs */
  remove: PropTypes.func,
  /** Recursive getter for dialog manager */
  getOpenDialogs: PropTypes.func,
});

const DialogManagerDefaultProps = {
  id: null,
  add: _.noop,
  remove: _.noop,
  getOpenDialogs: _.noop,
};

const {
  Provider: DialogManagerProvider,
  Consumer: DialogManagerConsumer,
} = React.createContext(DialogManagerDefaultProps);

/**
 * Create a higher order component that can make
 * use of the DialogManager interface.
 */
function withDialogManager(Component) {
  /** Must use classes to handle forwarded refs */
  class WithDialogManager extends React.Component {
    render() {
      const { forwardedRef, ...restProps } = this.props;
      return (
        <DialogManagerConsumer>
          { value => (
            <Component
              {...restProps}
              __dialogManager={value}
              ref={forwardedRef}
            />
          ) }
        </DialogManagerConsumer>
      );
    }
  }

  /** Create a forward ref */
  function forwardRef(props, ref) {
    return <WithDialogManager {...props} forwardedRef={ref} />;
  }

  forwardRef.displayName = `WithDialogManager(${getDisplayName(Component)})`;

  return React.forwardRef(forwardRef);
}

export {
  DialogManagerPropTypes,
  DialogManagerDefaultProps,
  DialogManagerConsumer,
  DialogManagerProvider,
  withDialogManager,
};
