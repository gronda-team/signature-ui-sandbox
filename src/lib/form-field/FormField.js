import * as React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { interpret } from 'xstate';
import UIMachine from './UIMachine';
import {
  FormFieldPrefix, FormFieldSuffix,
  FormFieldFlex, FormFieldHintSpacer, FormFieldHintWrapper, FormFieldInfix, FormFieldLabel, FormFieldLabelWrapper,
  FormFieldRequiredMarker, FormFieldRoot,
  FormFieldSubscriptWrapper,
  FormFieldWrapper,
} from './styles/index';
import { FormFieldControlProvider } from './context/FormFieldContext';
import { byInternalType } from '../core/components/util';
import {FormFieldBar} from './styles';

const toArray = React.Children.toArray;

export default class FormField extends React.Component {
  constructor() {
    super();

    this.setControl = key => (value) => {
      this.setState({ [key]: value });
    };

    this.service = interpret(UIMachine).onTransition((current) => {
      this.setState({ ui: current });
    });

    this.state = {
      // these are essentially passed down as context
      ui: UIMachine.initialState,
      id: '',
      /** The control type, i.e., select, input, textarea, etc. */
      type: null,
      /** Different kinds of extensions that the form field requires */
      extensions: {},
      /** Control attributes */
      controlAttrs: {},
      /** The root element */
      el: null,
      placeholder: '',
      containerClick: _.noop,
      setId: this.setControl('id'), // function that expects a value
      setPlaceholder: this.setControl('placeholder'),
      setContainerClick: this.setControl('containerClick'),
      setControlType: this.setControl('type'),
      setExtension: this.setExtensions,
      setControlAttrs: this.setControlAttrs,
      getConnectionContainer: this.getConnectionContainer,
      transitionUi: this.service.send,
      changeDescribedByIds: this.changeDescribedByIds,
      describedByIds: [],
    };

    this.connectionContainer = React.createRef();

    /** Start service before mounting */
    this.service.start();
  }

  /**
   * Lifecycle
   */
  componentWillUnmount() {
    this.service.stop();
  }

  /**
   * Refs
   */
  getRoot = (el) => {
    this.setState({ el });
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

  /** The connection container to bind the autocomplete component */
  getConnectionContainer = () => this.connectionContainer.current;

  /** Has label children  */
  hasLabel = () => !_.isNil(this.getLabel());

  /** Has placeholder in FormFieldControl */
  hasPlaceholder = () => !!this.state.placeholder;

  /** hiding the required marker */
  hideRequiredMarker = () => this.props.hideRequiredMarker;

  /** is required, disabled, etc. */
  isFocused = () => this.state.ui.matches('field.enabled.focused');
  isFilled = () => this.state.ui.matches('value.filled');
  isDisabled = () => this.state.ui.matches('field.disabled');
  isRequired = () => this.state.ui.matches('required-status.required');
  isAutofilled = () => this.state.ui.matches('autofilled-status.filled');

  /** messages */
  getDisplayedMessages = () => this.props.errorState ? 'error' : 'hint';

  /**
   * Actions
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

  setExtensions = (key, value) => {
    this.setState(state => ({
      extensions: {
        ...state.extensions,
        [key]: value,
      },
    }));
  };

  /**
   * Set the attributes that are consumable by the control in the form field.
   * In this case, this could be an Input that must update according to changes
   * in its sibling extensions.
   */
  setControlAttrs = (attrs) => {
    this.setState(state => ({
      controlAttrs: {
        ...state.controlAttrs,
        ...attrs,
      },
    }));
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
        data-autofilled={this.isAutofilled()}
        data-disabled={this.isDisabled().toString()}
        data-focused={this.isFocused()}
        data-value={this.isFilled() ? 'filled' : 'empty'}
        data-field-type={this.state.type}
        innerRef={this.getRoot}
      >
        <FormFieldWrapper>
          <FormFieldControlProvider value={this.state}>
            <FormFieldFlex
              onClick={this.state.containerClick}
              innerRef={this.connectionContainer}
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
