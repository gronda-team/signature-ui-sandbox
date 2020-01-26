import React from 'react';
import PropTypes from 'prop-types';
import { InputRoot } from './styles';
import { usePlatform } from '../../cdk/Platform';
import { useFormField, FormFieldActions } from '../FormField';
import { useAutosize } from '../../cdk/TextArea';
import useAutocomplete from '../Autocomplete/useAutocomplete';

let nextUniqueId = 0;

function Input(props) {
  const {
    id, placeholder, required, type, disabled, readOnly, as, style: __style, ...restProps
  } = props;

  const is = usePlatform();

  const [formField, dispatch] = useFormField();

  /**
   * HTML element
   * @type {React.MutableRefObject<null | HTMLElement>}
   */
  const element = React.useRef(null);
  const attachInput = React.useCallback((el) => {
    if (el) {
      element.current = el;
      dispatch({
        type: FormFieldActions.SET_CONTROL,
        data: el,
      });
    }
  }, []);

  const finalId = React.useMemo(() => id || `sui-input:${nextUniqueId++}`, [id]);

  const {
    onFocus: autocompleteOnFocus,
    onKeyDown: autocompleteOnKeyDown,
    onChange: autocompleteOnChange,
    onBlur: autocompleteOnBlur,
    ...restAutocomplete
  } = useAutocomplete(formField.control, props);

  // On some versions of iOS the caret gets stuck in the wrong place when holding down the delete
  // key. In order to get around this we need to "jiggle" the caret loose. Since this bug only
  // exists on iOS, we only bother to install the listener on iOS.
  const onKeyUp = React.useCallback(
    /**
     * @param event {Event}
     */
    (event) => {
      if (is('ios')) {
        const el = event.target;
        if (!el.value && !el.selectionStart && !el.selectionEnd) {
          // Note: Just setting `0, 0` doesn't fix the issue. Setting
          // `1, 1` fixes it for the first time that you type text and
          // then hold delete. Toggling to `1, 1` and then back to
          // `0, 0` seems to completely fix it.
          el.setSelectionRange(1, 1);
          el.setSelectionRange(0, 0);
        }
      }

      if (typeof restProps.onKeyUp === 'function') {
        restProps.onKeyUp(event);
      }
    },
    [restProps.onKeyUp, is('ios')]
  );

  const handleFocus = React.useCallback(
    /**
     * @param event {FocusEvent}
     */
    (event) => {
      if (!formField.focused && !readOnly) {
        dispatch({ type: FormFieldActions.SET_FOCUSED, data: true });
      }

      autocompleteOnFocus(event);

      if (typeof restProps.onFocus === 'function') {
        restProps.onFocus(event);
      }
    },
    [restProps.onFocus, formField.focused, readOnly, autocompleteOnFocus],
  );

  const handleKeyDown = React.useCallback(
    (event) => {
      autocompleteOnKeyDown(event);
      // Todo: add keydown event handler for datepicker
    },
    [autocompleteOnKeyDown],
  );

  const handleOnChange = React.useCallback(
    (event) => {
      restProps.onChange(event);
      autocompleteOnChange(event);
      // Todo: add change event handler for datepicker
    },
    [restProps.onChange, autocompleteOnChange],
  );

  const handleBlur = React.useCallback(
    /**
     * @param event {FocusEvent}
     */
    (event) => {
      if (formField.focused) {
        dispatch({ type: FormFieldActions.SET_FOCUSED, data: false });
      }

      autocompleteOnBlur(event);

      if (typeof restProps.onBlur === 'function') {
        restProps.onBlur(event);
      }
    },
    [restProps.onBlur, formField.focused, autocompleteOnBlur],
  );

  /**
   * On update
   */
  React.useEffect(() => {
    if (disabled && formField.focused) {
      dispatch({ type: FormFieldActions.SET_FOCUSED, data: false });
    }
  }, [disabled, formField.focused]);

  React.useEffect(() => {
    dispatch({ type: FormFieldActions.SET_PLACEHOLDER, data: placeholder });
  }, [placeholder]);

  React.useEffect(() => {
    dispatch({ type: FormFieldActions.SET_CONTROL_ID, data: finalId });
  }, [finalId]);

  React.useEffect(() => {
    dispatch({ type: FormFieldActions.SET_REQUIRED, data: required });
  }, [required]);

  const focus = React.useCallback(
    /**
     * @param {FocusOptions} [options]
     */
    (options) => {
      element.current.focus(options);
    },
    []
  );

  /**
   * Container click
   */
  const onContainerClick = React.useCallback(() => {
    if (!formField.focused) {
      focus();
    }
  }, [formField.focused]);

  React.useEffect(() => {
    dispatch({ type: FormFieldActions.SET_CONTAINER_CLICK, data: onContainerClick });
  }, [onContainerClick]);

  /**
   * Autosize props
   */
  const { style: autosizeStyle, rows, ...restAutosizeProps } = useAutosize(formField.control, {
    value: restProps.value,
    autosizeEnabled: restProps.autosizeEnabled && as === 'textarea',
    autosizeMinRows: restProps.autosizeMinRows,
    autosizeMaxRows: restProps.autosizeMaxRows,
  });

  return (
    <InputRoot
      {...restProps}
      {...restAutosizeProps}
      {...restAutocomplete}
      onKeyUp={onKeyUp}
      onChange={handleOnChange}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      as={as}
      id={finalId}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      readOnly={readOnly && as !== 'select' || null}
      type={type}
      rows={as === 'textarea' ? rows : null}
      style={{ ...__style, ...autosizeStyle }}
      aria-required={required}
      aria-describedby={formField.describedByIds.join(' ') || null}
      ref={attachInput}
      data-color={restProps.color}
    />
  );
}

Input.propTypes = {
  ...useAutosize.propTypes,
  id: PropTypes.string,
  style: PropTypes.object,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  as: PropTypes.oneOf(['select', 'input', 'textarea']),
  type: PropTypes.oneOf([
    'button',
    'checkbox',
    'color',
    'date',
    'datetime-local',
    'email',
    'file',
    'hidden',
    'image',
    'month',
    'number',
    'password',
    'radio',
    'range',
    'reset',
    'search',
    'submit',
    'tel',
    'text',
    'time',
    'url',
    'week',
  ]),
  /** Possible handlers */
  onKeyUp: PropTypes.func,
  color: PropTypes.string,
};

Input.defaultProps = {
  ...useAutosize.defaultProps,
  id: null,
  style: {},
  placeholder: '',
  required: false,
  disabled: false,
  readOnly: false,
  as: 'input',
  type: 'text',
  onKeyUp: null,
  color: 'primary',
};

export default Input;
