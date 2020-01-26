/**
 * @typedef {'altKey' | 'shiftKey' | 'ctrlKey' | 'metaKey'} ModifierKey
 */

/**
 * Checks whether a modifier key is pressed.
 * @param event {KeyboardEvent} Event to be checked.
 * @param modifiers {...ModifierKey}
 * @return {boolean}
 */
export function hasModifierKey(event, ...modifiers) {
  if (modifiers.length) {
    return modifiers.some(modifier => event[modifier]);
  }

  return event.altKey || event.shiftKey || event.ctrlKey || event.metaKey;
}
