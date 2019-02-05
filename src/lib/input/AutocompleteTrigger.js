import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {ENTER, ESC, ESCAPE} from '../../cdk/keycodes/keys';

/**
 * Class to include some extended behavior for the
 * Signature UI <Input /> component.
 *
 * This is a no-op render, as it just provides some
 * rendering/opening/etc. logic for the Input component.
 */
class AutocompleteTrigger extends React.Component {
  /**
   * Lifecycle
   */
  componentDidMount() {
    if (!_.isUndefined(window)) {
      window.addEventListener('blur', this.windowBlurHandler);
    }
  }

  componentWillUnmount() {
    if (!_.isUndefined(window)) {
      window.removeEventListener('blur', this.windowBlurHandler);
    }
  }

  /**
   * Derived data
   */
  /** Get the autocomplete */
  getAutocomplete = () => this.props.autocomplete;

  /** Get the autocomplete */
  getInput = () => this.props.input;

  /** Get the autocomplete panel's currently active option */
  getActiveOption = () => {
    const autocompletePanel = _.get(this.getAutocomplete(), 'keyManager.current');
    if (_.get(autocompletePanel, 'activeItem.getId')) {
      return autocompletePanel.activeItem;
    }

    return null;
  };

  /** Get whether or not the panel can actually open */
  canOpen = () => {
    const input = this.getInput();
    if (!input) return !this.props.autocompleteDisabled;
    return !_.get(input, 'props.readOnly')
    || !_.get(input, 'props.disabled')
    || !this.props.autocompleteDisabled;
  };

  /** Get the attributes that are associated with the autocomplete */
  getExtendedAttributes = () => ({
    autocomplete: this.props.autocompleteAttribute,
    role: this.props.autocompleteDisabled ?
      null : 'combobox',
    'aria-autocomplete': this.props.autocompleteDisabled ?
      null : 'list',
    'aria-activedescendant': this.getActiveOption() ?
      this.getActiveOption().getId() : null,
    'aria-expanded': this.props.autocompleteDisabled ?
      null : this.state.panelOpen,
    'aria-owns': (this.props.autocompleteDisabled || !this.getPanelOpen()) ?
      null : this.getAutocomplete().getId(),
  });

  /**
   * Actions
   */
  /**
   * Event handler for when the window is blurred
   */
  windowBlurHandler = () => {
    // If the user blurred the window while the autocomplete is focused, it means that it'll be
    // refocused when they come back. In this case we want to skip the first focus event, if the
    // pane was closed, in order to avoid reopening it unintentionally.
    this.setState({
      canOpenOnNextFocus: document.activeElement !== this.getInput().INPUT
      || this.state.panelOpen,
    });
  };

  /** Event to be called when this.props.input is focused */
  handleFocus = () => {
    if (!this.state.canOpenOnNextFocus) {
      this.setState({ canOpenOnNextFocus: true });
    } else if (this.canOpen()) {
      // Save the previous value
      this.setState({ previousValue: this.getInput().INPUT.value });
      // Attach the overlay
      attachOverlay.call(this);
    }
  };

  /** Event to be called when the this.props.input is blurred */
  onTouched = () => {
    _.invoke(this.getInput(), 'props.onBlur');
  };

  /** Callback onInput for this.props.input */
  handleInput = (event) => {
    const target = event.target;
    let value = target.value;

    if (target.type === 'number') {
      value = value === '' ? null : window.parseFloat(value);
    }

    // If the input has a placeholder, IE will fire the `input` event on page load,
    // focus and blur, in addition to when the user actually changed the value. To
    // filter out all of the extra events, we save the value on focus and between
    // `input` events, and we check whether it changed.
    // See: https://connect.microsoft.com/IE/feedback/details/885747/
    if (this.state.previousValue !== value) {
      this.setState({ previousValue: value });
      _.invoke(this.getInput(), 'props.onChange');

      if (this.canOpen() && document.activeElement === target) {
        this.openPanel();
      }
    }
  };

  /** Called when keydown events are triggered on this.props.input */
  handleKeyDown = (event) => {
    const key = event.key;

    // Prevent the default action on all escape key presses. This is here primarily to bring IE
    // in line with other browsers. By default, pressing escape on IE will cause it to revert
    // the input value to the one that it had on focus, however it won't dispatch any events
    // which means that the model value will be out of sync with the view.
    if (key === ESC || key === ESCAPE) {
      event.preventDefault();
    }

    if (this.getActiveOption() && key === ENTER && this.state.panelOpen) {
      this.getActiveOption().selectViaInteraction();
      resetActiveItem.call(this);
    }
  };

  /**
   * Renderers
   */
  /** No-op render */
  render() {
    return null;
  }
}

AutocompleteTrigger.propTypes = {
  input: PropTypes.any.isRequired,
};

export default AutocompleteTrigger;

/**
 * Private methods
 */

/**
 * Resets the active item to -1 so arrow events will activate the
 * correct options, or to 0 if the consumer opted into it.
 */
function resetActiveItem() {
  const autocomplete = this.getAutocomplete();
  
}
