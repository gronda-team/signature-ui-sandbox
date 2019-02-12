import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { OptionRoot, OptionText } from './styles/index';
import { ENTER, SPACE, SPACEBAR } from '../../../cdk/keycodes/keys';
import {
  OptionParentDefaultProps,
  OptionParentPropTypes,
  withOptionParentConsumer
} from './context/OptionParent';
import { stack } from '../components/util';

class Option extends React.Component {
  constructor() {
    super();

    /** Show active styling */
    this.state = {
      active: false,
    };
    
    this.DEFAULT_ID = _.uniqueId('sui-option:');
  }

  /**
   * Lifecycle
   */
  componentDidUpdate(prevProps) {
    const currentActive = this.props.__parent.activeItem;
    const previousActive = prevProps.__parent.activeItem;
    if (currentActive !== previousActive) {
      if (_.get(currentActive, 'props.value') === this.props.value) {
        this.activate();
      } else {
        this.deactivate();
      }
    }
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

  /** Programmatically activate this from e.g., a keyManager */
  activate = () => {
    this.setState({ active: true });
  };

  deactivate = () => {
    this.setState({ active: false });
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
        data-active={this.state.active}
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

const OptionPropTypes = {
  /** Whether or not the option is currently selected. */
  selected: PropTypes.bool,
  /** Whether the option is disabled. */
  disabled: PropTypes.bool,
  /** The unique ID of the option. */
  id: PropTypes.string,
  /** view value of the option item */
  viewValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

const OptionDefaultProps = {
  selected: false,
  disabled: false,
  id: null,
  '__sui-internal-type': 'Option',
};

Option.propTypes = {
  ...OptionPropTypes,
  /** The option group */
  __optionGroup: PropTypes.shape({
    /** Whether the option group is disabled. */
    disabled: PropTypes.bool,
  }),
  /** The parent, whether that's a select or menu or whatever */
  __parent: OptionParentPropTypes,
};

Option.defaultProps = {
  ...OptionDefaultProps,
  __optionGroup: {
    disabled: false,
  },
  __parent: OptionParentDefaultProps,
};

const StackedOption = stack(
  // withOptionGroupConsumer,
  withOptionParentConsumer,
)(Option);

StackedOption.propTypes = OptionPropTypes;
StackedOption.defaultProps = OptionDefaultProps;

export default StackedOption;

/**
 * Private methods
 */
function emitSelectionChangeEvent(isUserInput = false) {
  this.props.__parent.onSelectionChange({
    isUserInput,
    source: this,
  });
}
