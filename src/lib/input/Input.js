import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { FormFieldDefaultProps, FormFieldPropTypes, withFormFieldConsumer } from '../form-field';
import { withPlatformConsumer, PlatformDefaultProps, PlatformPropTypes } from '../../cdk/platform';
import { BaseInput, BaseTextArea } from './styles/index';
import { INVALID_INPUT_TYPES } from './constants';
import { PROP_TYPE_STRING_OR_NUMBER } from '../../cdk/util/props';
import { stack } from '../core/components/util';
import {AutofillMonitorDefaultProps, AutofillMonitorPropTypes, withAutofillMonitor, TextAreaAutosize } from '../../cdk/text-area';
import AutocompleteTrigger from './extensions/Autocomplete';
import TagBehavior from './extensions/TagBehavior';

/**
 * The input and text area components contain very similar behavior
 * but are marked by a handful of differences depending on the end
 * consumer.
 */
class Input extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      focused: false,
      mounted: false,
    };

    // Determine the type to show. this is NOT reactive
    this.INPUT_TYPE = _.toLower(props.as) === 'input' ?
      BaseInput :
      BaseTextArea;

    this.DEFAULT_ID = _.uniqueId('sui-input:');

    // Get the extension refs
    this.autocomplete = React.createRef();
    this.tagList = React.createRef();
  }

  /**
   * Lifecycle
   */
  componentDidMount() {
    // set the state machine, context, etc.
    this.updateDisabled(this.props.disabled);
    this.updateId();
    this.updatePlaceholder();
    this.updateRequired(this.props.required);
    this.updateValue();

    // set the onContainerClick
    this.props.__formFieldControl.setContainerClick(this.onContainerClick);
    this.props.__formFieldControl.setControlType(this.props.as);

    // handle the iOS bug
    handleIOSQuirk.call(this);
  }

  componentDidUpdate(prevProps) {
    if (!!prevProps.value !== !!this.props.value) {
      // Update whether or not we have a value inside
      this.updateValue();
    }

    if (prevProps.disabled !== this.props.disabled) {
      // update disabled value
      this.updateDisabled(this.props.disabled);
    }

    if (this.getId(prevProps) !== this.getId()) {
      this.updateId();
    }

    if (prevProps.placeholder !== this.props.placeholder) {
      this.updatePlaceholder(this.props.placeholder);
    }

    if (prevProps.required !== this.props.required) {
      this.updateRequired(this.props.required);
    }
  }

  componentWillUnmount() {
    this.props.__autofillMonitor.stopMonitoring(this.DEFAULT_ID);
  }

  /**
   * Derived data
   */
  /** Get the root input element */
  getInputRef = (input) => {
    this.EL = input;
    this.setState({ mounted: !!input });
    if (this.EL) {
      // Set the autofill status for the global autofill monitor
      this.props.__autofillMonitor.monitor({
        id: this.DEFAULT_ID,
        element: input,
        callback: (event) => {
          // Set the autofill control in the form field control
          this.props.__formFieldControl.transitionUi(
            event.isAutofilled ?
              'AUTOFILL' :
              'REMOVE_AUTOFILL',
          );
        },
      });
    }
  };

  /** Get the appropriate id for the input. Defaults to DEFAULT_ID */
  getId = (props = this.props) => props.id || this.DEFAULT_ID;

  /** Get the describedByIds from the FormFieldControl's hints */
  getAriaDescribedBy = () => this.props.__formFieldControl.describedByIds.join(' ');

  /** Check whether or not the autofilled monitor is true */
  isAutofilled = () => _.get(this.props.__formFieldControl, ['ui', 'autofilled-status']) === 'filled';

  /**
   * Check whether or not the input is empty
   * Used in the extension for tag lists
   */
  isEmpty = () => _.get(this.props.__formFieldControl, ['ui', 'value']) === 'empty';

  /**
   * Actions
   */
  /** Update the form field's disabled state */
  updateDisabled = (isDisabled) => {
    // transition it in the <FormField /> component
    this.props.__formFieldControl.transitionUi(isDisabled ? 'DISABLE' : 'ENABLE');
  };

  /** Update the form field's required state */
  updateRequired = (isRequired) => {
    // transition it in the <FormField /> component
    this.props.__formFieldControl.transitionUi(isRequired ? 'REQUIRE' : 'UNREQUIRE');
  };

  /** Update the form field's ID (for the label) */
  updateId = () => {
    // setting ID to either the default one or the one we get from props
    this.props.__formFieldControl.setId(this.getId());
  };

  /** Update the form field's default placeholder if no label available */
  updatePlaceholder = (placeholder) => {
    this.props.__formFieldControl.setPlaceholder(placeholder);
  };

  /** update the value associated with the input field */
  updateValue = () => {
    this.props.__formFieldControl.transitionUi(
      _.toString(this.props.value) === '' ?
        'CLEAR' : 'FILL'
    );
  };

  /** Handle onChange with extensions */
  onChange = (event) => {
    if (this.autocomplete.current) {
      this.autocomplete.current.handleInput(event);
    }

    _.invoke(this.props, 'onChange', event);
  };

  /** Handle keydown events for extensions */
  onKeyDown = (event) => {
    if (this.autocomplete.current) {
      this.autocomplete.current.handleKeyDown(event);
    }

    if (this.tagList.current) {
      this.tagList.current.onKeyDown(event);
    }

    _.invoke(this.props, 'onKeyDown', event);
  };

  /** Handle the container click for the form field */
  onContainerClick = () => {
    // Do not re-focus the input element if the element is already focused. Otherwise it can happen
    // that someone clicks on a time input and the cursor resets to the "hours" field while the
    // "minutes" field was actually clicked
    if (!this.state.focused) {
      this.focus();
    }
  };

  /** Progammatically focus the input component */
  focus = () => {
    if (this.EL) {
      this.EL.focus();
    }
  };

  /** Handle the UI focus change for the form field */
  handleFocusChange = isFocused => () => {
    if (this.EL && !this.props.readOnly && isFocused !== this.state.focused) {
      this.setState({ focused: isFocused });
      this.props.__formFieldControl.transitionUi(
        isFocused ? 'FOCUS' : 'BLUR',
      );
    }

    // Handle extensions
    if (isFocused) {
      // Focus
      if (this.autocomplete.current) {
        this.autocomplete.current.handleFocus();
      }

      if (this.tagList.current) {
        this.tagList.current.onFocus();
      }
    } else {
      // Blur
      if (this.autocomplete.current) {
        this.autocomplete.current.onTouched();
      }

      if (this.tagList.current) {
        this.tagList.current.onBlur();
      }
    }
  };

  render() {
    const {
      as, id, placeholder, disabled, required, type,
      autocomplete, autocompleteDisabled, // autocomplete props
      tagListSeparatorKeyCodes, onTagEnd, tagListAddOnBlur, // tag list props
      autosizeMinRows, autosizeMaxRows, autosizeEnabled,
      extensions, readOnly, __formFieldControl, ...restProps
    } = this.props;
    // todo: aria-invalid

    const hasAutosize = as === 'textarea' && extensions.indexOf('autosize') > -1;

    const autocompleteAttributes = this.autocomplete.current ?
      this.autocomplete.current.getExtendedAttributes() :
      {};

    const tagListAttributes = this.tagList.current ?
      this.tagList.current.getExtendedAttributes() :
      {};

    const controlAttrs = _.get(__formFieldControl, 'controlAttrs', {});

    return (
      <React.Fragment>
        { hasAutosize ? (
          <TextAreaAutosize
            input={this.EL}
            minRows={autosizeMinRows}
            maxRows={autosizeMaxRows}
            enabled={_.isUndefined(autosizeEnabled) ? true : autosizeEnabled}
          />
        ) : null }
        { extensions.indexOf('autocomplete') > -1 ? (
          <AutocompleteTrigger
            input={this}
            autocomplete={
              _.get(this.props.__formFieldControl, 'extensions.autocomplete')
            }
            autocompleteAttribute={autocomplete}
            autocompleteDisabled={autocompleteDisabled}
            ref={this.autocomplete}
          />
        ) : null }
        { extensions.indexOf('tag-list') > -1 ? (
          <TagBehavior
            input={this}
            tagListSeparatorKeyCodes={tagListSeparatorKeyCodes}
            onTagEnd={onTagEnd}
            tagListAddOnBlur={tagListAddOnBlur}
            tagList={
              _.get(this.props.__formFieldControl, 'extensions.tagList')
            }
            ref={this.tagList}
          />
        ) : null }
        {
          /**
           * The attributes that are before the {...} spread attributes
           * are those that may be replaced by extension attributes.
           * E.g., tag list may add a disabled: true attribute when
           * the <TagBehavior> component is disabled.
           */
        }
        <this.INPUT_TYPE
          disabled={disabled}
          {...restProps}
          {...autocompleteAttributes}
          {...tagListAttributes}
          {...controlAttrs}
          type={as === 'input' ? type : undefined}
          id={this.getId()}
          placeholder={placeholder}
          readOnly={readOnly}
          required={required}
          aria-describedby={this.getAriaDescribedBy()}
          aria-invalid={false}
          aria-required={required.toString()}
          data-autosize={as === 'textarea' && extensions.indexOf('autosize') > -1}
          data-autofilled={this.isAutofilled()}
          {...(hasAutosize ? { rows: 1 } : {})}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          onFocus={this.handleFocusChange(true)}
          onBlur={this.handleFocusChange(false)}
          innerRef={this.getInputRef}
        />
      </React.Fragment>
    );
  }
}

const InputPropTypes = {
  /** The id associated with the input field */
  id: PROP_TYPE_STRING_OR_NUMBER,
  /** The DOM node type, either a textarea or an input */
  as: PropTypes.oneOf(['textarea', 'input']),
  /** Placeholder -- required for FormFieldControl */
  placeholder: PROP_TYPE_STRING_OR_NUMBER,
  /** Whether or not the field is disabled -- FormFieldControl */
  disabled: PropTypes.bool,
  /** Whether the field is disabled -- FormFieldControl */
  required: PropTypes.bool,
  /** Whether the input is read-only */
  readOnly: PropTypes.bool,
  /** Associated only with as="input" fields */
  type: function(props, propName, componentName) {
    // Don't bother if it's a textarea
    if (_.toLower(props.as) === 'textarea') return null;

    const type = props[propName];
    if (!type || !_.isString(type)) {
      return new Error('<' + componentName + ' /> should have a `type` prop as a string.');
    } else if (INVALID_INPUT_TYPES.indexOf(type) > -1) {
      return new Error('Invalid prop `' + propName + ' for `<' + componentName + ' />.');
    }

    return null;
  },
  /** The value */
  value: PROP_TYPE_STRING_OR_NUMBER,
  /** Extensions like if it's an autocomplete or part of a tag list */
  extensions: PropTypes.arrayOf(PropTypes.oneOf([
    'autocomplete', 'tag-list', 'autosize',
  ])),
};

const InputDefaultProps = {
  id: '',
  as: 'input',
  placeholder: '',
  disabled: false,
  required: false,
  readOnly: false,
  type: 'text',
  /** Undefined in case they want to have it uncontrolled */
  value: undefined,
  /** List of default extensions to add behavior. Defaults to nothing */
  extensions: [],
};

Input.propTypes = {
  ...InputPropTypes,
  __autofillMonitor: AutofillMonitorPropTypes,
  __formFieldControl: FormFieldPropTypes,
  __platform: PlatformPropTypes,
};

Input.defaultProps = {
  ...InputDefaultProps,
  __autofillMonitor: AutofillMonitorDefaultProps,
  __formFieldControl: FormFieldDefaultProps,
  __platform: PlatformDefaultProps,
};

const StackedInput = stack(
  withAutofillMonitor,
  withFormFieldConsumer,
  withPlatformConsumer,
)(Input);
StackedInput.propTypes = InputPropTypes;
StackedInput.defaultProps = InputDefaultProps;

export default StackedInput;

/**
 * Private methods
 */
// On some versions of iOS the caret gets stuck in the wrong place when holding down the delete
// key. In order to get around this we need to "jiggle" the caret loose. Since this bug only
// exists on iOS, we only bother to install the listener on iOS.
function handleIOSQuirk() {
  if (this.props.__platform.is('ios') && this.EL) {
    this.EL.addEventListener('keyup', (event) => {
      const el = event.target;
      if (!el.value && !el.selectionStart && !el.selectionEnd) {
        // Note: Just setting `0, 0` doesn't fix the issue. Setting
        // `1, 1` fixes it for the first time that you type text and
        // then hold delete. Toggling to `1, 1` and then back to
        // `0, 0` seems to completely fix it.
        el.setSelectionRange(1, 1);
        el.setSelectionRange(0, 0);
      }
    });
  }
}
