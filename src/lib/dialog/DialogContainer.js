import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {DialogContainerRoot} from './styles';

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
  }
  /**
   * Actions
   */
  /** Invoked when the transition starts */
  emitOnTransitionStart = () => {
    this.setState({
      animationState: 'enter',
    }, () => {
      this.props.onAnimationStateChange({
        phaseName: 'start',
        toState: this.state.animationState,
      });
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
      phaseName: 'end',
      toState: this.state.animationState,
    });
  };

  /** Public, start exit animation from the parent */
  startExitAnimation = () => {
    this.setState({ animationState: 'exit '});
  };

  /**
   * Renderers
   */
  render() {
    const ariaLabel = _.get(this.props, 'aria-label');
    const ariaLabelledBy = _.get(this.props, 'aria-labelledby');
    return (
      <DialogContainerRoot
        tabIndex={-1}
        aria-modal={true}
        id={this.getId()}
        role={this.props.role}
        aria-labelledby={ariaLabel ? null : ariaLabelledBy}
        aria-label={ariaLabel}
        onTransitionStart={this.emitOnTransitionStart}
        onTransitionEnd={this.onTransitionEnd}
      >
        { this.props.children }
      </DialogContainerRoot>
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
};

const DialogContainerDefaultProps = {
  onAnimationStateChange: _.noop,
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
/** Moves the focus inside the focus trap */

