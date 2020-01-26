import * as React from 'react';
import { useFormField } from '../FormField';

export function useAutocompleteState() {
  const [state] = useFormField();
  return React.useMemo(() => state.autocomplete, [state.autocomplete]);
}
