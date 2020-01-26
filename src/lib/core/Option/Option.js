import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import { OptionRoot, OptionText } from './styles';
import { OptGroupContext, OptionParentContext } from './context';
import { useTabIndex } from '../common/useTabIndex';
import { ENTER, hasModifierKey, SPACE } from '../../../cdk/Keycodes';

let nextUniqueId = 0;

function Option(props) {
  const {
    id, children, disabled: __disabled, onSelectionChange, label, value,
    ['data-list-key']: dataListKey,
    ...restProps
  } = props;
  const [active, setActive] = React.useState(false);

  /**
   * @type {React.MutableRefObject<HTMLElement | null>}
   */
  const element = React.useRef(null);

  const parent = React.useContext(OptionParentContext);
  const group = React.useContext(OptGroupContext);

  /** The unique ID of the option. */
  const finalId = React.useMemo(() => (
    id || `sui-option:${nextUniqueId++}`
  ), [id]);

  /** Whether the option is disabled. */
  const disabled = React.useMemo(() => {
    if (group.id) return group.disabled;
    return __disabled;
  }, [group.id, group.disabled, __disabled]);

  /** Returns the correct tabindex for the option depending on disabled state. */
  const tabIndex = useTabIndex(restProps.tabIndex, disabled);

  /** Whether or not the option is currently selected. */
  const selected = React.useMemo(() => (
    parent.selected.indexOf(value) > -1
  ), [value, parent.selected]);

  /**
   * Gets the `aria-selected` value for the option. We explicitly omit the `aria-selected`
   * attribute from single-selection, unselected options. Including the `aria-selected="false"`
   * attributes adds a significant amount of noise to screen-reader users without providing useful
   * information.
   */
  const ariaSelected = React.useMemo(() => (
    selected || (parent.multiple ? false : null)
  ), [selected, parent.multiple]);

  /**
   * Calls the onSelectionChange event for the parent and directly from props
   * @type {function(isUserInput: boolean): void}
   */
  const emitOnSelectionChange = React.useCallback((isUserInput = false) => {
    const payload = {
      value, 'data-list-key': dataListKey, isUserInput, props, target: element.current,
    };

    parent.onSelectionChange(payload);

    if (typeof onSelectionChange === 'function') {
      onSelectionChange(payload);
    }
  }, [parent.onSelectionChange, onSelectionChange, value, dataListKey]);

  /**
   * `Selects the option while indicating the selection came from the user. Used to
   * determine if the select's view -> model callback should be invoked.`
   */
  const selectViaInteraction = React.useCallback(() => {
    if (!disabled) {
      emitOnSelectionChange(true);
    }
  }, [restProps.onClick, disabled, emitOnSelectionChange]);

  /**
   * Ensures the option is selected when activated with a click event.
   * @type {function(event: MouseEvent)}
   */
  const handleClick = React.useCallback((event) => {
    selectViaInteraction();

    if (typeof restProps.onClick === 'function') {
      restProps.onClick(event);
    }
  }, [selectViaInteraction, restProps.onClick]);

  /**
   * Ensures the option is selected when activated from the keyboard.
   * @type {function(event: KeyboardEvent)}
   */
  const handleKeyDown = React.useCallback((event) => {
    if ((event.keyCode === ENTER || event.keyCode === SPACE) && !hasModifierKey(event)) {
      selectViaInteraction();

      event.preventDefault();
    }

    if (typeof restProps.onKeyDown === 'function') {
      restProps.onKeyDown(event);
    }
  }, [restProps.onKeyDown, selectViaInteraction]);

  // Handle when the active descendant manager is used
  React.useEffect(() => {
    if (parent.usesActiveDescendantManager) {
      // Set active styles when the active list key matches the one we have
      if (parent.activeListKey === dataListKey) {
        setActive(true);
      } else {
        setActive(false);
      }
    } else {
      // If it changes from active to inactive, disable the styling
      setActive(false);
    }
  }, [setActive, parent.usesActiveDescendantManager, parent.activeListKey, dataListKey]);

  // Handle when the focus key manager is used
  React.useEffect(() => {
    if (parent.usesFocusManager && parent.activeListKey === dataListKey) {
      // Focus the element
      element.current.focus();
    }
  }, [parent.usesFocusManager, parent.activeListKey, dataListKey]);

  /** Gets the label to be used when determining whether the option should be focused. */
  const getLabel = React.useCallback(() => {
    if (label) return label;

    if (element.current) {
      return (element.current.textContent || '').trim();
    }

    return '';
  }, [label]);

  const optionRef = React.useMemo(() => ({
    id: finalId,
    getLabel,
    group: group.id,
    select: selectViaInteraction,
    'data-list-key': dataListKey,
  }), [finalId, group.id, dataListKey, getLabel, selectViaInteraction]);

  // Registers itself with the parent
  React.useEffect(() => {
    const unregister = parent.register(optionRef) || noop;

    return () => {
      unregister();
    };
  }, [
    parent.register,
    optionRef,
  ]);

  return (
    <OptionRoot
      {...restProps}
      id={finalId}
      tabIndex={tabIndex}
      role="option"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-selected={ariaSelected}
      aria-disabled={disabled}
      data-active={active}
      data-multiple={parent.multiple}
      data-selected={selected}
      data-disabled={disabled}
      data-sui="option"
      data-sui-tree="option:root"
      ref={element}
    >
      <OptionText as="span" data-sui-tree="option:text">
        { children }
      </OptionText>
    </OptionRoot>
  );
}

Option.propTypes = {
  // HTML id
  id: PropTypes.string,
  // Content
  children: PropTypes.node,
  // Whether the option is disabled
  disabled: PropTypes.bool,
  // The list key to service the parent and the key manager
  'data-list-key': PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  // Value associated with the option
  value: PropTypes.any,
  // Label to be used
  label: PropTypes.string,
  // Optional selection change callback
  onSelectionChange: PropTypes.func,
};

Option.defaultProps = {
  id: null,
  children: null,
  disabled: false,
  onSelectionChange: noop,
  value: undefined,
  label: null,
  __SUI_TYPE__: 'option',
};

export default Option;

/**
 * Counts the amount of option group labels that precede the specified option.
 * @param optionIndex {number} Index of the option at which to start counting.
 * @param options {Array} Ref list of all of the options.
 * @param optionGroups {Array} Ref list of all of the option groups.
 * @return {number}
 * @docs-private
 */
export function countGroupLabelsBeforeOption(optionIndex, options, optionGroups) {
  if (optionGroups.length) {
    let groupCounter = 0;

    for (let i = 0; i < optionIndex + 1; i++) {
      const currentGroupIdForOption = options[i].group;
      if (
        currentGroupIdForOption && optionGroups[groupCounter]
        && currentGroupIdForOption === optionGroups[groupCounter].id
      ) {
        groupCounter++;
      }
    }

    return groupCounter;
  }

  return 0;
}

/**
 * Determines the position to which to scroll a panel in order for an option to be into view.
 * @param optionIndex {number} Index of the option to be scrolled into the view.
 * @param optionHeight {number} Height of the options.
 * @param currentScrollPosition {number} Current scroll position of the panel.
 * @param panelHeight {number} Height of the panel.
 * @return {number}
 * @docs-private
 */
export function getOptionScrollPosition(
  optionIndex, optionHeight, currentScrollPosition, panelHeight
) {
  const optionOffset = optionIndex * optionHeight;

  if (optionOffset < currentScrollPosition) {
    return optionOffset;
  }

  if (optionOffset + optionHeight > currentScrollPosition + panelHeight) {
    return Math.max(0, optionOffset - panelHeight + optionHeight);
  }

  return currentScrollPosition;
}
