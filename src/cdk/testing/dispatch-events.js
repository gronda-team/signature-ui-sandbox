/** Shorthand to dispatch a keyboard event with a specified key code. */
import {createKeyboardEvent} from './event-objects';

export function dispatchKeyboardEvent(node, type, keyCode, target) {
  return dispatchEvent(node, createKeyboardEvent(type, keyCode, target));
}
