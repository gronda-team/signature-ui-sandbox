import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { FormFieldDefaultProps, FormFieldPropTypes, withFormFieldConsumer } from '../form-field/control';
import { withPlatformConsumer, PlatformDefaultProps, PlatformPropTypes } from '../../cdk/platform';
import { BaseInput, BaseTextArea } from './styles/index';
import { INVALID_INPUT_TYPES } from './constants';
import { PROP_TYPE_STRING_OR_NUMBER } from '../../cdk/util/prop-types';
import { stack } from '../core/components/util';

/*
Higher order component.

The input and text area components are identical, with a caveat.
 */
const buildInputType = (tag = 'input') => {
  const InputLikeRoot = tag === 'input' ?
    BaseInput : BaseTextArea;
  class InputLike extends React.Component {
    constructor(props) {
      super(props);
      
      this.DEFAULT_ID = _.uniqueId('sui-input:');
    }
    
    /*
    Lifecycle
     */
    componentDidMount() {
      // set the state machine, context, etc.
      this.updateDisabled(this.props.disabled);
      this.updateId();
      this.updatePlaceholder();
      this.updateRequired(this.props.required);
      this.updateValue();
      // set the onContainerClick
      this.props.__formFieldControl.setContainerClick(this.focus);
      // handle the iOS bug
      handleIOSQuirk.call(this);
    }
    
    componentDidUpdate(prevProps) {
      if (_.isEmpty(prevProps.value) !== _.isEmpty(this.props.value)) {
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
    
    /*
    Derived data
     */
    getInputRef = (input) => {
      this.INPUT = input;
    };
    
    getId = (props = this.props) => props.id || this.DEFAULT_ID;
    
    getAriaDescribedBy = () => this.props.__formFieldControl.describedByIds.join(' ');
  
    /*
    Actions
     */
    updateDisabled = (isDisabled) => {
      // transition it in the <FormField /> component
      this.props.__formFieldControl.transitionUi(isDisabled ? 'DISABLE' : 'ENABLE');
    };
  
    updateRequired = (isRequired) => {
      // transition it in the <FormField /> component
      this.props.__formFieldControl.transitionUi(isRequired ? 'REQUIRE' : 'UNREQUIRE');
    };
  
    updateId = () => {
      // setting ID to either the default one or the one we get from props
      this.props.__formFieldControl.setId(this.getId());
    };
  
    updatePlaceholder = (placeholder) => {
      this.props.__formFieldControl.setPlaceholder(placeholder);
    };
  
    // update the value associated with the input field
    updateValue = () => {
      this.props.__formFieldControl.transitionUi(
        _.toString(this.props.value) === '' ?
          'CLEAR' : 'FILL'
      );
    };
  
    focus = () => {
      if (this.INPUT) {
        this.INPUT.focus();
      }
    };
    
    render() {
      const {
        id, placeholder, disabled, required, type,
        __formFieldControl, ...restProps,
      } = this.props;
      // todo: aria-invalid
      return (
        <InputLikeRoot
          {...restProps}
          type={tag === 'input' ? type : undefined}
          id={this.getId()}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          aria-describedby={this.getAriaDescribedBy()}
          aria-invalid={false}
          aria-required={required.toString()}
          innerRef={this.getInputRef}
        />
      );
    }
  }
  
  return InputLike;
};

const Input = buildInputType('input');
const TextArea = buildInputType('textarea');

const InputPropTypes = {
  id: PROP_TYPE_STRING_OR_NUMBER,
  placeholder: PROP_TYPE_STRING_OR_NUMBER,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  type: function(props, propName, componentName) {
    const type = props[propName];
    if (!type || !_.isString(type)) {
      return new Error('<' + componentName + ' /> should have a `type` prop as a string.');
    } else if (INVALID_INPUT_TYPES.indexOf(type) > -1) {
      return new Error('Invalid prop `' + propName + ' for `<' + componentName + ' />.');
    }
    return null;
  },
  value: PROP_TYPE_STRING_OR_NUMBER,
};

const InputDefaultProps = {
  id: '',
  placeholder: '',
  disabled: false,
  required: false,
  type: 'text',
  value: '',
};

Input.propTypes = {
  ...InputPropTypes,
  __formFieldControl: FormFieldPropTypes,
  __platform: PlatformPropTypes,
};

Input.defaultProps = {
  ...InputDefaultProps,
  __formFieldControl: FormFieldDefaultProps,
  __platform: PlatformDefaultProps,
};

const StackedInput = stack(
  withFormFieldConsumer,
  withPlatformConsumer,
)(Input);
StackedInput.propTypes = InputPropTypes;
StackedInput.defaultProps = InputDefaultProps;

export default StackedInput;

const StackedTextArea = stack(
  withFormFieldConsumer,
  withPlatformConsumer,
)(TextArea);

StackedTextArea.propTypes = InputPropTypes;
StackedTextArea.defaultProps = InputDefaultProps;

export { StackedTextArea as TextArea };

/**
 * Private methods
 */
// On some versions of iOS the caret gets stuck in the wrong place when holding down the delete
// key. In order to get around this we need to "jiggle" the caret loose. Since this bug only
// exists on iOS, we only bother to install the listener on iOS.
function handleIOSQuirk() {
  if (this.props.__platform.is('ios') && this.INPUT) {
    this.INPUT.addEventListener('keyup', (event) => {
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
