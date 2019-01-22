import { UI_ACTION_TYPES } from '../FormField/states';

export function onDisable() {
  if (this.transition) {
    this.transition(UI_ACTION_TYPES.DISABLE);
  }
}

export function onEnable() {
  if (this.transition) {
    this.transition(UI_ACTION_TYPES.ENABLE);
  }
}

export function handleDisabled(disabled) {
  disabled ? onDisable.call(this) : onEnable.call(this);
}

export default { onDisable, onEnable };