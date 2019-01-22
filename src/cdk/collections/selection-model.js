import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

export const SelectionModelPropTypes = PropTypes.shape({
  selected: PropTypes.any,
  multiple: PropTypes.bool,
  isSelected: PropTypes.func,
  select: PropTypes.func,
  deselect: PropTypes.func,
  toggle: PropTypes.func,
  clear: PropTypes.func,
  isEmpty: PropTypes.func,
});

export const SelectionModelDefaultProps = {
  selected: undefined,
  multiple: false,
  isSelected: _.noop,
  select: _.noop,
  deselect: _.noop,
  toggle: _.noop,
  clear: _.noop,
  isEmpty: _.noop,
};

export const {
  Provider: SelectionModelProvider, Consumer: SelectionModelConsumer
} = React.createContext(SelectionModelDefaultProps);

export class SelectionModel extends React.Component {
  constructor() {
    super();
    
    this.state = {
      /** Keeps track of the selected options that haven't been emitted by the change event. */
      selectedToEmit: [],
      /** Keeps track of the deselected options that haven't been emitted by the change event. */
      deselectedToEmit: [],
    };
  }
  
  /**
   * Derived data
   */
  /**
   * Determines whether a value is selected.
   */
  isSelected = value => this.getArrayCastValue().indexOf(value) > -1;
  
  /**
   * Determines whether the model does not have a value.
   */
  isEmpty = () => {
    const value = this.getArrayCastValue();
    return this.props.multiple ? _.isEmpty(value) :
      _.isNil(_.head(value));
  };
  
  /** Cast this.props.value as an array */
  getArrayCastValue = () => {
    const arrayAsValues = _.castArray(this.props.value);
    
    // if we're multiple, then pass selected value as array
    if (this.props.multiple) return arrayAsValues;
    /*
    otherwise return the first value of the array OR the value itself
    depending on if we're given an array
     */
    return _.castArray(
      _.isArray(this.props.value) ?
        _.head(this.props.value) :
        this.props.value
    );
  };
  
  /**
   * Selects a value or an array of values.
   */
  select = (...values) => {
    values.forEach(value => markSelected.call(this, value));
    emitChangeEvent.call(this);
  };
  
  /**
   * Deselects a value or an array of values.
   */
  deselect = (...values) => {
    values.forEach(value => unmarkSelected.call(this, value));
    emitChangeEvent.call(this);
  };
  
  /**
   * Toggles a value between selected and deselected.
   */
  toggle = (value) => {
    this.isSelected(value) ? this.deselect(value) : this.select(value);
  };
  
  /**
   * Clears all of the selected values.
   */
  clear = () => {
    unmarkAll.call(this);
    emitChangeEvent.call(this);
  };
  
  /*
  Get the props-dependent context value for the provider
   */
  getProviderValue = () => ({
    selected: this.getArrayCastValue(),
    multiple: this.props.multiple,
    isSelected: this.isSelected,
    select: this.select,
    deselect: this.deselect,
    toggle: this.toggle,
    clear: this.clear,
    isEmpty: this.isEmpty,
  });
  
  render() {
    return (
      <SelectionModelProvider value={this.getProviderValue()}>
        { this.props.children }
      </SelectionModelProvider>
    )
  }
}

SelectionModel.propTypes = {
  value: PropTypes.oneOfType([PropTypes.node, PropTypes.arrayOf(PropTypes.node)]),
  multiple: PropTypes.bool,
  onChange: PropTypes.func,
};

SelectionModel.defaultProps = {
  value: undefined,
  multiple: false,
  onChange: null,
};

/*
Higher order component to wrap the list key provider
 */
export const withSelectionModelProvider = Component => props => {
  const { value, multiple, onChange, ...restProps } = props;
  return (
    <SelectionModel value={value} multiple={multiple} onChange={onChange}>
      <Component {...restProps} />
    </SelectionModel>
  )
};

/*
Higher order component to wrap whatever child Component in a list key consumer
 */
export function withSelectionModelConsumer(Component) {
  function WithSelectionModelConsumer(props) {
    return (
      <SelectionModelConsumer>
        { context => <Component {...props} __selectionModel={context} /> }
      </SelectionModelConsumer>
    );
  }
  
  WithSelectionModelConsumer.displayName = `WithSelectionModelConsumer(${Component.displayName})`;
  return WithSelectionModelConsumer;
}

/**
 * Private methods
 */

/** Emits a change event and clears the records of selected and deselected values. */
function emitChangeEvent() {
  this.setState((state) => {
    // don't interfere with state
    const { selectedToEmit, deselectedToEmit } = state;
    // apply change as side effect
    if (_.isFunction(this.props.onChange)) {
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
    this.getArrayCastValue().forEach(value => unmarkSelected.call(this, value));
  }
}
