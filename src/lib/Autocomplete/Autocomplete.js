import * as React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import invoke from 'lodash/invoke';
import { AutocompleteActions, useFormField } from '../FormField';
import { useListKeyManager } from '../../cdk/A11y';
import { useAutocompleteState } from './context';
import { OptionParentContext, useOptionFilter, useRefManager } from '../core/Option/context';
import {
  Overlay,
  OverlayActions, STATE_CONTEXT_INIT,
  useFlexibleConnectedPositionStrategy,
  useRepositionScrollStrategy,
} from '../../cdk/Overlay';
import { useDir } from '../../cdk/Bidi';
import { DOWN_ARROW, ENTER, ESCAPE, TAB, UP_ARROW } from '../../cdk/Keycodes';
import { useViewportRuler } from '../../cdk/Scrolling';
import { setNativeValue } from '../../cdk/TextArea/util';
import { supportsShadowDom } from '../../cdk/Platform';
import { countGroupLabelsBeforeOption, getOptionScrollPosition } from '../core/Option/Option';
import { AutocompleteRoot } from './styles';

let nextUniqueId = 0;

const ABOVE_POSITION = {
  originX: 'start',
  originY: 'top',
  overlayX: 'start',
  overlayY: 'bottom',
  // The overlay edge connected to the trigger should have squared corners, while
  // the opposite end has rounded corners. We apply a CSS class to swap the
  // border-radius based on the overlay position.
  paneAttributes: { 'data-panel-above': true }
};

const BELOW_POSITION = {
  originX: 'start',
  originY: 'bottom',
  overlayX: 'start',
  overlayY: 'top'
};

export const AUTOCOMPLETE_PANEL_HEIGHT = 256;

function Autocomplete(props) {
  const {
    id, connectedTo, panelWidth: __panelWidth, position, autoActiveFirstOption, onOpen,
    onClose, displayWith, onSelect, optionSize, children,
    ...restProps
  } = props;

  const [finalPanelWidth, setPanelWidth] = React.useState(null);
  const km = React.useRef({});
  const [ov, updateOverlayState] = React.useState({ state: STATE_CONTEXT_INIT, dispatch: noop });
  const vr = useViewportRuler();
  const dir = useDir();
  const [state, dispatch] = useFormField();
  const autocompleteState = useAutocompleteState();

  /** Element for the panel containing the autocomplete options. */
  const panel = React.useRef(null);

  /**
   * Old value of the native input. Used to work around issues with the `input` event on IE.
   * @type {React.MutableRefObject<null | string>}
   */
  const previousValue = React.useRef(null);

  /** Whether we're eligible to close the panel. */
  const isFirstClosingEvent = React.useRef(false);
  /** Whether we've emitted an open event for the current panel */
  const hasEmittedOpenEvent = React.useRef(false);

  /**
   * Whether the autocomplete can open the next time it is focused. Used to prevent a focused,
   * closed autocomplete from being reopened if the user switches to another browser tab and then
   * comes back.
   * @type {React.MutableRefObject<boolean>}
   */
  const canOpenOnNextFocus = React.useRef(true);

  /**
   * Callback to remove the current change listener
   * @type {React.MutableRefObject<Function>}
   */
  const removeChangeListener = React.useRef(noop);

  /**
   * Whether the element is inside of a ShadowRoot component
   * @type {React.MutableRefObject<boolean | null>}
   */
  const isInsideShadowRoot = React.useRef(null);

  /** Unique ID to be used by autocomplete trigger's "aria-owns" property. */
  const finalId = React.useMemo(() => (
    id || `sui-autocomplete:${nextUniqueId++}`
  ), [id]);

  React.useEffect(() => {
    dispatch({
      type: AutocompleteActions.SET_PANEL_ID,
      data: finalId,
    });
  }, [finalId]);

  /**
   * List of `children` who are option groups. They have the `__SUI_TYPE__` default prop as
   * `optgroup` or `option`.
   * @type {[Array, Array]}
   */
  const [optionChildren, optionGroupChildren] = useOptionFilter(children);

  const [optionRefs, optionRegister] = useRefManager(optionChildren);
  const [optionGroupRefs, optionGroupRegister] = useRefManager(optionGroupChildren);
  const register = React.useCallback((payload) => {
    if (payload.group !== undefined) return optionRegister(payload);
    return optionGroupRegister(payload);
  }, [optionRegister, optionGroupRegister]);

  /** Whether the autocomplete panel should be visible, depending on option length. */
  const showPanel = React.useMemo(() => optionChildren.length > 0, [optionChildren]);

  /** Whether or not the autocomplete panel is open. */
  const panelOpen = React.useMemo(() => (
    showPanel && ov.state.attached
  ), [showPanel, ov.state.attached]);

  React.useEffect(() => {
    dispatch({
      type: AutocompleteActions.SET_PANEL_OPEN_STATE,
      data: panelOpen,
    });
  }, [panelOpen]);

  /**
   * Get the element to which the autocomplete overlay is attached
   * @type {HTMLElement}
   */
  const origin = React.useMemo(() => {
    if (connectedTo) return connectedTo;

    return state.connectionContainer;
  }, [connectedTo, state.connectionContainer]);

  /**
   * Set the final panel width. Use a callback function instead of `React.useMemo` because we
   * need to call this on viewport resize.
   * @type {Function}
   */
  const setFinalPanelWidth = React.useCallback(() => {
    setPanelWidth(__panelWidth || origin.getBoundingClientRect().width);
  }, [origin, setPanelWidth]);

  /**
   * Resets the active item to -1 so arrow events will activate the
   * correct options, or to 0 if the consumer opted into it.
   * @type {Function}
   */
  const resetActiveItem = React.useCallback(() => {
    km.current.setActiveItem(autoActiveFirstOption ? 0 : -1);
  }, [autoActiveFirstOption]);

  /** @type {Function} */
  const attachOverlay = React.useCallback(() => {
    removeChangeListener.current = vr.addChangeListener(setFinalPanelWidth);
    setFinalPanelWidth();
    resetActiveItem();
    ov.dispatch({
      type: OverlayActions.SET_ATTACHED_STATE,
      data: true,
    });
    isFirstClosingEvent.current = true;
  }, [
    ov.dispatch,
    resetActiveItem,
    setFinalPanelWidth,
    vr.addChangeListener,
  ]);

  /**
   * Callback that's invoked when the autocomplete panel is opened. It should only be invoked
   * when there are options available.
   * @type {Function}
   */
  const handleOnAttached = React.useCallback(() => {
    if (showPanel && typeof onOpen === 'function' && !hasEmittedOpenEvent.current) {
      onOpen();
      hasEmittedOpenEvent.current = true;
    }
  }, [showPanel, onOpen]);

  React.useEffect(() => {
    if (ov.state.attached && !hasEmittedOpenEvent.current) {
      handleOnAttached();
    }
  }, [showPanel, handleOnAttached, ov.state.attached]);

  /** Closes the autocomplete suggestion panel. */
  const closePanel = React.useCallback(() => {
    if (!ov.state.attached) return;

    if (panelOpen && typeof onClose === 'function') {
      onClose();
    }

    ov.dispatch({
      type: OverlayActions.SET_ATTACHED_STATE,
      data: false,
    });
  }, [ov.state.attached, panelOpen, onClose, ov.dispatch]);

  /**
   * Sets the value on the input field that triggered the autocomplete
   * @type {function(value: any): void}
   */
  const setTriggerValue = React.useCallback((value) => {
    const toDisplay = displayWith ? displayWith(value) : value;

    // Simply falling back to an empty string if the display value is falsy does not work properly.
    // The display value can also be the number zero and shouldn't fall back to an empty string.
    const inputValue = toDisplay != null ? toDisplay : '';

    if (state.control) {
      setNativeValue(state.control, inputValue);
      state.control.dispatchEvent(new Event('input', { bubbles: true }));
    }

    previousValue.current = inputValue;
  }, [displayWith, state.control]);

  /**
   * This method closes the panel, and if a value is specified, also sets the associated
   * control to that value. It will also mark the control as dirty if this interaction
   * stemmed from the user.
   * @type {function(event: Object | null): void}
   */
  const setValueAndClose = React.useCallback((event) => {
    if (event) {
      setTriggerValue(event.props.value);

      if (state.control) {
        state.control.focus();
      }

      if (typeof onSelect === 'function') {
        onSelect(event);
      }
    }

    closePanel();
  }, [closePanel, setTriggerValue, state.control, onSelect]);

  /**
   * Requesting a panel close
   * @type {function(event?): void}
   */
  const onRequestPanelClose = React.useCallback((event) => {
    resetActiveItem();

    if (ov.state.attached) {
      ov.state.position.apply();
    }

    if (isFirstClosingEvent.current) {
      setValueAndClose(event);
      isFirstClosingEvent.current = false;
      hasEmittedOpenEvent.current = false;
    }
  }, [resetActiveItem, ov.state.attached, ov.state.position.apply, setValueAndClose]);

  /**
   * Call `onRequestPanelClose` callback when an option is selected while taking advantage
   * of the payload.
   * @type {Function}
   */
  const onOptionSelection = React.useCallback((event) => {
    // `event` is noop
    onRequestPanelClose(event);
  }, [onRequestPanelClose]);

  /**
   * Target the overlay when pressing the keyboard keys. Check to see if it can be closed.
   * @type {function(event: KeyboardEvent)}
   */
  const handleOverlayKeyDown = React.useCallback((event) => {
    if (event.keyCode === ESCAPE || (event.keyCode === UP_ARROW && event.altKey)) {
      resetActiveItem();
      onRequestPanelClose();
      // We need to stop propagation, otherwise the event will eventually
      // reach the input itself and cause the overlay to be reopened.
      event.stopPropagation();
      event.preventDefault();
    }
  }, [
    onRequestPanelClose,
    resetActiveItem,
  ]);

  const onTabOut = React.useCallback(() => {
    if (ov.state.attached) {
      onRequestPanelClose();
    }
  }, [ov.state.attached, onRequestPanelClose]);

  const setActiveRef = React.useCallback((index) => {
    const activeRef = optionRefs[index];

    dispatch({
      type: AutocompleteActions.SET_ACTIVE_OPTION,
      data: activeRef || null,
    });
  }, [optionRefs]);

  const kmConfig = React.useMemo(() => ({
    onChange: setActiveRef,
    onTabOut,
    wrap: true,
  }), [onTabOut, setActiveRef]);

  // We don't have to worry too much about optionChildren changing every render because
  // each `optionChildren` and `optionGroupChildren` are only rerendered when `props.children`
  // changes.
  km.current = useListKeyManager(optionChildren, kmConfig);

  /**
   * Listen to click events on the document and detect if any of them are outside of the AC
   * panel or the form field
   * @type {function(event: MouseEvent | TouchEvent)}
   */
  const onOutsideClick = React.useCallback((event) => {
    // If we're in the Shadow DOM, the event target will be the shadow root, so we have to
    // fall back to check the first element in the path of the click event.
    const clickTarget = isInsideShadowRoot.current && event.composedPath ?
      event.composedPath()[0] :
      event.target;

    if (
      ov.state.attached
      && clickTarget !== state.control
      && (!state.formField || !state.formField.contains(clickTarget))
      && (!ov.state.pane.contains(clickTarget))
    ) {
      onRequestPanelClose();
    }
  }, [state.formField, ov.state.attached, ov.state.pane, state.control, onRequestPanelClose]);

  /**
   * Event handler for when the window is blurred.
   * @type {Function}
   */
  const windowBlurHandler = React.useCallback(() => {
    // If the user blurred the window while the autocomplete is focused, it means that it'll be
    // refocused when they come back. In this case we want to skip the first focus event, if the
    // pane was closed, in order to avoid reopening it unintentionally.
    canOpenOnNextFocus.current =
      (document.activeElement !== state.control) || panelOpen;
  }, [state.control, panelOpen]);

  const positionStrategyConfig = React.useMemo(() => {
    let positions = [];
    if (position === 'above') {
      positions = [ABOVE_POSITION];
    } else if (position === 'below') {
      positions = [BELOW_POSITION];
    } else {
      positions = [BELOW_POSITION, ABOVE_POSITION];
    }

    return {
      origin,
      preferredPositions: positions,
      hasFlexibleDimensions: false,
      canPush: false,
    };
  }, [
    position,
    origin,
  ]);

  // Set the panel width once the origin exists and if the width hasn't already been set.
  // This is used for initial mounting.
  React.useEffect(() => {
    if (origin && finalPanelWidth != null) {
      setFinalPanelWidth();
    }
  }, [origin, finalPanelWidth, setFinalPanelWidth]);

  // Clean up any event listeners
  React.useEffect(() => {
    return () => {
      invoke(removeChangeListener, 'current');
    };
  }, []);

  // Bind the window listener
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('blur', windowBlurHandler);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('blur', windowBlurHandler);
      }
    };
  }, [windowBlurHandler]);

  // Create the focus callback here and send it to the parent context rather than
  // constructing the callback in the `useAutocomplete` hook
  const onInputFocus = React.useCallback(() => {
    if (!canOpenOnNextFocus.current) {
      canOpenOnNextFocus.current = true;
    } else if (autocompleteState.canOpen) {
      previousValue.current = props.value;
      attachOverlay();
    }
  }, [attachOverlay, autocompleteState.canOpen]);

  React.useEffect(() => {
    dispatch({
      type: AutocompleteActions.SET_FOCUS_HANDLER,
      data: onInputFocus,
    });
  }, [onInputFocus]);

  /**
   * Given that we are not actually focusing active options, we must manually adjust scroll
   * to reveal options below the fold. First, we find the offset of the option from the top
   * of the panel. If that offset is below the fold, the new scrollTop will be the offset -
   * the panel height + the option height, so the active option will be just visible at the
   * bottom of the panel. If that offset is above the top of the visible panel, the new scrollTop
   * will become the offset. If that offset is visible within the panel already, the scrollTop is
   * not adjusted.
   */
  const scrollToOption = React.useCallback(() => {
    const index = km.current.getActiveItemIndex() || 0;
    const labelCount = countGroupLabelsBeforeOption(
      index, optionRefs, optionGroupRefs,
    );

    if (index === 0 && labelCount === 1) {
      // If we've got one group label before the option and we're at the top option,
      // scroll the list to the top. This is better UX than scrolling the list to the
      // top of the option, because it allows the user to read the top group's label.
      panel.current.scrollTop = 0;
    } else {
      let optionHeight;

      switch (optionSize) {
        case 'small':
          optionHeight = 32;
          break;
        case 'large':
          optionHeight = 64;
          break;
        case 'medium':
        default:
          optionHeight = 48;
          break;
      }

      panel.current.scrollTop = getOptionScrollPosition(
        index + labelCount,
        optionHeight,
        panel.current.scrollTop || 0,
        AUTOCOMPLETE_PANEL_HEIGHT,
      );
    }
  }, [optionRefs, optionGroupRefs, optionSize]);

  /**
   * @type {function(event: KeyboardEvent, props: Object, canOpen: boolean): void}
   */
  const onKeyDown = React.useCallback((event) => {
    const keyCode = event.keyCode;

    // Prevent the default action on all escape key presses. This is here primarily to bring IE
    // in line with other browsers. By default, pressing escape on IE will cause it to revert
    // the input value to the one that it had on focus, however it won't dispatch any events
    // which means that the model value will be out of sync with the view.
    if (keyCode === ESCAPE) {
      event.preventDefault();
    }

    if (autocompleteState.activeOption && keyCode === ENTER && panelOpen) {
      autocompleteState.activeOption.select();
      resetActiveItem();
      event.preventDefault();
    } else {
      const previousActiveItem = km.current.getActiveItem();
      const isArrowKey = keyCode === UP_ARROW || keyCode === DOWN_ARROW;

      if (panelOpen || keyCode === TAB) {
        km.current.onKeyDown(event);
      } else if (isArrowKey && autocompleteState.canOpen) {
        attachOverlay();
      }

      if (isArrowKey || km.current.getActiveItem() !== previousActiveItem) {
        scrollToOption();
      }
    }
  }, [
    scrollToOption,
    autocompleteState.activeOption,
    autocompleteState.canOpen,
    panelOpen,
    resetActiveItem,
    attachOverlay,
  ]);

  React.useEffect(() => {
    dispatch({
      type: AutocompleteActions.SET_KEYDOWN_HANDLER,
      data: onKeyDown,
    });
  }, [onKeyDown]);

  /**
   * Input change handler
   * @type {Function}
   */
  const onChange = React.useCallback((event) => {
    let target = event.target;
    let value = target.value;

    // Based on `NumberValueAccessor` from forms.
    if (target.type === 'number') {
      value = value === '' ? null : window.parseFloat(value);
    }

    // If the input has a placeholder, IE will fire the `input` event on page load,
    // focus and blur, in addition to when the user actually changed the value. To
    // filter out all of the extra events, we save the value on focus and between
    // `input` events, and we check whether it changed.
    // See: https://connect.microsoft.com/IE/feedback/details/885747/
    if (previousValue.current !== value) {
      previousValue.current = value;

      if (autocompleteState.canOpen && document.activeElement === event.target) {
        attachOverlay();
      }
    }
  }, [
    autocompleteState.canOpen,
    attachOverlay,
  ]);

  React.useEffect(() => {
    dispatch({
      type: AutocompleteActions.SET_CHANGE_HANDLER,
      data: onChange,
    });
  }, [onChange]);

  // Bind the document touch and click listeners
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      document.addEventListener('click', onOutsideClick);
      document.addEventListener('touchend', onOutsideClick);
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('click', onOutsideClick);
        document.removeEventListener('touchend', onOutsideClick);
      }
    };
  }, [onOutsideClick]);

  // Update whether or not we are in the shadow DOM
  React.useEffect(() => {
    if (supportsShadowDom() && state.control) {
      const element = state.control;
      const rootNode = element.getRootNode ? element.getRootNode() : null;

      isInsideShadowRoot.current = rootNode instanceof window.ShadowRoot;
    }
  }, [state.control]);

  // Listen to changes in position and then update the position strategy for them
  React.useEffect(() => {
    if (ov.state.attached) {
      ov.state.position.apply();
    }
  }, [position, ov.state.attached, ov.state.position.apply]);

  // Listen to any changes in the option children and then invoke the `reapplyLastPosition`
  // to update the panel position
  React.useEffect(() => {
    ov.state.position.reapplyLastPosition();
  }, [optionChildren, ov.state.position.reapplyLastPosition]);

  const optionProvider = React.useMemo(() => ({
    selected: [],
    register,
    activeListKey: autocompleteState.activeOption ?
      autocompleteState.activeOption['data-list-key'] :
      null,
    usesActiveDescendantManager: true,
    onSelectionChange: onOptionSelection,
  }), [
    autocompleteState.activeOption,
    register,
    onOptionSelection,
  ]);

  return (
    <Overlay
      dir={dir}
      usePositionStrategy={useFlexibleConnectedPositionStrategy}
      useScrollStrategy={useRepositionScrollStrategy}
      positionStrategyConfig={positionStrategyConfig}
      onKeyDown={handleOverlayKeyDown}
      width={finalPanelWidth}
      onAttached={handleOnAttached}
      onStateChange={updateOverlayState}
    >
      <AutocompleteRoot
        {...restProps}
        role="listbox"
        id={finalId}
        data-sui="autocomplete"
        data-sui-tree="autocomplete:root"
        data-visibility={showPanel ? 'visible' : 'hidden'}
        data-menu-item-size={optionSize}
        ref={panel}
      >
        <OptionParentContext.Provider value={optionProvider}>
          { children }
        </OptionParentContext.Provider>
      </AutocompleteRoot>
    </Overlay>
  );
}

Autocomplete.propTypes = {
  // HTML id
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  // The HTML element relative to which the autocomplete panel should be positioned.
  // Defaults to the FormField container
  connectedTo: PropTypes.object,
  // Option content
  children: PropTypes.node,
  // Width of the autocomplete panel. Can be any CSS sizing value. Default is the width
  // of the FormField container
  panelWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  // Position of the autocomplete panel relative to the trigger element. A position of `auto`
  // will render the panel underneath the trigger if there is enough space for it to fit in
  // the viewport, otherwise the panel will be shown above it. If the position is set to
  // `above` or `below`, the panel will always be shown above or below the trigger. no matter
  // whether it fits completely in the viewport.
  position: PropTypes.oneOf(['auto', 'above', 'below']),
  // Whether the first option should be highlighted when the autocomplete panel is opened.
  autoActiveFirstOption: PropTypes.bool,
  // Callback that's invoked when the autocomplete panel opens
  onOpen: PropTypes.func,
  // Callback that's invoked when the autocomplete panel closes
  onClose: PropTypes.func,
  // Function that maps an option's control to its display value in the trigger
  displayWith: PropTypes.func,
  // Callback that is called whenever an option from the list is selected
  onSelect: PropTypes.func,
  // Size of the options
  optionSize: PropTypes.oneOf([
    'small', 'medium', 'large',
  ]),
};

Autocomplete.defaultProps = {
  id: null,
  connectedTo: null,
  children: null,
  panelWidth: null,
  position: 'auto',
  autoActiveFirstOption: false,
  onOpen: noop,
  onClose: noop,
  displayWith: null,
  onSelect: noop,
  optionSize: 'medium',
};

export default Autocomplete;
