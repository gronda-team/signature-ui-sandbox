import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { OptionRoot, OptionText } from './styles/index';
import { ENTER, SPACE, SPACEBAR } from '../../../components/core/keys';

class Option extends React.Component {
  constructor() {
    super();
    
    this.DEFAULT_ID = _.uniqueId('sui-option:');
  }
  
  /**
   * refs
   */
  getOptionRootRef = (option) => {
    this.OPTION = option;
  };
  
  
  /**
   * Derived data
   */
  /** Whether the option is disabled. */
  isDisabled = () => (
    _.get(this.props.__optionGroup, 'disabled') || this.props.disabled
  );
  
  /** Whether the wrapping component is in multiple selection mode. */
  isMultiple = () => (
    _.get(this.props.__parent, 'multiple')
  );
  
  /** The unique ID of the option. */
  getId = () => this.props.id || this.DEFAULT_ID;
  
  /** Returns the correct tabindex for the option depending on disabled state. */
  getTabIndex = () => this.isDisabled() ? -1 : 0;
  
  
  /**
   * Actions
   */
  focus = () => {
    if (this.OPTION) {
      this.OPTION.focus();
    }
  };
  
  /** Ensures the option is selected when activated from the keyboard. */
  handleKeydown = (event) => {
    const key = event.key;
    if (key === ENTER || key === SPACEBAR || key === SPACE) {
      this.selectViaInteraction();
      
      // prevent scrolling up/down
      event.preventDefault();
    }
  };
  
  /**
   * Selects the option while indicating the selection came from the user. Used to
   * determine if the select's view -> model callback should be invoked.
   */
  selectViaInteraction = () => {
    if (!this.isDisabled()) {
      // is user input
      emitSelectionChangeEvent.call(this, true);
    }
  };
  
  render() {
    return (
      <OptionRoot
        innerRef={this.getOptionRootRef}
        role="option"
        tabIndex={this.getTabIndex()}
        id={this.getId()}
        data-multiple={this.isMultiple()}
        data-active={this.props.active}
        aria-selected={this.props.selected.toString()}
        aria-disabled={this.isDisabled().toString()}
        onClick={this.selectViaInteraction}
        onKeydown={this.handleKeydown}
      >
        <OptionText>{ this.props.children }</OptionText>
      </OptionRoot>
    )
  }
}

Option.propTypes = {
  /** Whether or not the option is currently selected. */
  selected: PropTypes.bool,
  /** Whether the option is disabled. */
  disabled: PropTypes.bool,
  /** The unique ID of the option. */
  id: PropTypes.string,
  /** Event emitted when the option is selected or deselected. */
  onSelectionChange: PropTypes.func,
  /** view value of the option item */
  viewValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  /** The option group */
  __optionGroup: PropTypes.shape({
    /** Whether the option group is disabled. */
    disabled: PropTypes.bool,
  }),
  /** The parent, whether that's a select or menu or whatever */
  __parent: PropTypes.shape({
    multiple: PropTypes.bool,
  }),
};

Option.defaultProps = {
  selected: false,
  disabled: false,
  id: null,
  onSelectionChange: _.noop,
  __optionGroup: {
    disabled: false,
  },
  __parent: {
    multiple: false,
  },
};

export default Option;

/**
 * Private methods
 */
function emitSelectionChangeEvent(isUserInput = false) {
  this.props.onSelectionChange({
    isUserInput,
    value: this.props.value,
  });
}