import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

/**
 * Manager that tracks open dialogs and handles accessibility
 * capabilities.
 */

class DialogManager extends React.Component {
  constructor() {
    super();

    this.state = {
      /** The currently open dialogs */
      openDialogsAtThisLevel: [],
      /**
       * The siblings to the overlay container, for which we must
       * update aria-hidden when dialogs are open.
       */
      ariaHiddenElements: [],
    };
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
  getOpenDialogs = () => {
    if (this.state.parentDialog) return this.state.parentDialog.openDialogs;
    return this.state.openDialogsAtThisLevel;
  };

  /** Get current overlay */
  getOverlay = () => _.get(this.overlay, 'current', {});

  /** Get an open dialog by its id */
  getDialogById = id => _.find(this.getOpenDialogs(), { id });

  render() {

  }
}

export default DialogManager;

/**
 * Private methods
 */
/** Close all of the dialogs as provided by an array */
function closeDialogs(dialogs) {
  let i = dialogs.length;

  while (i--) {
    /**
     * Loop through all of the open dialogs in reverse order and close them
     */
    dialogs[i].close();
  }
}
