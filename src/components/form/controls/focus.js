import { UI_ACTION_TYPES } from '../FormField/states';

export function onFocus() {
  if (this.transition) {
    this.transition(UI_ACTION_TYPES.FOCUS);
  }
}

export function onBlur() {
  if (this.transition) {
    this.transition(UI_ACTION_TYPES.BLUR);
  }
}

export default { onFocus, onBlur };
