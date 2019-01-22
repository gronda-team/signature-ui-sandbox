import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { TagListInput } from './styles/index';
import { ENTER } from '../../components/core/keys';
import { TagInputContextDefaultProps, TagInputContextPropTypes, withTagInputConsumer } from './input-context';

class TagInput extends React.Component {
  constructor() {
    super();
    
    this.state = {
      focused: false,
    };
    
    this.DEFAULT_ID = _.uniqueId('sui-tag-input:');
  }
  /**
   * Lifecycle
   */
  componentDidMount() {
    this.props.__tagListInput.setTagInputState({
      id: this.getId(),
      placeholder: this.props.placeholder,
      getFocused: this.getFocused, // get this.state.focused
      isEmpty: this.isEmpty,
      focus: this.focus, // programmatically focus the input field
    });
  }
  
  componentDidUpdate(prevProps) {
    if (this.getId(prevProps) !== this.getId()) {
      // set the input state wherever possible
      this.props.__tagListInput.setTagInputState({ id: this.getId() });
    }
    
    if (prevProps.placeholder !== this.props.placeholder) {
      // update placeholder
      this.props.__tagListInput.setTagInputState({ placeholder: this.props.placeholder });
    }
  }
  /**
   * Refs
   */
  getInputRef = (input) => {
    this.INPUT = input;
  };
  
  /**
   * Derived data
   */
  /** Get the non-null ID */
  getId = (props = this.props) => props.id || this.DEFAULT_ID;
  
  /** Getter function (for context) for focus */
  getFocused = () => this.state.focused;
  
  /** Whether the input is empty. */
  isEmpty = () => !this.props.value;
  
  /**
   * Actions
   */
  /** Checks to see if there is a change event. */
  emitTagEnd = (event) => {
    if (!this.props.value && !_.isNil(event)) {
      this.props.__tagListInput.keydown(event);
    }
  
    if (_.isNil(event) || this.props.separatorKeyCodes.indexOf(event.key) > -1) {
      // trigger the add tag listener
      this.props.addTag({ input: this.INPUT, value: this.props.value });
      if (event) {
        event.preventDefault();
      }
    }
  };
  
  /** Keydown method for easy access */
  onKeyDown = (event) => {
    this.emitTagEnd(event);
    
    if (_.isFunction(this.props.onKeyDown)) {
      this.props.onKeyDown(event);
    }
  };
  
  /** Checks to see if the blur should emit the (chipEnd) event. */
  onBlur = (event) => {
    if (this.props.addOnBlur) {
      this.emitTagEnd(); // no keyboard event is passed here!
    }
    
    this.setState({ focused: false });
    // Blur the tag list if it is not focused
    if (!this.props.__tagListInput.isFocused()) {
      this.props.__tagListInput.blur();
    }
    
    if (_.isFunction(this.props.onBlur)) {
      this.props.onBlur(event);
    }
  };
  
  /** focus listener */
  onFocus = (event) => {
    this.setState({ focused: true });
    if (event && _.isFunction(this.props.onFocus)) {
      this.props.onFocus(event);
    }
  };
  
  /** programmatic focus invoker */
  focus = () => {
    if (this.INPUT) {
      this.INPUT.focus();
    }
  };
  
  render() {
    const {
      id, disabled, placeholder, value,
      separatorKeyCodes, addTag, addOnBlur,
      ...restProps,
    } = this.props;
    
    return (
      <TagListInput
        {...restProps}
        disabled={disabled}
        placeholder={placeholder}
        id={this.getId()}
        value={value}
        aria-invalid={false}
        onKeyDown={this.onKeyDown}
        onBlur={this.onBlur}
        onFocus={this.onFocus}
        innerRef={this.getInputRef}
      />
    )
  }
}

const TagInputPropTypes = {
  /** Unique id for the input. */
  id: PropTypes.string,
  /** Whether the input is disabled. */
  disabled: PropTypes.bool,
  /** The input's placeholder text. */
  placeholder: PropTypes.string,
  /** The input's value. */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /**
   * The list of key codes that will trigger a chipEnd event.
   *
   * Defaults to `[ENTER]`.
   */
  separatorKeyCodes: PropTypes.arrayOf(PropTypes.string),
  /** Called when a new tag should be added */
  addTag: PropTypes.func,
  /** Whether or not the input should add a tag on blurring */
  addOnBlur: PropTypes.bool,
  /** On change function */
  onChange: PropTypes.func,
};

const TagInputDefaultProps = {
  id: null,
  disabled: false,
  placeholder: null,
  value: '',
  separatorKeyCodes: [ENTER],
  addTag: _.noop,
  addOnBlur: false,
  onChange: _.noop,
};

TagInput.propTypes = {
  ...TagInputPropTypes,
  __tagListInput: TagInputContextPropTypes,
};

TagInput.defaultProps = {
  ...TagInputDefaultProps,
  __tagListInput: TagInputContextDefaultProps,
};

const StackedTagInput = withTagInputConsumer(TagInput);

StackedTagInput.propTypes = TagInputPropTypes;
StackedTagInput.defaultProps = TagInputDefaultProps;

export default StackedTagInput;
