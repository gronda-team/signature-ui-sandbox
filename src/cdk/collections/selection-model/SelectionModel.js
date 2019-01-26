import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

/**
 * The SelectionModel component is one that passes through
 * children while also providing access to convenience functions
 * that can be accessed as follows
 *
 * this.selection = React.createRef();
 *
 * <SelectionModel ref={this.selection}>
 *   { ... }
 * </ SelectionModel>
 *
 * this.selection.current.select(...);
 * this.selection.current.isSelected(...);
 * and so on
 */
class SelectionModel extends React.Component {
  constructor() {
    super();

    this.state = {
      /** Keeps track of the selected options that haven't been emitted by the change event. */
      selectedToEmit: [],
      /** Keeps track of the deselected options that haven't been emitted by the change event. */
      deselectedToEmit: [],
    };
  }

  /** Get the selected value as an array */
  selected = (props = this.props) => {
    if (props.value === undefined) return [];
    return _.castArray(props.value);
  };

  /** Determines whether a value is selected. */
  isSelected = value => this.selected().indexOf(value) > -1;

  /** Determines whether the model does not have a value. */
  isEmpty = () => this.selected().length === 0;

  /** Determines whether it has a value */
  hasValue = () => !this.isEmpty();

  /** Determines if multiple selection is allowed */
  isMultipleSelection = () => this.props.multiple;

  /** Selects a value or an array of values. */
  select = (...values) => {
    if (this.props.multiple) {
      values.forEach(value => markSelected.call(this, value));
    } else {
      markSelected.call(this, _.head(values));
    }

    emitChangeEvent.call(this);
  };

  /** Deselects a value or an array of values. */
  deselect = (...values) => {
    if (this.props.multiple) {
      values.forEach(value => unmarkSelected.call(this, value));
    } else {
      unmarkSelected.call(this, _.head(values));
    }

    emitChangeEvent.call(this);
  };

  /** Toggles a value between selected and deselected. */
  toggle = (value) => {
    this.isSelected(value) ? this.deselect(value) : this.select(value);
  };

  /** Clears all of the selected values. */
  clear = () => {
    unmarkAll.call(this);
    emitChangeEvent.call(this);
  };

  /** Simple wrap-around component */
  render = () => this.props.children;
}

SelectionModel.propTypes = {
  /** Currently-selected values. */
  value: PropTypes.any,
  /** Event emitted when the value has changed. */
  onChange: PropTypes.func,
  /** Whether we can multiply select or not */
  multiple: PropTypes.bool,
};

SelectionModel.defaultProps = {
  onChange: _.noop,
  multiple: false,
};

export default SelectionModel;

/**
 * Private methods
 */

/** Emits a change event and clears the records of selected and deselected values. */
function emitChangeEvent() {
  this.setState((state) => {
    // don't interfere with state
    const { selectedToEmit, deselectedToEmit } = state;
    // apply change as side effect
    if (_.isFunction(this.props.onChange) && (selectedToEmit.length || deselectedToEmit.length)) {
      this.props.onChange({
        added: selectedToEmit,
        removed: deselectedToEmit,
      });
    }

    return { selectedToEmit: [], deselectedToEmit: [] };
  });
}

/** Selects a value. */
function markSelected(value) {
  if (!this.isSelected(value)) {
    if (!this.props.multiple) {
      unmarkAll.call(this);
    }

    this.setState(state => ({
      selectedToEmit: [...state.selectedToEmit, value],
    }));
  }
}

/** Deselects a value. */
function unmarkSelected(value) {
  if (this.isSelected(value)) {
    this.setState(state => ({
      deselectedToEmit: [...state.deselectedToEmit, value],
    }));
  }
}

/** Clears out the selected values. */
function unmarkAll() {
  if (!this.isEmpty()) {
    this.selected().forEach(value => unmarkSelected.call(this, value));
  }
}
