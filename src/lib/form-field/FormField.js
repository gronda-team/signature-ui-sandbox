import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import UIMachine from './states';
import {
  FormFieldFix,
  FormFieldFlex, FormFieldHintSpacer, FormFieldHintWrapper, FormFieldInfix, FormFieldLabel, FormFieldLabelWrapper,
  FormFieldRequiredMarker, FormFieldRoot,
  FormFieldSubscriptWrapper,
  FormFieldUnderline,
  FormFieldWrapper,
} from './styles/index';
import { Provider as FormFieldControlProvider } from './control';
import { byInternalType } from '../core/components/util';

export default class FormField extends React.Component {
  constructor() {
    super();
    
    this.setControl = key => (value) => {
      this.setState({ [key]: value });
    };
    
    this.state = {
      // these are essentially passed down as context
      ui: UIMachine.initialState.value,
      id: '',
      placeholder: '',
      containerClick: _.noop,
      setId: this.setControl('id'), // function that expects a value
      setPlaceholder: this.setControl('placeholder'),
      setContainerClick: this.setControl('containerClick'),
      transitionUi: this.transition,
      changeDescribedByIds: this.changeDescribedByIds,
      describedByIds: [],
    };
  }
  
  // Transitioning the UI state only
  transition = (event) => {
    this.setState((state) => {
      const nextUiState = UIMachine.transition(state.ui, event);
      return _.isEqual(nextUiState.value, state.ui) ?
        null :
        { ui: nextUiState.value };
    });
  };
  
  /*
  Derived data
   */
  // has a label prop
  hasLabel = () => !!this.props.label;
  // has a placeholder prop
  hasPlaceholder = () => !!this.state.placeholder;
  // has a label or placeholder (if in underline)
  hasFloatingLabel = () => this.hasLabel() || this.props.appearance === 'underline' && this.hasPlaceholder();
  // hiding the required marker
  hideRequiredMarker = () => this.props.hideRequiredMarker;
  // hide the placeholder
  hidePlaceholder = () => (
    (this.props.appearance === 'legacy' && !this.hasLabel()) ||
    (this.hasLabel() && _.stubFalse)
  );
  // is required, disabled, etc.
  isFocused = () => _.get(this.state.ui, 'field.enabled') === 'focused';
  isFilled = () => _.get(this.state.ui, 'value') === 'filled';
  isDisabled = () => _.get(this.state.ui, 'field') === 'disabled';
  isRequired = () => _.get(this.state.ui, 'required-status') === 'required';
  // messages
  getDisplayedMessages = () => this.props.errorState ? 'error' : 'hint';
  // children
  getFlatChildren = () => {
    return React.Children.toArray(this.props.children)
      .filter(_.negate(byInternalType('Hint')));
  };
  
  /*
  Refs
   */
  getFlexRef = (flex) => {
    this.FLEX_REF = flex;
  };
  
  getHintWrapperRef = (hint) => {
    this.HINT_WRAPPER_REF = hint;
  };
  
  /*
  Handling actions
   */
  onFocusCapture = () => {
    this.transition('FOCUS');
  };
  
  onBlurCapture = () => {
    if (!_.isUndefined(window)) {
      window.setTimeout(() => {
        /*
        We have to wait until the NEW focus event is complete. If there are
        multiple focusable elements in the form field, we don't want to transition
        back to FOCUS again if we blur temporarily. We do that by querying if the
        current active element is still located in the form field. If it is,
        then we don't bother with blurring.
         */
        if (!this.FLEX_REF.contains(document.activeElement)) {
          this.transition('BLUR');
        }
      });
    }
  };
  
  changeDescribedByIds = ({ added = null, removed = null }) => {
    this.setState((state) => {
      let ids = state.describedByIds;
      if (removed) {
        ids = _.without(ids, removed);
      }
      if (added) {
        ids = _.concat(ids, added);
      }
      return { describedByIds: ids };
    });
  };
  
  /*
  Rendering
   */
  // rendering the part below the field
  renderSubscript = () => {
    const children = React.Children.toArray(this.props.children);
    const messageType = this.getDisplayedMessages();
    if (messageType === 'error') {
      // only return the first error
      return children.find(child => _.get(child.props, '__sui-internal-type') === 'Error');
    }
    
    if (messageType === 'hint') {
      // we may have hints (more than one) with align={start} or align={end}
      const hints = children.filter(child => _.get(child.props, '__sui-internal-type') === 'Hint');
      return (
        <FormFieldHintWrapper ref={this.getHintWrapperRef}>
          { hints.find(child => _.get(child.props, 'align') === 'start') }
          <FormFieldHintSpacer />
          { hints.find(child => _.get(child.props, 'align') === 'end') }
        </FormFieldHintWrapper>
      )
    }
    
    return null;
  };
  
  // rendering the label
  /*
    This is separately rendered because the transform/positioning of the label is different
    depending on a prefix icon---if it were placed as a child of Infix, then it would only float
    above the infix, which would look strange in an outline + prefix combo.
  */
  renderLabel = () => (
    this.hasFloatingLabel() ? (
      <FormFieldLabelWrapper>
        <FormFieldLabel
          id={`${this.state.id}--label`}
          htmlFor={this.state.id}
          aria-owns={this.state.id}
        >
          { !this.hasLabel() ? this.state.placeholder : this.props.label }
          { !this.hideRequiredMarker() && this.isRequired() && !this.isDisabled() ? (
            <FormFieldRequiredMarker>&nbsp;*</FormFieldRequiredMarker>
          ) : null }
        </FormFieldLabel>
      </FormFieldLabelWrapper>
    ) : null
  );
  
  render() {
    return (
      <FormFieldRoot
        {...this.props}
        data-appearance={this.props.appearance}
        data-disabled={this.isDisabled().toString()}
        data-noop-placeholder={this.hidePlaceholder().toString()}
        data-focus={this.isFocused() ? 'focused' : 'idle'}
        data-value={this.isFilled() ? 'filled' : 'empty'}
      >
        { this.props.appearance === 'outline' ?
          // render the label as a child of FormFieldFlex for properly aligning label
          this.renderLabel() :
          null
        }
        <FormFieldWrapper
          onFocusCapture={this.onFocusCapture}
          onBlurCapture={this.onBlurCapture}
        >
          <FormFieldControlProvider value={this.state}>
            <FormFieldFlex
              onClick={this.state.containerClick}
              innerRef={this.getFlexRef}
            >
              { this.props.prefix ? <FormFieldFix>{ this.props.prefix }</FormFieldFix> : null }
              <FormFieldInfix>
                { // don't pass through the hints, otherwise it'll show up twice
                  this.getFlatChildren()
                }
                { this.props.appearance !== 'outline' ? this.renderLabel() : null }
              </FormFieldInfix>
              { this.props.suffix ? <FormFieldFix>{ this.props.suffix }</FormFieldFix> : null }
            </FormFieldFlex>
            { this.props.appearance !== 'outline' ? (
              // underline used for non-outline appearances
              <FormFieldUnderline />
            ) : null }
            <FormFieldSubscriptWrapper>
              { this.renderSubscript() }
            </FormFieldSubscriptWrapper>
          </FormFieldControlProvider>
        </FormFieldWrapper>
      </FormFieldRoot>
    );
  }
}

FormField.propTypes = {
  appearance: PropTypes.oneOf(['outline', 'fill', 'underline']),
  color: PropTypes.oneOf(['primary', 'accent', 'warn', 'light', 'dark']),
  label: PropTypes.node,
};

FormField.defaultProps = {
  // query the type so it can be filtered by Children.toArray().filter()
  '__sui-internal-type': 'Form-Field',
  appearance: 'outline',
  color: 'accent',
  label: null,
};
