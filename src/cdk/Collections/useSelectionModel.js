import * as React from 'react';
import castArray from 'lodash/castArray';

/**
 * Class to be used to power selecting one or more options from a list.
 * @param value {any | any[]} The selection value to use
 * @param options {Object}
 * @param [options.multiple=false] {boolean} Whether it should allow multiple selection.
 * @param [options.onChange] {function} onChange handler for the selection change.
 */
export default function useSelectionModel(value, options) {
  /** Keeps track of the deselected options that haven't been emitted by the change event. */
  const deselectedToEmit = React.useRef([]);

  /** Keeps track of the selected options that haven't been emitted by the change event. */
  const selectedToEmit = React.useRef([]);

  /** Currently-selected values. */
  const selection = React.useMemo(() => castArray(value), [value]);

  /**
   * Determines whether a value is selected.
   * @type {function(value: *): boolean}
   */
  const isSelected = React.useCallback(
    val => selection.indexOf(val) > -1,
    [selection],
  );

  /**
   * Determines whether the selection model doesn't have a value.
   * @type {boolean}
   */
  const isEmpty = React.useMemo(
    () => selection.length === 0,
    [selection],
  );

  /**
   * Determines whether the selection model has a value.
   * @type {boolean}
   */
  const hasValue = React.useMemo(
    () => !isEmpty,
    [isEmpty],
  );

  /**
   * Determines whether the selection model accepts multiple values.
   * @type {boolean}
   */
  const isMultiple = React.useMemo(
    () => options.multiple,
    [options.multiple],
  );

  /**
   * Emits a change event and clears the records of selected and deselected values.
   * @type {Function}
   */
  const emitChangeEvent = React.useCallback(
    () => {
      if (
        (selectedToEmit.current.length || deselectedToEmit.current.length)
        && typeof options.onChange === 'function'
      ) {
        options.onChange({ added: selectedToEmit.current, removed: deselectedToEmit.current });

        selectedToEmit.current = [];
        deselectedToEmit.current = [];
      }
    },
    [selectedToEmit, deselectedToEmit, options.onChange],
  );

  /**
   * Deselects a value
   * @type {Function}
   */
  const unmarkSelected = React.useCallback((val) => {
    if (isSelected(val)) {
      deselectedToEmit.current.push(val);
    }
  }, [isSelected]);

  /**
   * Clears out the selected values
   * @type {Function}
   */
  const unmarkAll = React.useCallback(() => {
    if (!isEmpty) {
      selection.forEach(unmarkSelected);
    }
  }, [isEmpty, unmarkSelected]);

  /**
   * Selects a value
   * @type {Function}
   */
  const markSelected = React.useCallback((val) => {
    if (!isSelected(val)) {
      if (!options.multiple) {
        unmarkAll();
      }

      selectedToEmit.current.push(val);
    }
  }, [isSelected, options.multiple, unmarkAll]);

  /**
   * Selects a value or an array of values
   * @type {function(...values: any)}
   */
  const select = React.useCallback(
    (...values) => {
      values.forEach(markSelected);
      emitChangeEvent();
    },
    [markSelected, emitChangeEvent],
  );

  /**
   * Deselects a value or an array of values
   * @type {function(...values: any)}
   */
  const deselect = React.useCallback(
    (...values) => {
      values.forEach(unmarkSelected);
      emitChangeEvent();
    },
    [unmarkSelected, emitChangeEvent],
  );

  /**
   * Toggles a value between selected and deselected
   * @type {function(val: any): void}
   */
  const toggle = React.useCallback(
    (val) => {
      isSelected(val) ? deselect(val) : select(val);
    },
    [isSelected, select, deselect],
  );
  /**
   * Clears all of the selected values
   * @type {Function}
   */
  const clear = React.useCallback(
    () => {
      unmarkAll();
      emitChangeEvent();
    },
    [unmarkAll, emitChangeEvent],
  );

  return React.useMemo(() => ({
    isMultiple,
    hasValue,
    isEmpty,
    isSelected,
    select,
    deselect,
    clear,
    toggle,
  }), [
    isMultiple,
    hasValue,
    isEmpty,
    isSelected,
    select,
    deselect,
    clear,
    toggle,
  ]);
}
