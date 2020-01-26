import * as React from 'react';
import noop from 'lodash/noop';
import get from 'lodash/get';
import util from './util';
import { A, DOWN_ARROW, LEFT_ARROW, NINE, RIGHT_ARROW, TAB, UP_ARROW, Z, ZERO } from '../../Keycodes/constants';

/**
 * @typedef {Object} KeyManager
 * @property updateActiveItem {Function} Update the key manager's active item without calling
 * the `onChange` callback
 * @property setPreviousItemActive {Function} Set the previous item in the list as active
 * @property setNextItemActive {Function} Set the next item in the list as active
 * @property setFirstItemActive {Function} Set the first item of the list as active
 * @property setLastItemActive {Function} Set the last item of the list as active
 * @property getActiveItem {Function} Get the current active item. Defaults to `null`
 * @property getActiveItemIndex {function(): number} Get the index of the current active item.
 * Defaults to `-1`
 * @property setActiveItem {Function} Update the key manager's active item and call the
 * `onChange` callback
 * @property onKeyDown {function(KeyboardEvent): void} Callback to be bound to the element's
 * `onkeydown` to trigger active item selection
 * @property getIsTyping {function(): boolean} Get whether the user is currently typing something
 */

const DEFAULT_CONFIG = {
  wrap: false,
  vertical: true,
  horizontal: null,
  allowedModifierKeys: [],
  skipPredicateFn: listItem => get(listItem, 'props.disabled', false),
  onChange: noop,
  onTabOut: noop,
  typeahead: null,
  /**
   * Find the index from the React.Children array using the prop `data-list-key`.
   * @param array {Array}
   * @param listItem {Object}
   */
  findIndex: (array, listItem) => array.findIndex((item) => {
    if (!item || !item.props) return;
    return item.props['data-list-key'] === listItem.props['data-list-key'];
  }),
  /**
   * Get the label from an item using the prop `data-list-key`.
   * @param listItem {Object}
   * @return {string}
   */
  getLabel: listItem => get(listItem, 'props.data-list-key') || '',
};

/**
 * Available key modifiers
 * @type {string[]}
 */
const MODIFIERS = ['altKey', 'ctrlKey', 'metaKey', 'shiftKey'];

/**
 *
 * @param children
 * @param __config
 * @return {KeyManager}
 */
function useListKeyManager(children, __config) {
  /**
   * Current active item index from the options
   * @type {React.MutableRefObject<number>}
   */
  const activeItemIndex = React.useRef(-1);

  /**
   * Current active item from the options
   * @type {React.MutableRefObject<* | null>}
   */
  const activeItem = React.useRef(null);

  /**
   * Final configuration
   * @type {{horizontal, allowedModifierKeys, vertical, wrap, skipPredicateFn, onTabOut, getLabel,
   * onChange, findIndex, typeahead}}
   */
  const config = React.useMemo(
    () => ({ ...DEFAULT_CONFIG, ...__config }),
    [__config]
  );

  /**
   * Buffer for the letters that the user has pressed when the typeahead option is turned on
   * @type {React.MutableRefObject<string[]>}
   */
  const pressedLetters = React.useRef([]);

  /**
   * Memoized array of children that will only update when the children are updated.
   * @type {any[]}
   */
  const options = React.useMemo(() => React.Children.toArray(children), [children]);

  // Update active item when the list of children changes. Expose the listener to options, which
  // aliases children, so we can use array methods on it.
  React.useEffect(() => {
    if (activeItem.current) {
      const newIndex = config.findIndex(options, activeItem.current);

      if (newIndex > -1 && newIndex !== activeItemIndex.current) {
        activeItemIndex.current = newIndex;
      }
    }
  }, [config.findIndex, options]);

  /**
   * Allows setting the active item without any other effects.
   * @param item Item to be set as active.
   */
  const updateActiveItem = React.useCallback((item) => {
    const index = typeof item === 'number' ? item : config.findIndex(options, item);
    const __activeItem = options[index];

    activeItem.current = __activeItem == null ? null : __activeItem;
    activeItemIndex.current = index;
  }, [
    config.findIndex,
    options,
  ]);

  /**
   * Sets the active item to the item at the index specified.
   * @param item The index or the item to be set as active
   */
  const setActiveItem = React.useCallback((item) => {
    const previousIndex = activeItemIndex.current;

    updateActiveItem(item);

    if (activeItemIndex.current !== previousIndex) {
      config.onChange(activeItemIndex.current);
    }
  }, [updateActiveItem, config.onChange]);

  /**
   * Sets the active item to the first enabled item starting at the index specified. If the
   * item is disabled, it will move in the fallbackDelta direction until it either
   * finds an enabled item or encounters the end of the list.
   * @type {function(index: number, fallbackDelta: number): void}
   */
  const setActiveItemByIndex = React.useCallback((index, fallbackDelta) => {
    if (!options[index]) return;

    while (config.skipPredicateFn(options[index])) {
      index += fallbackDelta;

      if (!options[index]) return;
    }

    setActiveItem(index);
  }, [options, config.skipPredicateFn, setActiveItem]);

  /**
   * Sets the active item properly given the default mode. In other words, it will
   * continue to move down the list until it finds an item that is not disabled. If
   * it encounters either end of the list, it will stop and not wrap.
   * @type {function(delta: number): void}
   */
  const setActiveInDefaultMode = React.useCallback((delta) => {
    setActiveItemByIndex(activeItemIndex.current + delta, delta)
  }, [setActiveItemByIndex]);

  /**
   * Sets the active item properly given "wrap" mode. In other words, it will continue to move
   * down the list until it finds an item that is not disabled, and it will wrap if it
   * encounters either end of the list.
   * @type {function(delta: number): void}
   */
  const setActiveInWrapMode = React.useCallback((delta) => {
    for (let i = 1; i <= options.length; i++) {
      const index = (activeItemIndex.current + (delta * i) + options.length) % options.length;
      const item = options[index];

      if (!config.skipPredicateFn(item)) {
        setActiveItem(index);
        return;
      }
    }
  }, [options, config.skipPredicateFn, setActiveItem]);

  /**
   * This method sets the active item, given a list of items and the delta between the
   * currently active item and the new active item. It will calculate differently
   * depending on whether wrap mode is turned on.
   * @type {function(delta: number): void}
   */
  const setActiveItemByDelta = React.useCallback((delta) => {
    config.wrap ? setActiveInWrapMode(delta) : setActiveInDefaultMode(delta);
  }, [config.wrap, setActiveInDefaultMode, setActiveInWrapMode]);

  /** Sets the active item to the first enabled item in the list. */
  const setFirstItemActive = React.useCallback(() => {
    setActiveItemByIndex(0, 1);
  }, [setActiveItemByIndex]);

  /** Sets the active item to the last enabled item in the list. */
  const setLastItemActive = React.useCallback(() => {
    setActiveItemByIndex(options.length - 1, -1);
  }, [options, setActiveItemByIndex]);

  /** Sets the active item to the next enabled item in the list. */
  const setNextItemActive = React.useCallback(() => {
    activeItemIndex.current < 0 ?
      setFirstItemActive() :
      setActiveItemByDelta(1);
  }, [setFirstItemActive, setActiveItemByDelta]);

  /** Sets the active item to a previous enabled item in the list. */
  const setPreviousItemActive = React.useCallback(() => {
    activeItemIndex.current < 0 && config.wrap ?
      setLastItemActive() :
      setActiveItemByDelta(-1);
  }, [config.wrap, setLastItemActive, setActiveItemByDelta]);

  /** Getter for the active item ref */
  const getActiveItem = React.useCallback(() => activeItem.current, []);

  /** Getter for the active item index ref */
  const getActiveItemIndex = React.useCallback(() => activeItemIndex.current, []);

  const findLabelFromString = React.useCallback(() => {
    if (pressedLetters.current.length === 0) return;

    const string = pressedLetters.current.join('');

    // Start at 1 because we want to start searching at the item immediately
    // following the current active item.
    for (let i = 1; i <= options.length; i++) {
      const index = (activeItemIndex.current + i) % options.length;
      const item = options[index];

      if (
        !config.skipPredicateFn(item)
        && item.props
        && config.getLabel(item).toUpperCase().trim().indexOf(string) === 0
      ) {
        setActiveItem(index);
        break;
      }
    }

    pressedLetters.current = [];
  }, [
    options,
    setActiveItem,
    config.skipPredicateFn,
  ]);

  const debouncedFindLabelFromString = React.useMemo(() => {
    if (config.typeahead != null && config.typeahead !== false) {
      const debounceTime = typeof config.typeahead === 'number' ? config.typeahead : 200;
      return util.debounce(findLabelFromString, debounceTime);
    }

    return noop;
  }, [config.typeahead, findLabelFromString]);

  const addLetterKey = React.useCallback((letter) => {
    if (config.typeahead == null || config.typeahead === false) return;

    // Debounce the presses of non-navigational keys, collect the ones that correspond to letters
    // and convert those letters back into a string. Afterwards find the first item that starts
    // with that string and select it.
    pressedLetters.current.push(letter);

    debouncedFindLabelFromString();
  }, [
    config.typeahead,
    debouncedFindLabelFromString,
  ]);

  const getIsTyping = React.useCallback(() => (
    pressedLetters.current.length > 0
  ), []);

  /**
   * Sets the active item depending on the key event passed in.
   * @type {function(event: KeyboardEvent): void}
   * @param event Keyboard event to be used for determining which element should be active.
   */
  const onKeyDown = React.useCallback((event) => {
    // Use keyCode since it's widely supported for compatibility
    const keyCode = event.keyCode;
    const isModifierAllowed = MODIFIERS.every(modifier => (
      !event[modifier] || config.allowedModifierKeys.indexOf(modifier) > -1
    ));

    switch (keyCode) {
      case TAB:
        config.onTabOut();
        return;
      case DOWN_ARROW:
        if (config.vertical && isModifierAllowed) {
          setNextItemActive();
          break;
        } else {
          return;
        }
      case UP_ARROW:
        if (config.vertical && isModifierAllowed) {
          setPreviousItemActive();
          break;
        } else {
          return;
        }
      case RIGHT_ARROW:
        if (config.horizontal && isModifierAllowed) {
          config.horizontal === 'rtl' ? setPreviousItemActive() : setNextItemActive();
          break;
        } else {
          return;
        }
      case LEFT_ARROW:
        if (config.horizontal && isModifierAllowed) {
          config.horizontal === 'rtl' ? setNextItemActive() : setPreviousItemActive();
          break;
        } else {
          return;
        }
      default:
        if (isModifierAllowed || event.shiftKey) {
          // Attempt to use the `event.key` which also maps it to the user's keyboard language,
          // otherwise fall back to resolving alphanumeric characters via the keyCode.
          if (event.key && event.key.length === 1) {
            addLetterKey(event.key.toLocaleUpperCase());
          } else if ((keyCode >= A && keyCode <= Z) || (keyCode >= ZERO && keyCode <= NINE)) {
            addLetterKey(String.fromCharCode(keyCode));
          }
        }

        // Note that we return here, in order to avoid preventing
        // the default action of non-navigational keys.
        return;
    }

    pressedLetters.current = [];
    event.preventDefault();
  }, [
    addLetterKey,
    setPreviousItemActive,
    setNextItemActive,
    config.vertical,
    config.onTabOut,
    config.allowedModifierKeys,
  ]);

  return React.useMemo(() => ({
    updateActiveItem,
    setPreviousItemActive,
    setNextItemActive,
    setFirstItemActive,
    setLastItemActive,
    getActiveItem,
    getActiveItemIndex,
    setActiveItem,
    onKeyDown,
    getIsTyping,
  }), [
    updateActiveItem,
    setPreviousItemActive,
    setNextItemActive,
    setFirstItemActive,
    setLastItemActive,
    getActiveItem,
    getActiveItemIndex,
    setActiveItem,
    onKeyDown,
    getIsTyping,
  ]);
}

export default useListKeyManager;
