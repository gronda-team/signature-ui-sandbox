import * as React from 'react';
import noop from 'lodash/noop';
import isEqual from 'lodash/isEqual';

/**
 * @typedef {Object} OverlayState
 * @property dir {'ltr' | 'rtl'} Directionality of the overlay. Defaults to 'ltr'
 * @property hostAttributes {Object} List of attributes on the host element
 * @property paneAttributes {Object} List of attributes on the pane element
 * @property backdropAttributes {Object} List of attributes on the backdrop element. Used for
 * testing.
 * @property hostStyles {Object} The host element styles
 * @property paneStyles {Object} The pane element styles
 * @property backdropStyles {Object} The backdrop styles
 * @property host {?HTMLObject} The host div
 * @property pane {?HTMLObject} The pane div
 * @property backdrop {?HTMLObject} The backdrop element. Only used for destroying the previous
 * overlay that was in this place
 * @property scrollStrategyEnabled {boolean} Whether the overlay has an active scroll strategy
 * @property positionStrategyEnabled {boolean} Whether the overlay has an active position strategy
 * @property positionStrategyConfig {Object} The config required for the position strategy
 * @property scrollStrategyConfig {Object} The config required for the scroll strategy
 * @property created {boolean} Whether the overlay has been created (does not imply it's part
 * of the document just yet)
 * @property attached {boolean} Whether the overlay has been attached to the DOM
 * @property backdropShade {null | 'dark' | 'transparent'} The shade of the backdrop to use
 * @property backdropActive {boolean} Whether the backdrop is showing.
 * @property onBackdropClick {function} Callback to be invoked when the backdrop is clicked.
 * @property transformOriginStyle {string} Transform origin for nested components in the overlay
 * @property position {Object} Object of position strategy public API
 * @property position.apply {function} Apply position strategy
 * @property [position.reapplyLastPosition] {function} Reapply the last position from the
 * flexible connected position strategy
 */

/** @type {OverlayState} */
export const STATE_CONTEXT_INIT = {
  dir: 'ltr',
  hostAttributes: {},
  hostStyle: {},
  paneAttributes: {},
  paneStyles: {},
  backdropStyles: {},
  backdropAttributes: {},
  host: null,
  pane: null,
  backdrop: null,
  scrollStrategyEnabled: false,
  positionStrategyEnabled: false,
  positionStrategyConfig: {},
  scrollStrategyConfig: {},
  created: false,
  attached: false,
  backdropShade: null,
  backdropActive: false,
  onBackdropClick: noop,
  transformOriginStyle: '',
  position: {
    apply: noop,
    reapplyLastPosition: noop,
  },
};

export const OverlayContainerContext = React.createContext({
  getContainer: noop,
  addKeyDownListener: noop,
  removeKeyDownListener: noop,
  getCurrentListeners: noop,
});

export function useOverlayContainer() {
  const { getContainer } = React.useContext(OverlayContainerContext);
  return getContainer;
}

export function useKeyboardDispatcher() {
  const { addKeyDownListener, removeKeyDownListener } = React.useContext(OverlayContainerContext);
  return React.useMemo(
    () => ({ addKeyDownListener, removeKeyDownListener }),
    [addKeyDownListener, removeKeyDownListener],
  );
}

// Context and reducer for the overlay itself. Data is contained in the OverlayHost component,
// which provides a dispatch and the context object itself to its consumers.
export const OverlayActionContext = React.createContext(noop);
export const OverlayStateContext = React.createContext(STATE_CONTEXT_INIT);

export const OverlayActions = {
  ADD_HOST_ATTRIBUTES: 'ADD_HOST_ATTRIBUTES',
  ADD_HOST_STYLES: 'ADD_HOST_STYLES',
  SET_HOST_ATTRIBUTES: 'SET_HOST_ATTRIBUTES',
  SET_HOST_STYLES: 'SET_HOST_STYLES',
  SET_BACKDROP_STYLES: 'SET_BACKDROP_STYLES',
  SET_BACKDROP_ATTRIBUTES: 'SET_BACKDROP_ATTRIBUTES',
  ADD_PANE_ATTRIBUTES: 'ADD_PANE_ATTRIBUTES',
  ADD_PANE_STYLES: 'ADD_PANE_STYLES',
  SET_PANE_ATTRIBUTES: 'SET_PANE_ATTRIBUTES',
  REMOVE_PANE_ATTRIBUTES: 'REMOVE_PANE_ATTRIBUTES',
  SET_PANE_STYLES: 'SET_PANE_STYLES',
  SET_HOST: 'SET_HOST',
  SET_PANE: 'SET_PANE',
  SET_DIRECTIONALITY: 'SET_DIRECTIONALITY',
  SET_SCROLL_STRATEGY_ACTIVE: 'SET_SCROLL_STRATEGY_ACTIVE',
  SET_POSITION_STRATEGY_ACTIVE: 'SET_POSITION_STRATEGY_ACTIVE',
  SET_ATTACHED_STATE: 'SET_ATTACHED_STATE',
  SET_CREATED_STATE: 'SET_CREATED_STATE',
  SET_BACKDROP_CLICK: 'SET_BACKDROP_CLICK',
  SET_BACKDROP_SHADE: 'SET_BACKDROP_SHADE',
  SET_BACKDROP_VISIBILITY: 'SET_BACKDROP_VISIBILITY',
  SET_BACKDROP_EL: 'SET_BACKDROP_EL',
  UPDATE_SCROLL_STRATEGY_CONFIG: 'UPDATE_SCROLL_STRATEGY_CONFIG',
  UPDATE_POSITION_STRATEGY_CONFIG: 'UPDATE_POSITION_STRATEGY_CONFIG',
  SET_TRANSFORM_ORIGIN: 'SET_TRANSFORM_ORIGIN',
  UPDATE_POSITION_STRATEGY_CALLBACKS: 'UPDATE_POSITION_STRATEGY_CALLBACKS',
};

/**
 * @param state {Object}
 * @param prop {string}
 * @param data {Object}
 * @param [method] {'update' | 'replace'}
 * @return {*}
 */
function updateOrReplaceObject(state, prop, data, method = 'update') {
  const slice = state[prop];
  const intermediateState = method === 'update' ?
    { ...slice, ...data } :
    data;
  if (isEqual(intermediateState, slice)) return state;
  return { ...state, [prop]: intermediateState };
}

/**
 * The reducer in the host element.
 * @param state {OverlayState}
 * @param action {Object}
 * @return {OverlayState}
 */
export function overlayReducer(state, action) {
  let data;
  switch (action.type) {
    case OverlayActions.ADD_PANE_STYLES:
      return updateOrReplaceObject(state, 'paneStyles', action.data);
    case OverlayActions.SET_PANE_STYLES:
      return updateOrReplaceObject(state, 'paneStyles', action.data, 'replace');
    case OverlayActions.ADD_HOST_STYLES:
      return updateOrReplaceObject(state, 'hostStyles', action.data);
    case OverlayActions.SET_HOST_STYLES:
      return updateOrReplaceObject(state, 'hostStyles', action.data, 'replace');
    case OverlayActions.SET_BACKDROP_STYLES:
      return updateOrReplaceObject(state, 'backdropStyles', action.data, 'replace');
    case OverlayActions.ADD_PANE_ATTRIBUTES:
      return updateOrReplaceObject(state, 'paneAttributes', action.data);
    case OverlayActions.SET_PANE_ATTRIBUTES:
      return updateOrReplaceObject(state, 'paneAttributes', action.data, 'replace');
    case OverlayActions.REMOVE_PANE_ATTRIBUTES:
      data = { ...state.paneAttributes };
      action.data.forEach((key) => {
        delete data[key];
      });

      return { ...state, paneAttributes: data };
    case OverlayActions.ADD_HOST_ATTRIBUTES:
      return updateOrReplaceObject(state, 'hostAttributes', action.data);
    case OverlayActions.SET_HOST_ATTRIBUTES:
      return updateOrReplaceObject(state, 'hostAttributes', action.data, 'replace');
    case OverlayActions.SET_BACKDROP_ATTRIBUTES:
      return updateOrReplaceObject(state, 'backdropAttributes', action.data, 'replace');
    case OverlayActions.UPDATE_POSITION_STRATEGY_CALLBACKS:
      if (
        state.position.apply === action.data.apply
        && state.position.reapplyLastPosition === action.data.reapplyLastPosition
      ) {
        return state;
      }

      return { ...state, position: action.data };
    case OverlayActions.SET_PANE:
      if (state.pane === action.data) return state;
      return { ...state, pane: action.data };
    case OverlayActions.SET_HOST:
      if (state.host === action.data) return state;
      return { ...state, host: action.data };
    case OverlayActions.SET_BACKDROP_EL:
      if (state.backdrop === action.data) return state;
      return { ...state, backdrop: action.data };
    case OverlayActions.SET_SCROLL_STRATEGY_ACTIVE:
      if (state.scrollStrategyEnabled === action.data) return state;
      return { ...state, scrollStrategyEnabled: action.data };
    case OverlayActions.SET_POSITION_STRATEGY_ACTIVE:
      if (state.positionStrategyEnabled === action.data) return state;
      return { ...state, positionStrategyEnabled: action.data };
    case OverlayActions.UPDATE_POSITION_STRATEGY_CONFIG:
      return updateOrReplaceObject(state, 'positionStrategyConfig', action.data, 'replace');
    case OverlayActions.UPDATE_SCROLL_STRATEGY_CONFIG:
      return updateOrReplaceObject(state, 'scrollStrategyConfig', action.data, 'replace');
    case OverlayActions.SET_ATTACHED_STATE:
      if (state.attached === action.data) return state;
      return { ...state, attached: action.data };
    case OverlayActions.SET_CREATED_STATE:
      if (state.created === action.data) return state;
      return { ...state, created: action.data };
    case OverlayActions.SET_BACKDROP_SHADE:
      if (state.backdropShade === action.data) return state;
      return { ...state, backdropShade: action.data };
    case OverlayActions.SET_BACKDROP_VISIBILITY:
      if (state.backdropActive === action.data) return state;
      return { ...state, backdropActive: action.data };
    case OverlayActions.SET_BACKDROP_CLICK:
      if (state.onBackdropClick === action.data) return state;
      return { ...state, onBackdropClick: action.data };
    case OverlayActions.SET_DIRECTIONALITY:
      if (state.dir === action.data || (action.data !== 'ltr' && action.data !== 'rtl')) {
        return state;
      }

      return { ...state, dir: action.data };
    case OverlayActions.SET_TRANSFORM_ORIGIN:
      if (state.transformOriginStyle === action.data) return state;
      return { ...state, transformOriginStyle: action.data };
    default: return state;
  }
}
