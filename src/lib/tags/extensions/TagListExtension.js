import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { ENTER } from '../../../cdk/keycodes/keys';
import { TagInputContextDefaultProps, TagInputContextPropTypes, withTagInputConsumer } from '../context/TagListInputContext';
import {
  ExtensionDefaultProps,
  ExtensionPropTypes,
} from '../../form-field/context/ExtensionsContext';
import { stack } from '../../core/components/util';

class TagListExtension extends React.Component {
  constructor() {
    super();

    this.DEFAULT_ID = _.uniqueId('sui-tag-input:');

    this.state = {
      /** Required for some handling logic in tag list */
      focused: false,
      /** Required for one time setup for installing input in tag list */
      setInputOnTagList: false,
    };
  }

  /**
   * Lifecycle
   */
  componentDidMount() {
    this.props.__extensionManager.updateExtensionAttributes('##tag-list', {
      disabled: this.getFinalDisabled(),
    });
  }

  componentDidUpdate() {
    /** One-time installation of context */
    if (!this.state.setInputOnTagList && this.getTagList()) {
      this.getTagList().setState({ inputExtension: this });
      this.setState({ setInputOnTagList: true });
    }
  }

  /**
   * Derived data
   */
  /** Get the input */
  getInput = () => this.props.input;

  /** Get the tag list */
  getTagList = () => _.get(this.props.__extensionManager, ['extendedData', '##tag-list', 'data', 'list']);

  /** Get the non-null ID */
  getId = () => this.getInput().getId();

  /** Whether the input is disabled */
  getFinalDisabled = () => (
    this.props.disabled
    || _.get(this.props.__extensionManager, ['extendedData', '##tag-list', 'data', 'list', 'props', 'disabled'], false)
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
      this.getTagList().keyDown(event);
    }

    if (_.isNil(event) || this.props.tagListSeparatorKeyCodes.indexOf(event.key) > -1) {
      // trigger the add tag listener
      this.props.onTagEnd({ input: this.getInput().EL, value: this.getInput().props.value });
      if (event) {
        event.preventDefault();
      }
    }
  };

  /** programmatic focus invoker */
  focus = () => {
    if (this.this.getInput().EL) {
      this.this.getInput().EL.focus();
    }
  };

  /** No-op render */
  render() {
    return null;
  }
}

const TagListExtensionPropTypes = {
  /** Input component to which this is trigger is associated */
  input: PropTypes.any.isRequired,
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

const TagListExtensionDefaultProps = {
  tagListSeparatorKeyCodes: [ENTER],
  onTagEnd: _.noop,
  tagListAddOnBlur: false,
};

TagListExtension.propTypes = {
  ...TagListExtensionPropTypes,
  __tagListInput: TagInputContextPropTypes,
  __extensionManager: ExtensionPropTypes,
};

TagListExtension.defaultProps = {
  ...TagListExtensionDefaultProps,
  __tagListInput: TagInputContextDefaultProps,
  __extensionManager: ExtensionDefaultProps,
};

const StackedTagListExtension = stack(
  withTagInputConsumer,
)(TagListExtension);

StackedTagListExtension.propTypes = TagListExtensionPropTypes;
StackedTagListExtension.defaultProps = TagListExtensionDefaultProps;

export default StackedTagListExtension;
