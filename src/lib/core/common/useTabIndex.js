import * as React from 'react';

/**
 * Mixin to use the proper tab index when a component is disabled.
 * @param tabIndex {number} The tab index to use
 * @param disabled {boolean} Whether the component is disabled
 * @param [defaultTabIndex] {number} The default tab index to use.
 */
export function useTabIndex(tabIndex, disabled, defaultTabIndex = 0) {
  return React.useMemo(() => (
    disabled ? -1 : (tabIndex || defaultTabIndex)
  ), [tabIndex, disabled, defaultTabIndex]);
}
