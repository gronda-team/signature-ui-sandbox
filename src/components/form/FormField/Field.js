import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import has from 'lodash/has';
import head from 'lodash/head';
import isNil from 'lodash/isNil';
import isEqual from 'lodash/isEqual';
import {
  FormFieldContent, FormFieldFix, FormFieldHintSpacer, FormFieldSubWrapper, FormFieldOutline,
  FormFieldWrapper, FormFieldHintWrapper, FormFieldFlex,
} from './styles';
import UIMachine from './states'
import { onFocus, onBlur } from '../controls/focus';
import onRequire from '../controls/required'
import { handleDisabled } from '../controls/disabled'
import Label from './Label';
import { FormFieldProvider } from '../context/form-field';

class Field extends React.Component {
  constructor() {
    super();
    
    this.FORM_FIELD = React.createRef();
    this.FORM_FIELD_OUTLINE = React.createRef();
  
    this.handleFocus = onFocus.bind(this);
    this.handleBlur = onBlur.bind(this);
    this.handleRequired = onRequire.bind(this);
    this.handleDisabled = handleDisabled.bind(this);
    
    this.state = {
      ...UIMachine.initialState.value,
      // Using React context, this is how we can broadcast change handlers in the <Input /> and other components
      __handleFocus: this.handleFocus,
      __handleRequired: this.handleRequired,
      requiredRefs: [],
    };
  }
  
  componentDidMount() {
    this.handleRequired();
    this.handleDisabled(this.props.disabled);
  }
  
  transition(event) {
    this.setState((state) => {
      const nextUiState = UIMachine.transition({ ui: state.ui, 'required-status': state['required-status'] }, event);
      return isEqual(nextUiState.value, { ui: state.ui, 'required-status': state['required-status'] }) ?
        null :
        { ...nextUiState.value };
    });
  }
  
  renderHint = (type = 'hint') => {
    const hintsAsChildren = React.Children.toArray(type === 'hint' ? this.props.hint : this.props.error);
    // go down one depth in case it's locked up
    const hints = hintsAsChildren.find(child => has(child, 'props.align')) ?
      hintsAsChildren :
      React.Children.toArray(head(React.Children.toArray(hintsAsChildren)).props.children);
    
    return (
      <FormFieldHintWrapper>
        { hints.find(child => child.props.align === 'start') }
        <FormFieldHintSpacer />
        { hints.find(child => child.props.align === 'end') }
      </FormFieldHintWrapper>
    )
  };
  
  renderMessages = () => {
    if (!(this.props.error || this.props.hint)) return null;
    if (get(this.state, 'ui.enabled') === 'error') {
      return !isNil(this.props.error) ? this.renderHint('error') : null;
    }
    
    return !isNil(this.props.hint) ? this.renderHint('hint') : null;
  };
  
  render() {
    return (
      <FormFieldWrapper innerRef={this.FORM_FIELD}>
        <FormFieldProvider value={this.state}>
          { isNil(this.props.label) ? null : (
            <Label
              data-state={get(this.state, 'ui.enabled.normal')}
              required={get(this.state, 'required-status') === 'required'}
            >
              { this.props.label }
            </Label>
          ) }
          <FormFieldOutline
            data-sui-role="field"
            data-state={get(this.state, 'ui.enabled.normal')}
            aria-disabled={get(this.state, 'ui') === 'disabled'}
            aria-invalid={get(this.state, 'ui.enabled') === 'error' ? 'true' : 'false'}
            innerRef={this.FORM_FIELD_OUTLINE}
            onFocusCapture={this.handleFocus}
            onBlurCapture={this.handleBlur}
          >
            <FormFieldFlex>
              { isNil(this.props.prefix) ? null : (
                <FormFieldFix>
                  { this.props.prefix }
                </FormFieldFix>
              ) }
              <FormFieldContent>
                { this.props.children }
              </FormFieldContent>
              { isNil(this.props.suffix) ? null : (
                <FormFieldFix>
                  { this.props.suffix }
                </FormFieldFix>
              ) }
            </FormFieldFlex>
          </FormFieldOutline>
          <FormFieldSubWrapper>
            { this.renderMessages() }
          </FormFieldSubWrapper>
        </FormFieldProvider>
      </FormFieldWrapper>
    )
  }
}

Field.propTypes = {
  label: PropTypes.node,
  prefix: PropTypes.node,
  suffix: PropTypes.node,
  error: PropTypes.node,
  hint: PropTypes.node,
};

Field.defaultProps = {
  label: null,
  prefix: null,
  suffix: null,
  error: null,
  hint: null,
};

export default Field;
