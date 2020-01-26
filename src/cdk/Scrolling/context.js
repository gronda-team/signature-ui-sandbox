import * as React from 'react';
import noop from 'lodash/noop';

export const ViewportRulerContext = React.createContext({
  addChangeListener: noop,
  getViewportRect: noop,
  getViewportScrollPosition: noop,
  getViewportSize: noop,
});

export function useViewportRuler() {
  return React.useContext(ViewportRulerContext);
}

/**
 * Context types for scroll dispatcher
 */
const returnBlankArray = () => [];

export const ScrollDispatcherContext = React.createContext({
  register: noop,
  deregister: noop,
  handleScrollForGlobalListeners: noop,
  onScroll: noop,
  onAncestorScroll: noop,
  getAncestorScrollContainers: returnBlankArray,
});

export function useScrollDispatcher() {
  return React.useContext(ScrollDispatcherContext);
}
