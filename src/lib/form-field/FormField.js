import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import UIMachine from './UIMachine';
import {
  FormFieldPrefix, FormFieldSuffix,
  FormFieldFlex, FormFieldHintSpacer, FormFieldHintWrapper, FormFieldInfix, FormFieldLabel, FormFieldLabelWrapper,
  FormFieldRequiredMarker, FormFieldRoot,
  FormFieldSubscriptWrapper,
  FormFieldWrapper,
} from './styles/index';
import { Provider as FormFieldControlProvider } from './context/UIMachineContext';
import { byInternalType } from '../core/components/util';
import {FormFieldBar} from './styles';

const toArray = React.Children.toArray;

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

  /**
   * Refs
   */
  /** The connection container to bind the autocomplete component */
  getConnectionContainer = (flex) => {
    this.CONNECTION_CONTAINER = flex;
  };

  /**
   * Derived data
   */
  /** Get the non-label, non-hint children */
  getFlatChildren = () => toArray(this.props.children)
    .filter(_.negate(byInternalType(
      'Hint', 'Label', 'Error', 'Prefix', 'Suffix',
    )));

  /** Filter children by */
  getFilteredChildrenBy = (...types) => () => toArray(this.props.children)
    .filter(byInternalType(...types));

  /** Get the <Hint /> children */
  getHints = this.getFilteredChildrenBy('Hint');

  /** Get the <Error /> children */
  getErrors = this.getFilteredChildrenBy('Error');

  /** Get the <*Fix /> children */
  getPrefix = this.getFilteredChildrenBy('Prefix');
  getSuffix = this.getFilteredChildrenBy('Suffix');

  /** Get the <Label /> child (only want one) */
  getLabel = () => _.head(toArray(this.props.children)
    .filter(byInternalType('Label')));

  /** Has label children  */
  hasLabel = () => !_.isNil(this.getLabel());

  /** Has placeholder in FormFieldControl */
  hasPlaceholder = () => !!this.state.placeholder;

  /** hiding the required marker */
  hideRequiredMarker = () => this.props.hideRequiredMarker;

  /** is required, disabled, etc. */
  isFocused = () => _.get(this.state.ui, 'field.enabled') === 'focused';
  isFilled = () => _.get(this.state.ui, 'value') === 'filled';
  isDisabled = () => _.get(this.state.ui, 'field') === 'disabled';
  isRequired = () => _.get(this.state.ui, 'required-status') === 'required';

  /** messages */
  getDisplayedMessages = () => this.props.errorState ? 'error' : 'hint';
  
  /*
  Actions
   */
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

  /**
   * Renderers
   */
  /*
  Rendering the label

  This is separately rendered because the transform/positioning of the label is different
  depending on a prefix icon---if it were placed as a child of Infix, then it would only float
  above the infix, which would look strange in an outline + prefix combo.
  */
  renderLabel = () => (
    <FormFieldLabelWrapper>
      <FormFieldLabel
        id={`${this.state.id}--label`}
        htmlFor={this.state.id}
        aria-owns={this.state.id}
      >
        { this.hasLabel() ? this.getLabel() : this.state.placeholder }
        { !this.hideRequiredMarker() && this.isRequired() && !this.isDisabled() ? (
          <FormFieldRequiredMarker>&nbsp;*</FormFieldRequiredMarker>
        ) : null }
      </FormFieldLabel>
    </FormFieldLabelWrapper>
  );
  /** The hints/errors underneath the main outline */
  renderSubscript = () => {
    const messageType = this.getDisplayedMessages();
    if (messageType === 'error') {
      // only return the first error
      return this.getErrors();
    }
    
    if (messageType === 'hint') {
      // we may have hints (more than one) with align={start} or align={end}
      const hints = this.getHints();
      return (
        <FormFieldHintWrapper>
          { hints.find(child => _.get(child.props, 'align') === 'start') }
          <FormFieldHintSpacer />
          { hints.find(child => _.get(child.props, 'align') === 'end') }
        </FormFieldHintWrapper>
      )
    }
    
    return null;
  };
  
  render() {
    const prefix = this.getPrefix();
    const suffix = this.getSuffix();
    return (
      <FormFieldRoot
        {...this.props}
        data-invalid={false}
        data-appearance={this.props.appearance}
        data-disabled={this.isDisabled().toString()}
        data-focused={this.isFocused()}
        data-value={this.isFilled() ? 'filled' : 'empty'}
      >
        <FormFieldWrapper>
          <FormFieldControlProvider value={this.state}>
            <FormFieldFlex
              onClick={this.state.containerClick}
              innerRef={this.getConnectionContainer}
            >
              <FormFieldBar>
                { prefix ? <FormFieldPrefix>{ prefix }</FormFieldPrefix> : null }
                <FormFieldInfix>
                  { // don't pass through the hints, otherwise it'll show up twice
                    this.getFlatChildren()
                  }
                  { this.props.appearance !== 'outline' ? this.renderLabel() : null }
                </FormFieldInfix>
                { suffix ? <FormFieldSuffix>{ suffix }</FormFieldSuffix> : null }
              </FormFieldBar>
              { this.props.appearance === 'outline' ?
                // render the label as a child of FormFieldFlex for properly aligning label
                this.renderLabel() :
                null
              }
            </FormFieldFlex>
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
  /** The appearance */
  appearance: PropTypes.oneOf(['outline', 'fill']),
  /** Whether the required marker (*) should be shown */
  hideRequiredMarker: PropTypes.bool,
};

FormField.defaultProps = {
  /**
   * Use a default internal prop here to allow other members to
   * query by this type via:
   * Children.toArray(this.props.children)
   *   .filter(child => child.props['__sui-internal-type'] === 'FormField')
   */
  '__sui-internal-type': 'FormField',
  appearance: 'outline',
  hideRequiredMarker: false,
};
