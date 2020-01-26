import * as React from 'react';
import noop from 'lodash/noop';
import { AutocompleteActions, useFormField } from '../FormField';
import { useAutocompleteState } from './context';

function useAutocomplete(element, props) {
  const usingAutocomplete = React.useMemo(() => (
    !!props['data-sui-autocomplete']
  ), [props['data-sui-autocomplete']]);

  const [state, dispatch] = useFormField();

  const autocomplete = useAutocompleteState();

  const disabled = React.useMemo(() => (
    props.autocompleteDisabled
  ), [props.autocompleteDisabled]);

  /** Whether the autocomplete panel can be opened */
  const canOpen = React.useMemo(() => (
    !props.readOnly && !props.disabled && !disabled
  ), [props.readOnly, props.disabled, disabled]);

  React.useEffect(() => {
    if (usingAutocomplete) {
      dispatch({
        type: AutocompleteActions.SET_CAN_OPEN_STATE,
        data: canOpen,
      });
    }
  }, [usingAutocomplete, canOpen]);


  return React.useMemo(() => {
    if (usingAutocomplete) {
      return {
        autoComplete: props.autoComplete || 'off',
        role: disabled ? null : 'combobox',
        'aria-autocomplete': disabled ? null : 'list',
        'aria-activedescendant': (autocomplete.panelOpen && autocomplete.activeOption) ?
          autocomplete.activeOption.id :
          null,
        'aria-expanded': disabled ? null : autocomplete.panelOpen,
        'aria-owns': (disabled || !autocomplete.panelOpen) ? null : autocomplete.id,
        'aria-haspopup': !disabled,
        onFocus: autocomplete.onFocus,
        onKeyDown: autocomplete.onKeyDown,
        onChange: autocomplete.onChange,
        onBlur: props.onTouched || noop,
      };
    }

    return {
      onFocus: noop,
      onKeyDown: noop,
      onChange: noop,
      onBlur: noop,
    };
  }, [
    usingAutocomplete,
    props.onTouched,
    props.autoComplete,
    disabled,
    autocomplete.id,
    autocomplete.panelOpen,
    autocomplete.activeOption,
    autocomplete.onFocus,
    autocomplete.onKeyDown,
    autocomplete.onChange,
  ]);
}

export default useAutocomplete;
