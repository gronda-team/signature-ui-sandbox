import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {PROP_TYPE_STRING_OR_NUMBER} from '../../cdk/util';
import { Overlay } from '../../cdk/overlay';
import {ESC, ESCAPE} from '../../cdk/keycodes/keys';
import {OverlayContainerDefaultProps, OverlayContainerPropTypes} from '../../cdk/overlay/context/overlay-container';

/**
 * Dialog component that uses CDK Overlay behind the scenes.
 *
 * This dialog can manage its own instantiation/teardown, but is
 * also capable of opening child dialogs as well.
 */
class Dialog extends React.Component {
  constructor() {
    super();

    this.state = {
      /** Other open dialogs (if this dialog opens a child dialog) */
      openDialogsAtThisLevel: [],
      /**
       * List of self-expiring actions that will be invoked
       * when the dialog animates.
       */
      animationChangeStateActions: [],
    };

    /** Refs, constants */
    this.DEFAULT_ID = _.uniqueId('sui-overlay:');
    /** We don't need this to be reactive, so it can remain as instance var */
    this.ARIA_HIDDEN_ELEMENTS = [];
    this.overlay = React.createRef();
    this.container = React.createRef();
    /**
     * Listeners that can only be called once
     */
    /** Dispose the overlay when the animation is complete */
    this.disposeOverlay = _.once(() => {
      this.getOverlay().dispose();
    });
    /** Invoke the onOpen listener only once */
    this.emitOnOpen = _.once(() => {
      this.props.onOpen();
    });
    /** Detach the overlay backdrop (done in concert with the animation) */
    this.detachBackdrop = _.once(() => {
      this.getOverlay().detachBackdrop();
    });
  }

  componentDidMount() {
    this.setState({
      animationChangeStateActions: [{
        id: 'call-onOpened',
        callback: (event) => {
          if (!(event.phaseName === 'done' && event.toState === 'enter')) return;
          // Must only be invoked once
          this.emitOnOpen();
        },
      }, {
        id: 'call-dispose',
        callback: (event) => {
          if (!(event.phaseName === 'done' && event.toState === 'exit')) return;
          // Invoke dispose only once
          this.disposeOverlay();
        },
      }],
    });
  }

  /**
   * Derived data
   */
  /** Get the id; defaults to DEFAULT_ID */
  getId = () => this.props.id || this.DEFAULT_ID;

  /** Get a reference to the CDK Overlay */
  getOverlay = () => _.get(this.overlay, 'current', {});

  /** Get a reference to the Dialog container */
  getContainer = () => _.get(this.container, 'current', {});

  /** Get the currently open dialogs */
  getOpenDialogs = () => this.props.__parentDialog.getOpenDialogs() || this.state.openDialogsAtThisLevel;

  /** Remove an open dialog */
  removeDialog = (id) => {
    /**
     * Check to see if the parent provides the removeDialog
     * function. If it does, then invoke it and return
     * so it is only set at the top level parent.
     */
    if (_.isFunction(this.props.__parentDialog.removeDialog)) {
      this.props.__parentDialog.removeDialog(id);
      return;
    }

    /**
     * If the overlay does not have a parent, it will
     * end up here and will remove the topmost dialog
     * where necessary.
     */
    this.setState((state) => {
      const openDialogs = [...state.openDialogsAtThisLevel];
      const index = _.findIndex(openDialogs, { id });
      openDialogs.splice(index, 1);
      return { openDialogsAtThisLevel: openDialogs };
    });
  };

  /** Add a dialog (follows same logic as removeDialog) */
  addDialog = ({ id, dialog }) => {
    // See removeDialog to see how this works
    if (_.isFunction(this.props.__parentDialog.addDialog)) {
      this.props.__parentDialog.addDialog({ id, dialog });
      return;
    }

    this.setState(state => ({
      openDialogsAtThisLevel: [...state.openDialogsAtThisLevel, { id, dialog }],
    }), () => {

    });
  };

  /**
   * Actions
   */
  /** Open the modal dialog */
  open = () => {
    /**
     * If this is the first dialog we're opening then hide all
     * non-overlay content from screen readers and such.
     */
    if (!this.getOpenDialogs().length) {
      hideNonDialogContentFromAssistiveTechnology.call(this);
    }
  };

  /** Close the overlay */
  close = () => {
    this.setState(state => ({
      animationChangeStateActions: [...state.animationChangeStateActions, {
        id: 'transition-backdrop',
        callback: (event) => {
          if (event.phaseName !== 'start') return;
          // Invoke this only once
          this.detachBackdrop();
        },
      }],
    }), () => {
      /** Trigger all of the callbacks to be done */
      this.getContainer().startExitAnimation();
    });
  };

  /** Handle the listeners/cleanup upon animation */
  handleAnimationListeners = (event) => {
    /** Invoke all of the listeners that are present */
    this.state.animationChangeStateActions.forEach((info) => {
      info.callback(event);
    });
  };

  /** Invoke listeners when being called */
  handleOverlayDetachment = () => {
    this.props.onClose();
    this.getOverlay().dispose();
  };

  /** Handle overlay closing */
  handleOverlayKeyDown = (event) => {
    if ([ESC, ESCAPE].indexOf(event.key) > -1 && !this.props.disableClose) {
      this.close();
    }
  };

  /**
   * Renderers
   */
  render() {
    return (
      <Overlay
        ref={this.overlay}
        onDetach={this.handleOverlayDetachment}
        onKeyDown={this.handleOverlayKeyDown}
      >
        <DialogContainer
          id={this.getId()}
          onAnimationStateChange={this.handleAnimationListeners}
          ref={this.container}
        >
          { this.props.children }
        </DialogContainer>
      </Overlay>
    )
  }
}

const DialogPropTypes = {
  /** ID for the dialog. If omitted, a unique one will be generated. */
  id: PropTypes.string,
  /** The ARIA role of the dialog element */
  role: PropTypes.string,
  /** Whether the user can use escape or clicking on the backdrop to close the modal. */
  disableClose: PropTypes.bool,
  /** Additional panel classes */
  panelClass: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  /** The configuration for the backdrop */
  backdrop: PropTypes.oneOf(['transparent', 'dark', 'light']),
  /** Width of the dialog */
  width: PropTypes.string,
  /** Height of the dialog */
  height: PropTypes.string,
  /** Minimum width of the dialog. Number coerced to pixels */
  minWidth: PROP_TYPE_STRING_OR_NUMBER,
  /** Minimum height of the dialog. Number coerced to pixels */
  minHeight: PropTypes.string,
  /** Maximum width of the dialog. Number coerced to pixels */
  maxWidth: PropTypes.string,
  /** Maximum height of the dialog. Number coerced to pixels */
  maxHeight: PropTypes.string,
  /** Position override */
  position: PropTypes.shape({
    top: PropTypes.string,
    bottom: PropTypes.string,
    left: PropTypes.string,
    right: PropTypes.string,
  }),
  /** Layout direction for the dialog's content. */
  dir: PropTypes.oneOf(['ltr', 'rtl', 'auto']),
  /** id of the element that describes the dialog */
  ariaDescribedBy: PropTypes.string,
  /** aria label to assign to the dialog element */
  ariaLabel: PropTypes.string,
  /** Whether the dialog should focus the first focusable element */
  autoFocus: PropTypes.bool,
  /**
   * Whether the dialog should restore focus to the most recently
   * focused element before the dialog was open (after it's closed)
   */
  restoreFocus: PropTypes.bool,
  /** Scroll strategy to be used for the dialog */
  scrollStrategy: PropTypes.shape({}),
  /** Whether the dialog should close when the user navigates */
  closeOnNavigation: PropTypes.bool,
};

const DialogDefaultProps = {
  id: null,
  role: 'dialog',
  panelClass: '',
  disableClose: false,
  backdrop: null,
  width: '',
  height: '',
  minWidth: null,
  minHeight: null,
  maxWidth: '80vw',
  maxHeight: null,
  position: null,
  dir: 'ltr',
  ariaDescribedBy: null,
  ariaLabel: null,
  autoFocus: true,
  restoreFocus: true,
  scrollStrategy: null,
  closeOnNavigation: true,
};

Dialog.propTypes = {
  ...DialogPropTypes,
  __overlayContainer: OverlayContainerPropTypes,
};

Dialog.defaultProps = {
  ...DialogDefaultProps,
  __overlayContainer: OverlayContainerDefaultProps,
};

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

/** Remove a dialog from the saved list of open dialogs */
function removeOpenDialog(id) {
  const index = _.findIndex(this.getOpenDialogs(), { id });

  if (index > -1) {
    /**
     * Recursively call parents' removeDialog method until
     * we get to the topmost parent, and then remove the
     * dialog from there.
     */
    this.removeDialog(id);
  }
}
