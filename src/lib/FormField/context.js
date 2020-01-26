import React from 'react';
import noop from 'lodash/noop';
import without from 'lodash/without';
import isEqual from 'lodash/isEqual';

export const AutocompleteActions = {
  SET_PANEL_ID: 'ac:SET_PANEL_ID',
  SET_CAN_OPEN_STATE: 'ac:SET_CAN_OPEN_STATE',
  SET_PANEL_OPEN_STATE: 'ac:SET_PANEL_OPEN_STATE',
  SET_ACTIVE_OPTION: 'ac:SET_ACTIVE_OPTION',
  SET_FOCUS_HANDLER: 'ac:SET_FOCUS_HANDLER',
  SET_KEYDOWN_HANDLER: 'ac:SET_KEYDOWN_HANDLER',
  SET_CHANGE_HANDLER: 'ac:SET_CHANGE_HANDLER',
};

const autocompleteInitialState = {
  id: null,
  canOpen: true,
  panelOpen: false,
  activeOption: null,
  onFocus: noop,
  onKeyDown: noop,
  onChange: noop,
};

function autocompleteReducer(state = autocompleteInitialState, action) {
  switch (action.type) {
    case AutocompleteActions.SET_ACTIVE_OPTION:
      if (isEqual(state.activeOption, action.data)) return state;
      return { ...state, activeOption: action.data };
    case AutocompleteActions.SET_CAN_OPEN_STATE:
      if (state.canOpen === action.data) return state;
      return { ...state, canOpen: action.data };
    case AutocompleteActions.SET_PANEL_OPEN_STATE:
      if (state.panelOpen === action.data) return state;
      return { ...state, panelOpen: action.data };
    case AutocompleteActions.SET_ATTACHED_STATE:
      if (state.panelOpen === action.data) return state;
      return { ...state, panelOpen: action.data };
    case AutocompleteActions.SET_FOCUS_HANDLER:
      if (state.onFocus === action.data) return state;
      return { ...state, onFocus: action.data };
    case AutocompleteActions.SET_KEYDOWN_HANDLER:
      if (state.onKeyDown === action.data) return state;
      return { ...state, onKeyDown: action.data };
    case AutocompleteActions.SET_CHANGE_HANDLER:
      if (state.onChange === action.data) return state;
      return { ...state, onChange: action.data };
    case AutocompleteActions.SET_PANEL_ID:
      if (state.id === action.data) return state;
      return { ...state, id: action.data };
    default: return state;
  }
}

export const FormFieldActions = {
  SET_ELEMENT: 'SET_ELEMENT',
  SET_CONNECTION_CONTAINER: 'SET_CONNECTION_CONTAINER',
  SET_CONTROL_ID: 'SET_CONTROL_ID',
  SET_CONTROL: 'SET_CONTROL',
  SET_FOCUSED: 'SET_FOCUSED',
  SET_PLACEHOLDER: 'SET_PLACEHOLDER',
  SET_DISABLED: 'SET_DISABLED',
  SET_REQUIRED: 'SET_REQUIRED',
  SET_CONTAINER_CLICK: 'SET_CONTAINER_CLICK',
  SET_AUTOFILL_STATE: 'SET_AUTOFILL_STATE',
  ADD_DESCRIBED_BY_ID: 'ADD_DESCRIBED_BY_ID',
  REMOVE_DESCRIBED_BY_ID: 'REMOVE_DESCRIBED_BY_ID',
  SET_SUBSCRIPT_CONTAINER: 'SET_SUBSCRIPT_CONTAINER',
  SET_LABEL_CONTAINER: 'SET_LABEL_CONTAINER',
  SET_IS_USER_PROVIDED_LABEL: 'SET_IS_USER_PROVIDED_LABEL',
};

/**
 * @typedef {Object} FormFieldControl
 * @property id {?string} HTML id for the underlying control
 * @property control {?HTMLElement} HTML element for the underlying control (usually an input
 * field)
 * @property disabled {boolean} Whether the control is disabled
 * @property required {boolean} Whether the control is required
 * @property placeholder {string} The control's placeholder
 * @property focused {boolean} Whether the control has focus
 * @property autofilled {boolean} Whether the control has been autofilled
 * @property onContainerClick {function(): void} Callback to be invoked when the container receives
 * mouse events
 * @property describedByIds {string[]} Array of described by ids for the form field control
 * @property subscriptContainer {?HTMLElement} The subscript container to use portals for
 * @property labelContainer {?HTMLElement} The label container to use portals for
 * @property userProvidedLabel {boolean} Whether the label was provided by the user or is an
 * alias for the input's placeholder property
 * @property autocomplete {Object} Context for the autocomplete to communicate between the hook
 * and the actual panel
 * @property formField {?Object} Actual form field element
 * @property connectionContainer {?Object} The wrapper to which an autocomplete can attach
 */

/** @type {FormFieldControl} */
export const initialState = {
  id: null,
  control: null,
  formField: null,
  connectionContainer: null,
  disabled: false,
  required: false,
  placeholder: '',
  focused: false,
  autofilled: false,
  onContainerClick: noop,
  describedByIds: [],
  subscriptContainer: null,
  labelContainer: null,
  userProvidedLabel: false,
  autocomplete: autocompleteInitialState,
};

/**
 * @param state {FormFieldControl}
 * @param action {{ type: string, data: * }}
 * @return {FormFieldControl}
 */
export function reducer(state, action) {
  if (action.type.startsWith('ac')) {
    const ac = autocompleteReducer(state.autocomplete, action);
    if (ac === state.autocomplete) return state;
    return { ...state, autocomplete: ac };
  }

  switch (action.type) {
    case FormFieldActions.SET_FOCUSED:
      if (action.data === state.focused) return state;
      return { ...state, focused: action.data };
    case FormFieldActions.SET_PLACEHOLDER:
      if (action.data === state.placeholder) return state;
      return { ...state, placeholder: action.data };
    case FormFieldActions.SET_DISABLED:
      if (action.data === state.disabled) return state;
      return { ...state, disabled: action.data };
    case FormFieldActions.SET_REQUIRED:
      if (action.data === state.required) return state;
      return { ...state, required: action.data };
    case FormFieldActions.SET_CONTAINER_CLICK:
      if (action.data === state.onContainerClick) return state;
      if (typeof action.data === 'function') {
        return { ...state, onContainerClick: action.data };
      }
      return state;
    case FormFieldActions.SET_AUTOFILL_STATE:
      if (action.data === state.autofilled) return state;
      return { ...state, autofilled: action.data };
    case FormFieldActions.ADD_DESCRIBED_BY_ID:
      if (!action.data || state.describedByIds.indexOf(action.data) > -1) return state;
      return { ...state, describedByIds: [...state.describedByIds, action.data] };
    case FormFieldActions.REMOVE_DESCRIBED_BY_ID:
      if (!action.data || state.describedByIds.indexOf(action.data) === -1) return state;
      return { ...state, describedByIds: without(state.describedByIds, action.data) };
    case FormFieldActions.SET_SUBSCRIPT_CONTAINER:
      if (action.data === state.subscriptContainer) return state;
      return { ...state, subscriptContainer: action.data };
    case FormFieldActions.SET_LABEL_CONTAINER:
      if (action.data === state.labelContainer) return state;
      return { ...state, labelContainer: action.data };
    case FormFieldActions.SET_IS_USER_PROVIDED_LABEL:
      if (action.data === state.userProvidedLabel) return state;
      return { ...state, userProvidedLabel: action.data };
    case FormFieldActions.SET_CONTROL_ID:
      if (action.data === state.id) return state;
      return { ...state, id: action.data };
    case FormFieldActions.SET_CONTROL:
      if (action.data === state.control) return state;
      return { ...state, control: action.data };
    case FormFieldActions.SET_CONNECTION_CONTAINER:
      if (action.data === state.connectionContainer) return state;
      return { ...state, connectionContainer: action.data };
    case FormFieldActions.SET_ELEMENT:
      if (action.data === state.formField) return state;
      return { ...state, formField: action.data };
    default: return state;
  }
}

export const FormFieldActionContext = React.createContext(noop);
export const FormFieldStateContext = React.createContext(initialState);

export function useFormField() {
  const dispatch = React.useContext(FormFieldActionContext);
  const state = React.useContext(FormFieldStateContext);

  return [state, dispatch];
}
