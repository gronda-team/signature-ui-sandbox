import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { ENTER } from '../../../cdk/keycodes/keys';
import { TagInputContextDefaultProps, TagInputContextPropTypes, withTagInputConsumer } from '../../tags/context/TagListInputContext';

class TagExtension extends React.Component {
  constructor() {
    super();
    
    this.DEFAULT_ID = _.uniqueId('sui-tag-input:');

    this.state = {
      /** Required for some handling logic in tag list */
      focused: false,
    };
  }
  
  /**
   * Derived data
   */
  /** Get the input */
  getInput = () => this.props.input;

  /** Get the tag list */
  getTagList = () => this.props.tagList;

  /** Get the non-null ID */
  getId = (props = this.props) => props.id || this.DEFAULT_ID;

  /** Get the extended attributes to be merged into this.props.input */
  getExtendedAttributes = () => ({
    disabled: this.getFinalDisabled(),
    'aria-invalid': false,
  });

  /** Whether the input is disabled */
  getFinalDisabled = () => (
    this.getInput().props.disabled || this.getTagList().props.disabled
  );

  /**
   * Actions
   */
  /** Keydown method for access to this.props.input */
  onKeyDown = (event) => {
    this.emitTagEnd(event);
  };
  
  /** Checks to see if the blur should emit the (chipEnd) event. */
  onBlur = () => {
    if (this.props.tagListAddOnBlur) {
      this.emitTagEnd(); // no keyboard event is passed here!
    }

    this.setState({ focused: false });

    if(!this.getTagList().state.focused) {
      this.getTagList().blur();
    }
  };
  
  /** focus listener */
  onFocus = () => {
    this.setState({ focused: true });
  };

  /** Checks to see if there is a change event. */
  emitTagEnd = (event) => {
    if (!this.props.value && !_.isNil(event)) {
      this.props.__tagListInput.keydown(event);
    }

    if (_.isNil(event) || this.props.tagListSeparatorKeyCodes.indexOf(event.key) > -1) {
      // trigger the add tag listener
      this.props.onTagEnd({ input: this.INPUT, value: this.props.value });
      if (event) {
        event.preventDefault();
      }
    }
  };

  /** programmatic focus invoker */
  focus = () => {
    if (this.INPUT) {
      this.INPUT.focus();
    }
  };

  /** No-op render */
  render() {
    return null;
  }
}

const TagExtensionPropTypes = {
  /** Input component to which this is trigger is associated */
  input: PropTypes.any.isRequired,
  /** Parent tag list */
  tagList: PropTypes.any.isRequired,
  /**
   * The list of key codes that will trigger a chipEnd event.
   *
   * Defaults to `[ENTER]`.
   */
  tagListSeparatorKeyCodes: PropTypes.arrayOf(PropTypes.string),
  /** Called when a new tag should be added */
  onTagEnd: PropTypes.func,
  /** Whether or not the input should add a tag on blurring */
  tagListAddOnBlur: PropTypes.bool,
};

const TagExtensionDefaultProps = {
  tagListSeparatorKeyCodes: [ENTER],
  onTagEnd: _.noop,
  tagListAddOnBlur: false,
};

TagExtension.propTypes = {
  ...TagExtensionPropTypes,
  __tagListInput: TagInputContextPropTypes,
};

TagExtension.defaultProps = {
  ...TagExtensionDefaultProps,
  __tagListInput: TagInputContextDefaultProps,
};

const StackedTagExtension = withTagInputConsumer(TagExtension);

StackedTagExtension.propTypes = TagExtensionPropTypes;
StackedTagExtension.defaultProps = TagExtensionDefaultProps;

export default StackedTagExtension;
