import * as React from 'react';
import noop from 'lodash/noop';

export const ButtonToggleContext = React.createContext({
  id: null,
  name: null,
  appearance: 'standard',
  color: null,
  disabled: false,
  multiple: false,
  isSelected: noop,
  select: noop,
  onTouched: noop,
});
