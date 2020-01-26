import React from 'react';
import PropTypes from 'prop-types';
import noop from 'lodash/noop';
import {
  FormFieldFlex, FormFieldFullOutline, FormFieldHintAnchor, FormFieldHintSpacer, FormFieldHintWrapper,
  FormFieldInfix, FormFieldLabel, FormFieldLabelWrapper,
  FormFieldPrefix, FormFieldRequiredMarker,
  FormFieldRoot, FormFieldSubscriptWrapper,
  FormFieldSuffix, FormFieldUnderline,
  FormFieldWrapper,
} from './styles';
import { FormFieldActionContext, FormFieldStateContext, reducer, initialState, FormFieldActions } from './context';
import Label from './Label';

let nextUniqueId = 0;

function FormField(props) {
  const {
    prefix, suffix, children, label, appearance, id, hideRequiredMarker, color, ...restProps
  } = props;

  const finalId = React.useMemo(() => id || `sui-form-field:${nextUniqueId++}`, [id]);

  // Refs
  const inputContainer = React.useRef(null);

  const [control, dispatch] = React.useReducer(reducer, initialState);

  const attachSubscriptContainer = React.useCallback((element) => {
    if (element) {
      dispatch({ type: FormFieldActions.SET_SUBSCRIPT_CONTAINER, data: element });
    }
  }, []);

  const attachLabelContainer = React.useCallback((element) => {
    if (element) {
      dispatch({ type: FormFieldActions.SET_LABEL_CONTAINER, data: element });
    }
  }, []);

  const attachElement = React.useCallback((element) => {
    if (element) {
      dispatch({ type: FormFieldActions.SET_ELEMENT, data: element });
    }
  }, []);

  const attachContainer = React.useCallback((element) => {
    if (element) {
      dispatch({ type: FormFieldActions.SET_CONNECTION_CONTAINER, data: element });
    }
  }, []);

  return (
    <FormFieldActionContext.Provider value={dispatch}>
      <FormFieldStateContext.Provider value={control}>
        <FormFieldRoot
          {...restProps}
          id={finalId}
          ref={attachElement}
          data-color={color}
          data-appearance={appearance}
          data-focused={control.focused}
          data-disabled={control.disabled}
          // We hide the placeholder if we're using the placeholder alias instead as a label
          data-hide-placeholder={!control.userProvidedLabel}
          data-sui="form-field"
          data-sui-tree="form-field:root"
        >
          <FormFieldWrapper data-sui-tree="form-field:wrapper">
            <FormFieldFlex
              ref={attachContainer}
              onClick={control.onContainerClick || noop}
              data-sui-tree="form-field:flex"
            >
              { appearance === 'stroked' ? (
                <FormFieldFullOutline data-sui-tree="form-field:outline" />
              ) : null }
              { prefix ? (
                <FormFieldPrefix data-sui-tree="form-field:prefix">{ prefix }</FormFieldPrefix>
              ) : null }
              <FormFieldInfix ref={inputContainer} data-sui-tree="form-field:infix">
                { children }
                <FormFieldLabelWrapper as="span" data-sui-tree="form-field:label-wrapper">
                  { control.userProvidedLabel || control.placeholder ? (
                    <FormFieldLabel
                      as="label"
                      htmlFor={control.id}
                      aria-owns={control.id}
                      ref={attachLabelContainer}
                      data-sui-tree="form-field:label"
                    >
                      { control.userProvidedLabel ?
                        null :
                        <Label __isUserProvidedLabel={false}>{ control.placeholder }</Label>
                      }
                      { !hideRequiredMarker && control.required && !control.disabled ? (
                        <FormFieldRequiredMarker
                          as="span"
                          aria-hidden="true"
                          data-sui-tree="form-field:required-marker"
                        >
                          {' *'}
                        </FormFieldRequiredMarker>
                      ) : null }
                    </FormFieldLabel>
                  ) : null }
                </FormFieldLabelWrapper>
              </FormFieldInfix>
              { suffix ? (
                <FormFieldSuffix data-sui-tree="form-field:suffix">{ suffix }</FormFieldSuffix>
              ) : null }
            </FormFieldFlex>
            { appearance !== 'outline' ? (
              <FormFieldUnderline data-sui-tree="form-field:underline" />
            ) : null }
            <FormFieldSubscriptWrapper
              ref={attachSubscriptContainer}
              data-sui-tree="form-field:subscript-wrapper"
            >
              <FormFieldHintWrapper data-sui-tree="form-field:hint-wrapper">
                <FormFieldHintAnchor
                  data-sui-tree="form-field:hint-anchor"
                  data-hint-anchor="start"
                />
                <FormFieldHintSpacer data-sui-tree="form-field:hint-spacer" />
                <FormFieldHintAnchor
                  data-sui-tree="form-field:hint-anchor"
                  data-hint-anchor="end"
                />
              </FormFieldHintWrapper>
            </FormFieldSubscriptWrapper>
          </FormFieldWrapper>
        </FormFieldRoot>
      </FormFieldStateContext.Provider>
    </FormFieldActionContext.Provider>
  );
}

FormField.propTypes = {
  id: PropTypes.string,
  prefix: PropTypes.node,
  suffix: PropTypes.node,
  children: PropTypes.node,
  hideRequiredMarker: PropTypes.bool,
  appearance: PropTypes.oneOf(['fill', 'underline', 'stroked']),
  color: PropTypes.string,
};

FormField.defaultProps = {
  id: null,
  prefix: null,
  suffix: null,
  children: null,
  hideRequiredMarker: false,
  appearance: 'stroked',
  color: 'primary',
};

export default FormField;
