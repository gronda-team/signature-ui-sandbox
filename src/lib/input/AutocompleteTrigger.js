import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {ARROW_DOWN, ARROW_UP, DOWN, ENTER, ESC, ESCAPE, TAB, UP} from '../../cdk/keycodes/keys';
import {countGroupLabelsBeforeOption, getOptionScrollPosition} from '../core/option/util';
import {MENU_ITEM_HEIGHT, OVERLAY_MAX_HEIGHT} from '../core/styles/menu-common';
import {FormFieldDefaultProps, FormFieldPropTypes, withFormFieldConsumer} from '../form-field';
import {ViewportRulerDefaultProps, ViewportRulerPropTypes, withViewportRuler} from '../../cdk/scrolling';
import {stack} from '../core/components/util';

/**
 * Class to include some extended behavior for the
 * Signature UI <Input /> component.
 *
 * This is a no-op render, as it just provides some
 * rendering/opening/etc. logic for the Input component.
 */
class AutocompleteTrigger extends React.Component {
  constructor() {
    super();

    this.state = {
      // Whether it has been created
      overlayCreated: false,
      // Get whether the autocomplete panel is attached
      overlayAttached: false,
    };

    this.DEFAULT_ID = _.uniqueId('sui-autocomplete-trigger:');

    this.onDocumentOutsideClick = onDocumentOutsideClick.bind(this);
  }
  /**
   * Lifecycle
   */
  componentDidMount() {
    if (!_.isUndefined(window)) {
      window.addEventListener('blur', this.windowBlurHandler);
    }

    /** Set up the document listener */
    setupOutsideClickStream.call(this);

    /** Set the value for the autocomplete */
    this.getAutocomplete().setState({
      onSelectionChange: onPanelClose.call(this),
    });
  }

  componentDidUpdate(prevProps, prevState) {
    /** Install the selection change listener when the overlay is created */
    if (prevState.overlayCreated !== this.state.overlayCreated) {
      if (this.state.overlayCreated) {
        this.getAutocomplete().setState(state => ({
          provide: {
            ...state.provide,
            onSelectionChange: onPanelClose.bind(this),
          },
        }));
      }
    }

    /** Install the tabOut listener on the key manager when it's created */
    if (prevState.overlayAttached !== this.state.overlayAttached) {
      if (this.state.overlayAttached) {
        this.getAutocomplete().setState(state => ({
          provide: {
            ...state.provide,
            onTabOut: this.handleOverlayTabOut,
          },
        }));
      }
    }
  }

  componentWillUnmount() {
    if (!_.isUndefined(window)) {
      window.removeEventListener('blur', this.windowBlurHandler);
    }

    /** Tear down the document listener */
    tearDownOutsideClickStream.call(this);

    destroyPanel.call(this);
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
    const autocompleteKeyManager = _.invoke(this.getAutocomplete(), 'getKeyManager');
    if (_.get(autocompleteKeyManager, 'activeItem.getId')) {
      return autocompleteKeyManager.activeItem;
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
  /** Opens the autocomplete panel */
  openPanel = () => {
    attachOverlay.call(this);
  };

  /** Closes the autocomplete panel */
  closePanel = () => {
    if (!this.state.overlayAttached) return;
    const autocomplete = this.getAutocomplete();

    if (this.state.panelOpen) {
      // Only emit if the panel was visible.
      _.invoke(autocomplete, 'props.onClose');
    }

    autocomplete.setState({
      // Autocomplete is now closed
      isOpen: false,
    });

    this.setState({
      // Overlay will be detached (from this component's POV)
      overlayAttached: false,
    });

    const overlay = autocomplete.getOverlay();
    if (overlay.state.attached) {
      overlay.detach();
    }
  };

  updatePosition = () => {
    if (this.state.overlayAttached) {
      this.getAutocomplete().getOverlay().updatePosition();
    }
  };

  /** Event handler for when the window is blurred */
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
      event.preventDefault();
    } else if (this.getAutocomplete()) {
      const keyManager = this.getAutocomplete().getKeyManager();
      const previousActiveItem = keyManager.activeItem;
      const isArrowKey = [ARROW_UP, UP, ARROW_DOWN, DOWN].indexOf(key) > -1;

      if (this.state.panelOpen || key === TAB) {
        keyManager.onKeyDown(event);
      } else if (isArrowKey && this.canOpen()) {
        this.openPanel();
      }

      if (isArrowKey || keyManager.activeItem !== previousActiveItem) {
        scrollToOption.call(this);
      }
    }
  };

  /** Handle the onTabOut method that's used in key manager */
  handleOverlayTabOut = () => {
    if (this.state.overlayAttached) {
      emitPanelClose.call(this);
    }
  };

  /** Handle option selection, provided through OptionParent context */
  onOptionSelectionChange = (event) => {
    emitPanelClose.call(this, event);
  };

  /**
   * Renderers
   */
  /** No-op render */
  render() {
    return null;
  }
}

const AutocompleteTriggerPropTypes = {
  /** Input component to which this is trigger is associated */
  input: PropTypes.any.isRequired,
  /**
   * The component to which this autocomplete is connected to.
   * It defaults to the autocomplete trigger element.
   */
  connectedTo: PropTypes.any,
  /** `autocomplete` attribute on the input element */
  autocomplete: PropTypes.string,
  /**
   * Whether the autocomplete is disabled. When it is, the form
   * element just behaves as a normal input.
   */
  autocompleteDisabled: PropTypes.bool,
};

const AutocompleteTriggerDefaultProps = {
  connectedTo: null,
  autocomplete: 'off',
  autocompleteDisabled: null,
};

AutocompleteTrigger.propTypes = {
  ...AutocompleteTriggerPropTypes,
  __formFieldControl: FormFieldPropTypes,
  __viewportRuler: ViewportRulerPropTypes,
};

AutocompleteTrigger.defaultProps = {
  ...AutocompleteTriggerDefaultProps,
  __formFieldControl: FormFieldDefaultProps,
  __viewportRuler: ViewportRulerDefaultProps,
};

const StackedAutocompleteTrigger = stack(
  withFormFieldConsumer,
  withViewportRuler,
)(AutocompleteTrigger);

StackedAutocompleteTrigger.propTypes = AutocompleteTriggerPropTypes;
StackedAutocompleteTrigger.defaultProps = AutocompleteTriggerDefaultProps;

export default StackedAutocompleteTrigger;

/**
 * Private methods
 */

/** Action to be done on outside click */
function onDocumentOutsideClick(event) {
  const clickTarget = event.target;
  const formField = _.get(this.props.__formFieldControl, 'el') || null;
  const overlay = this.getOverlay();

  if (
    this.state.overlayAttached
    && clickTarget !== this.getInput().INPUT.current
    && (!formField || !formField.contains(clickTarget))
    && (!!overlay && !overlay.state.pane.contains(clickTarget))
  ) {
    onPanelClose.call(this);
  }
}

/** Install the document click listeners */
function setupOutsideClickStream() {
  if (!document) return;

  document.addEventListener('click', this.onDocumentOutsideClick);
  document.addEventListener('touchend', this.onDocumentOutsideClick);
}

/** Install the document click listeners */
function tearDownOutsideClickStream() {
  if (!document) return;

  document.removeEventListener('click', this.onDocumentOutsideClick);
  document.removeEventListener('touchend', this.onDocumentOutsideClick);
}

/**
 * Given that we are not actually focusing active options, we must manually adjust scroll
 * to reveal options below the fold. First, we find the offset of the option from the top
 * of the panel. If that offset is below the fold, the new scrollTop will be the offset -
 * the panel height + the option height, so the active option will be just visible at the
 * bottom of the panel. If that offset is above the top of the visible panel, the new scrollTop
 * will become the offset. If that offset is visible within the panel already, the scrollTop is
 * not adjusted.
 */
function scrollToOption() {
  const autocomplete = this.getAutocomplete();
  const keyManager = autocomplete.getKeyManager();

  const index = keyManager.activeItemIndex || 0;
  const labelCount = countGroupLabelsBeforeOption(
    index,
    autocomplete.getOptions(),
    autocomplete.getOptionGroups(),
  );

  const newScrollPosition = getOptionScrollPosition(
    index + labelCount,
    MENU_ITEM_HEIGHT,
    autocomplete.state.scrollTop,
    OVERLAY_MAX_HEIGHT,
  );

  autocomplete.setState({ scrollTop: newScrollPosition });
}

/** Destroy the autocomplete panel */
function destroyPanel() {
  if (this.getAutocomplete().getOverlay()) {
    this.closePanel();
    this.getAutocomplete().getOverlay().dispose();
  }
}

/** Set the value in the input */
function setTriggerValue(value) {
  const autocomplete = this.getAutocomplete();
  const toDisplay = autocomplete && autocomplete.props.displayWith ?
    autocomplete.props.displayWith(value) :
    value;

  // Simply falling back to an empty string if the display value is falsy does not work properly.
  // The display value can also be the number zero and shouldn't fall back to an empty string.
  const inputValue = _.isNil(toDisplay) ? '' : toDisplay;
  if (this.getInput()) {
    /** Set it manually so that it can be used by input.props.change */
    this.getInput().INPUT.current.value = inputValue;
  }

  this.setState({ previousValue: inputValue });
}

/** Emit a closing event with optional event */
function onPanelClose(event) {
  setValueAndClose.call(this, event);
}

/**
 * This method closes the panel, and if a value is specified, also sets the associated
 * control to that value. It will also mark the control as dirty if this interaction
 * stemmed from the user.
 */
function setValueAndClose(event) {
  if (event && event.source) {
    clearPreviousSelectedOption.call(this, event.source);
    setTriggerValue.call(this, event.value);
    this.getInput().props.onChange(event.value);
    this.getInput().INPUT.current.focus();
    this.getAutocomplete().emitSelectEvent(event.source);
  }

  this.closePanel();
}

/** Clear any previous selected option and emit a selection change event for this option */
function clearPreviousSelectedOption(skip) {
  this.getAutocomplete().getOptions().forEach((option) => {
    if (option !== skip && option.props.selected) {
      option.deselect();
    }
  })
}

/**
 * Attach the overlay associated with the autocomplete panel
 */
function attachOverlay() {
  const autocomplete = this.getAutocomplete();
  const overlay = autocomplete.getOverlay();
  if (!overlay.state.created) {
    overlay.create();
    this.setState({ overlayCreated: true });
    autocomplete.setState(state => ({
      provide: {
        ...state.provide,
        onKeyDown: (event) => {
          const key = event.key;
          // Close when pressing ESCAPE or ALT + UP_ARROW, based on the a11y guidelines.
          // See: https://www.w3.org/TR/wai-aria-practices-1.1/#textbox-keyboard-interaction
          if (
            [ESC, ESCAPE].indexOf(key) > -1
            || ([UP, ARROW_UP].indexOf(key) > -1 && event.altKey)
          ) {
            resetActiveItem.call(this);
            onPanelClose.call(this);
          }
        },
      },
    }));

    if (this.props.__viewportRuler) {
      /** Subscribe to resize and orientation change */
      this.props.__viewportRuler.add({
        id: this.DEFAULT_ID,
        callback: () => {
          if (this.state.panelOpen && this.getAutocomplete().getOverlay()) {
            this.getAutocomplete().getOverlay
              .updateSize();
          }
        },
      });
    }
  } else {
    // Update the panel width and direction
    overlay.updateSize();
  }

  if (!overlay.state.attached) {
    overlay.attach();
    // this.closingActionsSubscriptions = this.subscribeToClosingActions();
  }

  const wasOpen = this.state.panelOpen;

  autocomplete.setState({ isOpen: true });
  this.setState({ overlayAttached: true });

  /** Do another check here to see if we can emit */
  if (this.state.panelOpen && wasOpen !== this.state.panelOpen) {
    _.invoke(autocomplete, 'props.onOpened');
  }
}

/**
 * Resets the active item to -1 so arrow events will activate the
 * correct options, or to 0 if the consumer opted into it.
 */
function resetActiveItem() {
  const autocomplete = this.getAutocomplete();
  autocomplete.getKeyManager().setActiveItem(
    autocomplete.props.autoActiveFirstOption ?
      0 : -1
  );
}
