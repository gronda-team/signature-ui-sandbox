import * as React from 'react';
import noop from 'lodash/noop';

export const FocusMonitorContext = React.createContext({
  monitor: noop,
  stopMonitoring: noop,
  focusVia: noop,
});

export function useFocusMonitor() {
  return React.useContext(FocusMonitorContext);
}
