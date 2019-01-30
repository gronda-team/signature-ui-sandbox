/**
 * Checks whether a modifier key is pressed.
 * @param event Event to be checked.
 * @param modifiers Array of modifier keys
 */
export function hasModifierKey(event, ...modifiers) {
  if (modifiers.length) {
    return modifiers.some(modifier => event[modifier]);
  }

  return event.altKey || event.shiftKey || event.ctrlKey || event.metaKey;
}
