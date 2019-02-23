import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {DialogContainerRoot} from './styles';
import { FocusTrap } from '../../cdk/a11y';

class DialogContainer extends React.Component {
  constructor() {
    super();

    this.state = {
      /** The state of the current animation */
      animationState: 'null',
      /**
       * The element that was focused before the dialog was opened.
       * We need this when we want to restore focus.
       */
      elementFocusedBeforeDialogWasOpened: null,
    };

    this.EL = React.createRef();
    this.focusTrap = React.createRef();
  }

  /**
   * Derived data
   */
  /** Get the focus trap ref */
  getFocusTrap = () => _.get(this.focusTrap, 'current', {});

  /**
   * Actions
   */
  /** Attach dialog container */
  attach = () => {
    savePreviouslyFocusedElement.call(this);
    window.setTimeout(() => {
      this.setState({ animationState: 'enter' });
    }, 0);
  };

  /** Invoked when the transition starts */
  emitOnTransitionStart = () => {
    this.props.onAnimationStateChange({
      phaseName: 'start',
      /** This could be either entering or exiting. */
      toState: this.state.animationState,
    });
  };

  /** Invoked when the transition finishes */
  onTransitionEnd = () => {
    if (this.state.animationState === 'enter') {
      // If we're opening, then trap the focus immediately
      trapFocus.call(this);
    } else if (this.state.animationState === 'exit') {
      // If we're closing, restore focus to the previously focused element
      restoreFocus.call(this);
    }

    this.props.onAnimationStateChange({
      phaseName: 'done',
      /** This could be either entering or exiting. */
      toState: this.state.animationState,
    });
  };

  /** Public, start exit animation from the parent */
  startExitAnimation = () => {
    this.setState({ animationState: 'exit' });
  };

  /**
   * Renderers
   */
  render() {
    const ariaLabel = _.get(this.props, 'aria-label');
    const ariaLabelledBy = _.get(this.props, 'aria-labelledby');
    return (
      <React.Fragment>
        <FocusTrap
          element={this.EL.current}
          ref={this.focusTrap}
        />
        <DialogContainerRoot
          tabIndex={-1}
          aria-modal={true}
          id={this.props.id}
          role={this.props.role}
          aria-labelledby={ariaLabel ? null : ariaLabelledBy}
          aria-label={ariaLabel}
          data-state={this.state.animationState}
          onAnimationStart={this.emitOnTransitionStart}
          onAnimationEnd={this.onTransitionEnd}
          innerRef={this.EL}
        >
          { this.props.children }
        </DialogContainerRoot>
      </React.Fragment>
    )
  }
}

const DialogContainerPropTypes = {
  /**
   * When the transition is invoked.
   * Called "animation" instead of "transition" even though we use
   * CSS property transition behind the scenes.
   */
  onAnimationStateChange: PropTypes.func,
  /** The ARIA role of the dialog element */
  role: PropTypes.string,
  /** Whether the dialog should focus the first focusable element */
  autoFocus: PropTypes.bool,
  /**
   * Whether the dialog should restore focus to the most recently
   * focused element before the dialog was open (after it's closed)
   */
  restoreFocus: PropTypes.bool,
};

const DialogContainerDefaultProps = {
  onAnimationStateChange: _.noop,
  role: 'dialog',
  autoFocus: true,
  restoreFocus: true,
};

DialogContainer.propTypes = {
  ...DialogContainerPropTypes,
};

DialogContainer.defaultProps = {
  ...DialogContainerDefaultProps,
};

export default DialogContainer;

/**
 * Private methods
 */
/** Saves a reference to the element that was focused before opening */
function savePreviouslyFocusedElement() {
  if (document) {
    this.setState({
      elementFocusedBeforeDialogWasOpened: document.activeElement,
    }, () => {
      /** No focus method on the server */
      if (_.isFunction(this.EL.current)) {
        /**
         * Move focus onto dialog immediately to prevent the user
         * from accidentally opening multiple dialogs at once.
         */
        this.EL.current.focus();
      }
    });
  }
}

/** Moves the focus inside the focus trap */
function trapFocus() {
  /**
   * If we want to autofocus, defer it until
   * the microtasks are complete.
   */
  if (this.props.autoFocus) {
    window.requestAnimationFrame(() => {
      this.getFocusTrap().focusInitialElement();
    });
  }
}

/** Restore focus to the element that was previously focused */
function restoreFocus() {
  const toFocus = this.state.elementFocusedBeforeDialogWasOpened;

  // IE can set `activeElement` to null in some cases
  if (this.props.restoreFocus && toFocus && _.isFunction(toFocus.focus)) {
    toFocus.focus();
  }

  if (this.getFocusTrap().destroy) {
    this.getFocusTrap().destroy();
  }
}
