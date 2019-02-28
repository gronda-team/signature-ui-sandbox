import * as React from 'react';
import _ from 'lodash';
import {
  DialogManagerDefaultProps,
  DialogManagerPropTypes,
  DialogManagerProvider
} from './context/DialogManagerContext';
import {
  OverlayContainerDefaultProps,
  OverlayContainerPropTypes,
  withOverlayContainerConsumer
} from '../../cdk/overlay/context';

/**
 * Manager that tracks open dialogs and handles accessibility
 * capabilities.
 *
 * This can be nested where necessary.
 */

class DialogManager extends React.Component {
  constructor() {
    super();

    this.DEFAULT_ID = _.uniqueId('sui-dialog-manager:');

    this.state = {
      /** The currently open dialogs */
      openDialogsAtThisLevel: [],
      /** Currently available listeners for when dialogs open */
      afterOpenedListeners: [],
      /** Provider for the dialog consumers below */
      provide: {
        getOpenDialogs: this.getOpenDialogs,
        id: this.DEFAULT_ID,
        add: this.add,
        remove: this.remove,
      },
    };

    this.ARIA_HIDDEN_ELEMENTS = [];
  }

  /**
   * Lifecycle
   */
  componentWillUnmount() {
    /**
     * Only close the dialogs at this level on destroy
     * since the parent may be active.
     */
    closeDialogs.call(this, this.state.openDialogsAtThisLevel);
  }

  /**
   * Derived data
   */
  /** Keeps track of the currently open dialogs */
  getOpenDialogs = () => (
    this.props.__dialogManager.getOpenDialogs() || this.state.openDialogsAtThisLevel
  );

  /** Get an open dialog by its id */
  getDialogById = id => _.find(this.getOpenDialogs(), { id });

  /**
   * Actions
   */
  /** Add dialog */
  add = ({ id, dialog }) => {
    /** Don't re-add the same dialog twice */
    if (this.getDialogById(id)) return;

    /**
     * If this is the first dialog we're opening,
     * then hide all of the non-dialog related
     * content from screen readers and the like.
     */
    if (!this.getOpenDialogs().length) {
      hideNonDialogContentFromAssistiveTechnology.call(this);
    }

    /** Add the dialog reference to the manager */
    addDialogRef.call(this, { id, dialog });
  };

  /** Remove dialog by id */
  remove = (id) => {
    const dialogs = this.getOpenDialogs();
    const index = _.findIndex(dialogs, { id });

    if (index > -1) {
      removeDialogRef.call(this, id);
    }
  };

  render() {
    return (
      <DialogManagerProvider value={this.state.provide}>
        { this.props.children }
      </DialogManagerProvider>
    )
  }
}

DialogManager.propTypes = {
  __overlayContainer: OverlayContainerPropTypes,
  __dialogManager: DialogManagerPropTypes,
};

DialogManager.defaultProps = {
  __overlayContainer: OverlayContainerDefaultProps,
  __dialogManager: DialogManagerDefaultProps,
};

export default withOverlayContainerConsumer(DialogManager);

/**
 * Private methods
 */
/** Hide remaining content from assistive technology */
function hideNonDialogContentFromAssistiveTechnology() {
  const overlayContainer = this.props.__overlayContainer.getContainer();

  // Ensure that the overlay container is attached to the DOM.
  if (overlayContainer.parentElement) {
    const siblings = overlayContainer.parentElement.children;

    for (let i = siblings.length - 1; i > -1; i--) {
      // In reverse order
      let sibling = siblings[i];

      if (
        sibling !== overlayContainer
        && sibling.nodeName !== 'SCRIPT'
        && sibling.nodeName !== 'STYLE'
        && !sibling.hasAttribute('aria-live')
      ) {
        /**
         * Save a reference to the DOM element as well as
         * the previous value for aria-hidden. That way,
         * we can set it back once all the dialogs are
         * unmounted.
         */
        this.ARIA_HIDDEN_ELEMENTS.push({
          element: sibling,
          previousAttribute: sibling.getAttribute('aria-hidden'),
        });
        // Set aria-hidden for all other non-overlay container siblings
        sibling.setAttribute('aria-hidden', 'true');
      }
    }
  }
}

/** Add dialog ref to the root instance */
function addDialogRef({ id, dialog }) {
  /**
   * If there is a parent dialog manager, then add
   * the dialog to this guy recursively.
   */
  if (_.get(this.props.__dialogManager.id)) {
    addDialogRef.call(this.props.__dialogManager, { id, dialog });
    // Once complete, early return.
    return;
  }

  /**
   * If there is no parent dialog manager, then we're at the root,
   * and we can add the dialog there.
   */
  this.setState(state => ({
    openDialogsAtThisLevel: [...state.openDialogsAtThisLevel, { id, dialog }],
  }));
}

/** Remove dialog ref. Follows the same logic as addDialogRef */
function removeDialogRef(id) {
  if (_.get(this.props.__dialogManager.id)) {
    removeDialogRef.call(this.props.__dialogManager, id);
    // Once complete, early return.
    return;
  }

  /**
   * If there is no parent dialog manager, then remove the reference.
   */
  this.setState((state) => {
    const openDialogs = [...state.openDialogsAtThisLevel];
    const index = _.findIndex(openDialogs, { id });
    /** If it's not found, then don't do anything */
    if (index === -1) return null;

    /** Otherwise, splice it out */
    openDialogs.splice(index, 1);
    return { openDialogsAtThisLevel: openDialogs };
  }, () => {
    /**
     * Once all the dialogs are closed, remove/restore the 'aria-hidden'
     * attribute on the siblings.
     */
    if (!this.getOpenDialogs().length) {
      this.ARIA_HIDDEN_ELEMENTS.forEach(({ element, previousValue }) => {
        if (previousValue) {
          element.setAttribute('aria-hidden', previousValue);
        } else {
          element.removeAttribute('aria-hidden');
        }
      });
      /** Reset the array */
      this.ARIA_HIDDEN_ELEMENTS = [];
    }
  });
}

/** Close all of the dialogs as provided by an array */
function closeDialogs(info) {
  let i = info.length;

  while (i--) {
    /**
     * Loop through all of the open dialogs in reverse order and close them
     */
    info[i].dialog.close();
  }
}
